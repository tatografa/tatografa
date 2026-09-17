-- O personal também aceita os termos (decisão do Otávio, 17/09).
--
-- **O aceite estava escrito só para o aluno.** `private.handle_new_user` grava
-- `term_acceptances` a partir de `termos_versao` — mas o bloco mora **dentro do
-- ramo do aluno**, e o ramo do personal dá `return new` antes de chegar lá. O
-- resultado: nenhum personal jamais teve linha de aceite, embora os termos
-- falem dele em cada seção ("o que é responsabilidade sua e do seu personal").
--
-- Não é caso de policy: `term_acceptances_insert` sempre foi
-- `user_id = auth.uid()`, neutro de papel. O que faltava era o caminho.
--
-- **O bloco sobe para antes dos ramos.** Um lugar só em vez de uma cópia por
-- papel: duas cópias divergiriam no dia em que a tabela ganhasse um terceiro
-- documento, e o papel que ficasse para trás seria descoberto por auditoria,
-- não por erro de tela.
--
-- O `nullif` continua sendo a porta: conta criada sem `termos_versao` no
-- metadado não grava aceite nenhum, e o portão do layout a pega na primeira
-- visita. É esse portão que cobre o personal que **já existe** — o gatilho só
-- alcança quem nasce depois desta migration.
--
-- Reversível: a versão anterior da função recria o estado antigo. Nenhuma linha
-- é alterada por esta migration.

create or replace function private.handle_new_user()
  returns trigger
  language plpgsql security definer set search_path = public
as $$
declare
  v_papel   text := new.raw_user_meta_data ->> 'role';
  v_dados   jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_convite public.invites%rowtype;
  v_versao  text;
begin
  -- Vale para os dois papéis, e por isso vem antes de qualquer `return`.
  -- A data não entra aqui: `private.carimba_aceite` carimba com o relógio do
  -- banco, senão um POST direto gravaria aceite anterior à mudança do texto.
  v_versao := nullif(v_dados ->> 'termos_versao', '');
  if v_versao is not null then
    insert into public.term_acceptances (user_id, documento, versao)
    values (new.id, 'termos', v_versao), (new.id, 'privacidade', v_versao)
    on conflict do nothing;
  end if;

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
    select * into v_convite
      from public.invites
     where token = v_dados ->> 'invite_token'
       and accepted_at is null
       and expires_at > now()
       for update;

    if not found then
      raise exception 'convite_invalido' using errcode = '22023';
    end if;

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

comment on function private.handle_new_user() is
  'Cria a linha de trainers ou students conforme o papel, e grava o aceite dos documentos — que vale para os dois.';
