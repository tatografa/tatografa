-- Reps Club · Fase 1 · Convite e entrada do aluno
--
-- Três coisas:
--   1. Peso e altura no perfil do aluno (etapa 2 do onboarding, doc 05).
--   2. Leitura do convite sem sessão, por uma função estreita em vez da chave
--      de serviço.
--   3. O gatilho de novo usuário passa a criar aluno, não só personal.

-- ------------------------------------------------- 1. perfil do aluno ------
-- O doc 03 guarda peso histórico em `assessments` (fase 3). Aqui é só o valor
-- atual que o aluno informa no onboarding e o personal usa para montar treino.
alter table public.students
  add column weight_kg numeric(5, 2) check (weight_kg > 0 and weight_kg < 500),
  add column height_cm integer       check (height_cm > 0 and height_cm < 300);

comment on column public.students.weight_kg is 'Peso atual informado pelo aluno. Série histórica fica em assessments.';

-- --------------------------------------------- 2. leitura do convite -------
-- O visitante em /convite/[token] ainda não tem sessão, então o RLS de
-- `invites` (que exige ser o personal dono) barra a leitura.
--
-- A alternativa óbvia seria ler com a chave de serviço no servidor. Esta função
-- é mais estreita: devolve só a linha do token exato, só enquanto o convite
-- estiver pendente e válido, e só três campos. A chave de serviço ignoraria o
-- RLS do banco inteiro — se vazasse do ambiente, seria acesso total. O token
-- tem 192 bits de entropia; adivinhar não é caminho.
create function public.convite_por_token(p_token text)
  returns table (nome text, email text, personal text)
  language sql stable security definer set search_path = public
as $$
  select i.name, i.email, t.name
    from public.invites i
    join public.trainers t on t.id = i.trainer_id
   where i.token = p_token
     and i.accepted_at is null
     and i.expires_at > now()
$$;

comment on function public.convite_por_token(text) is
  'Convite pendente pelo token. Zero linhas = inexistente, já usado ou expirado.';

-- Esta é API de propósito, ao contrário dos helpers de RLS em `private`:
-- quem abre o link ainda é anônimo.
grant execute on function public.convite_por_token(text) to anon, authenticated;

-- ----------------------------------------------------- 3. gatilho ----------
-- O aluno nasce da mesma forma que o personal: pelo gatilho, atômico com a
-- criação do usuário. A diferença é que o convite precisa ser validado e
-- consumido na mesma transação — dois alunos não podem nascer do mesmo token.
create or replace function private.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
as $$
declare
  v_papel   text := new.raw_user_meta_data ->> 'role';
  v_dados   jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_convite public.invites%rowtype;
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

    update public.invites set accepted_at = now() where id = v_convite.id;
  end if;

  return new;
end;
$$;
