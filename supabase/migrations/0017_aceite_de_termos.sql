-- Registro de aceite dos termos e da política de privacidade.
--
-- **Por que tabela e não coluna em `students`.** `students_update` deixa o
-- aluno editar a própria linha (`id = auth.uid()`), e uma coluna de aceite ali
-- seria prova que o próprio aceitante pode reescrever — o que não é prova.
-- Aqui não existe policy de update nem de delete: ninguém altera, ninguém
-- apaga, nem o dono da linha.
--
-- **Por que uma linha por versão.** Quando o texto mudar, o aceite antigo não
-- vale para o novo — é preciso pedir de novo, e guardar os dois. Um campo
-- sobrescrito perderia o histórico justamente no dia em que ele importa.

create table public.term_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  documento text not null check (documento in ('termos', 'privacidade')),
  versao text not null,
  aceito_em timestamptz not null default now(),
  unique (user_id, documento, versao)
);

comment on table public.term_acceptances is
  'Log append-only de aceite. Sem update e sem delete de propósito: aceite que o aceitante reescreve não prova nada.';
comment on column public.term_acceptances.versao is
  'A versão do texto aceito, no formato AAAA-MM-DD. Texto novo exige aceite novo.';

alter table public.term_acceptances enable row level security;

-- Leitura: cada um vê o próprio aceite. O personal **não** vê o do aluno — a
-- prova é do titular e de quem opera o serviço, não de quem treina o titular.
create policy term_acceptances_select on public.term_acceptances
  for select to authenticated
  using (user_id = auth.uid());

create policy term_acceptances_insert on public.term_acceptances
  for insert to authenticated
  with check (user_id = auth.uid());

-- Nenhuma policy de update ou delete. Com RLS ligado, a ausência é a proibição.

-- `aceito_em` vem do relógio do banco, sempre.
--
-- Sem isto, um POST direto gravaria a data que quisesse — inclusive uma
-- anterior a uma mudança de texto, "provando" aceite de algo que ainda não
-- existia. A coluna tem default, mas default só vale para quem omite o campo.
create or replace function private.carimba_aceite()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.aceito_em := now();
  return new;
end;
$$;

create trigger term_acceptances_carimba
  before insert on public.term_acceptances
  for each row execute function private.carimba_aceite();

-- O aluno nasce por gatilho (`security definer`), não por insert do cliente:
-- no fluxo de confirmação por e-mail o `signUp` não devolve sessão, então não
-- há `auth.uid()` para a policy de insert aprovar. O aceite entra junto com a
-- linha de `students`, pelo mesmo caminho e na mesma transação.
create index term_acceptances_user_idx
  on public.term_acceptances (user_id, documento);

-- ------------------------------------------------ gatilho de criação --------
-- Reescreve `private.handle_new_user` só para gravar o aceite do aluno junto
-- com a linha de `students`, na mesma transação. O resto do corpo é idêntico
-- ao da migration 0006 — repetido porque `create or replace` substitui a
-- função inteira, não um trecho.
create or replace function private.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
as $$
declare
  v_papel   text := new.raw_user_meta_data ->> 'role';
  v_dados   jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_convite public.invites%rowtype;
  v_versao  text;
begin
  if v_papel = 'personal' then
    insert into public.trainers (id, name, email)
    values (
      new.id,
      coalesce(nullif(v_dados ->> 'name', ''), split_part(new.email, '@', 1)),
      new.email
    )
    on conflict do nothing;

    return new;
  end if;

  if v_papel = 'aluno' then
    -- `for update` serializa duas tentativas simultâneas com o mesmo token: a
    -- segunda só enxerga a linha depois do commit da primeira, já com
    -- accepted_at preenchido, e cai no `not found`.
    select * into v_convite
      from public.invites
     where token = v_dados ->> 'invite_token'
       and accepted_at is null
       and expires_at > now()
       for update;

    if not found then
      raise exception 'convite_invalido' using errcode = '22023';
    end if;

    -- O formulário mostra o e-mail travado, vindo do convite. Conferir aqui
    -- impede que um cliente adulterado troque o e-mail e entre na carteira do
    -- personal com outro endereço.
    if lower(new.email) is distinct from lower(v_convite.email) then
      raise exception 'convite_email_divergente' using errcode = '22023';
    end if;

    insert into public.students (
      id, trainer_id, name, email,
      birth_date, goal, experience_level, weight_kg, height_cm,
      status, onboarded_at
    )
    values (
      new.id,
      v_convite.trainer_id,
      coalesce(nullif(v_dados ->> 'name', ''), v_convite.name),
      v_convite.email,
      nullif(v_dados ->> 'birth_date', '')::date,
      nullif(v_dados ->> 'goal', '')::public.student_goal,
      nullif(v_dados ->> 'experience_level', '')::public.experience_level,
      nullif(v_dados ->> 'weight_kg', '')::numeric,
      nullif(v_dados ->> 'height_cm', '')::integer,
      'ativo',
      now()
    );

    -- A versão vem do formulário, mas a **data** vem do relógio do banco, pelo
    -- gatilho `term_acceptances_carimba`. Aceite sem versão não é gravado: é
    -- melhor não ter registro do que ter um registro que não diz de quê.
    v_versao := nullif(v_dados ->> 'termos_versao', '');
    if v_versao is not null then
      insert into public.term_acceptances (user_id, documento, versao)
      values (new.id, 'termos', v_versao), (new.id, 'privacidade', v_versao)
      on conflict do nothing;
    end if;

    update public.invites set accepted_at = now() where id = v_convite.id;
  end if;

  return new;
end;
$$;
