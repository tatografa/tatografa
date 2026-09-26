-- Reps Club · Aluno arquivado sai da turma do feed
--
-- **O defeito:** `students.status` tem três valores, e o feed nunca olhou para
-- ele. O personal arquiva um aluno — a carteira mostra "Inativo", o dashboard
-- para de contá-lo, o alerta de inatividade o pula — e no app dele **nada
-- muda**: ele continua vendo a foto, a legenda e os comentários de toda a turma,
-- e continua publicando para ela. Não é uma decisão antiga que ficou para trás;
-- é uma pergunta que nenhuma tela nem nenhuma policy chegou a fazer.
--
-- A política de privacidade, publicada e aceita, é explícita: "**Os outros
-- alunos do seu personal**, e apenas eles, veem os posts que você marcou para a
-- turma". Quem foi arquivado não é mais aluno daquele personal — o resto do
-- produto já trata `ativo` como "é meu aluno". O feed é que discordava.
--
-- **Filtra quem OLHA, não quem escreveu.** As duas leituras são diferentes e a
-- escolha é deliberada: o arquivado deixa de ver a turma, mas os posts que ele
-- já publicou continuam visíveis para quem já os via. Filtrar pelo autor
-- apagaria da tela dos colegas um post que eles viram ontem, comentaram e
-- curtiram — a promessa da política foi feita a **eles** também, e histórico
-- não desaparece porque um terceiro mudou de status.
--
-- **Publicar para a turma exige estar nela**, senão a regra fica torta ao
-- contrário: o arquivado não veria ninguém e todo mundo continuaria vendo os
-- posts novos dele. O canal privado com o personal (`visibility = 'personal'`)
-- continua aberto de propósito — é por onde alguém arquivado por engano diz
-- isso.

-- ----------------------------------------------------- a turma de quem olha --
--
-- Helper **novo e estreito**, e não uma mudança em `private.my_trainer_id()`.
-- Aquele é usado por `students_update` (no `with check`!), `trainers_select` e
-- `exercises_select`: se ele passasse a devolver nulo para o arquivado, o aluno
-- perderia a edição do próprio perfil e deixaria de enxergar a linha do próprio
-- personal. Trava certa no lugar errado é como se estraga uma tela que
-- funcionava.

create function private.minha_turma()
  returns uuid
  language sql
  stable
  security definer
  set search_path = public
as $$
  select trainer_id
    from public.students
   where id = (select auth.uid())
     and status = 'ativo'
$$;

comment on function private.minha_turma() is
  'O personal de quem está olhando, só enquanto ele for aluno ATIVO. Quem foi arquivado não tem turma. Não confundir com my_trainer_id(), que vale para qualquer status e sustenta students_update.';

-- --------------------------------------------- quem vê o post, e o nome dele --
--
-- As duas funções trocam `my_trainer_id()` por `minha_turma()` **no mesmo
-- ramo**, porque elas respondem à mesma pergunta de lados diferentes. Se
-- discordarem, aparece post sem nome ou nome sem post — foi por isso que a
-- 0020 nasceu.
--
-- Consertar `pode_ver_post` conserta junto, de graça, tudo o que passa por ela:
-- `posts_select`, `post_comments_select`, `post_comments_insert`,
-- `post_likes_select`, `post_likes_insert` e a policy de leitura do bucket
-- `treinos` — ou seja, **a foto também**. É o ganho de a regra morar num lugar
-- só.

create or replace function private.pode_ver_post(
  p_student_id uuid,
  p_visibility post_visibility
)
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select
    p_student_id = (select auth.uid())
    or private.trainer_of(p_student_id)
    or (
      p_visibility = 'publico'
      and private.minha_turma() is not null
      and private.minha_turma()
          = (select trainer_id from public.students where id = p_student_id)
    )
$$;

create or replace function public.nomes_no_feed(p_ids uuid[])
  returns table (id uuid, name text)
  language sql
  stable
  security definer
  set search_path = public
as $$
  select s.id, s.name
    from public.students s
   where s.id = any(p_ids)
     and (
       s.id = (select auth.uid())
       or s.trainer_id = (select auth.uid())
       or (private.minha_turma() is not null
           and s.trainer_id = private.minha_turma())
     )
$$;

-- ------------------------------------------ publicar para a turma exige turma --
--
-- Insert **e** update, e não só o insert. Sétima vez que o mesmo formato
-- aparece neste banco (0007, 0009, 0010, 0019, 0022, 0030) — e a primeira em
-- que eu o criaria sozinho: trancar só o insert deixaria o arquivado gravar
-- como `personal` e, na linha seguinte, virar `publico` por update.

drop policy posts_insert on public.posts;

create policy posts_insert on public.posts for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and (session_id is null or private.owns_session(session_id))
    and (visibility = 'personal' or private.minha_turma() is not null)
  );

drop policy posts_update on public.posts;

create policy posts_update on public.posts for update to authenticated
  using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid())
    and (session_id is null or private.owns_session(session_id))
    and (visibility = 'personal' or private.minha_turma() is not null)
  );

-- `comment on policy` não sobrevive a `drop policy`: os dois voltam aqui.
comment on policy posts_insert on public.posts is
  'Post do próprio aluno, apontando para sessão dele, e para a turma só se ele ainda estiver nela.';
comment on policy posts_update on public.posts is
  'Mesma regra do insert: sem isto, gravar como personal e virar publico por update contornaria a trava.';
