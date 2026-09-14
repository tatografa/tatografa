-- Reps Club · Dívida técnica · `auth.uid()` avaliado uma vez, não por linha
--
-- O Postgres reavalia `auth.uid()` **a cada linha** quando ele aparece solto
-- numa policy. Embrulhado num subselect — `(select auth.uid())` — ele vira um
-- InitPlan: uma chamada por consulta, e o resultado é reusado em todas as
-- linhas. A correção é mecânica e está na documentação do Supabase
-- (`auth_rls_initplan`); a semântica não muda, porque `auth.uid()` é `stable` e
-- depende só do JWT da requisição, nunca da linha.
--
-- São **30 policies**: as 27 que o advisor aponta em `public` mais as 3 de
-- `storage.objects`, que ele não enxerga e que sofrem do mesmo. A do bucket é a
-- que mais importa de todas na prática — ela roda por arquivo, e é ela que
-- decide se a foto de um aluno abre para um colega.
--
-- **Por que agora.** O ganho com 2 alunos e 37 séries é zero; o problema
-- aparece com milhares de linhas, e mexer na camada de acesso inteira é mais
-- barato agora, com o banco pequeno e as provas de burla fresquinhas, do que
-- depois.
--
-- **Como este arquivo foi escrito.** O SQL abaixo **não foi digitado**: foi
-- gerado a partir de `pg_policy` do banco vivo, com `pg_get_expr` devolvendo a
-- expressão exata de cada policy e um `replace` de duas trocas. Escrever 30
-- policies à mão é o tipo de tarefa em que um parêntese fora do lugar afrouxa
-- uma regra em silêncio — e o `and` da 0019 vira `or` sem ninguém notar.
--
-- As duas trocas são:
--   auth.uid()                →  (select auth.uid())
--   private.my_trainer_id()   →  (select private.my_trainer_id())
--
-- A segunda entra porque `my_trainer_id()` também não recebe nada da linha.
-- Os outros helpers (`trainer_of`, `can_read_workout`, `pode_ver_post`,
-- `mesociclo_tem_historico`) **ficam como estão**: recebem uma coluna como
-- argumento, então rodar por linha é o trabalho deles.
--
-- Um cuidado da 0010 continua valendo: `my_trainer_id()` é `stable` e enxerga a
-- linha do snapshot do statement, isto é, o `trainer_id` de **antes** do update.
-- O subselect não muda isso — InitPlan também roda no mesmo snapshot —, e é
-- disso que depende o aluno editar o próprio perfil sem poder trocar de
-- personal.
--
-- Reversível: cada bloco é `drop policy` + `create policy`, e a versão anterior
-- é esta mesma sem os dois `select`. Nenhum dado é alterado ou apagado.

drop policy exercises_select on public.exercises;

create policy exercises_select on public.exercises for select to authenticated
  using (((trainer_id = (select auth.uid())) OR (trainer_id = (select private.my_trainer_id()))));

drop policy exercises_write on public.exercises;

create policy exercises_write on public.exercises for all to authenticated
  using ((trainer_id = (select auth.uid())))
  with check ((trainer_id = (select auth.uid())));

drop policy invites_all on public.invites;

create policy invites_all on public.invites for all to authenticated
  using ((trainer_id = (select auth.uid())))
  with check ((trainer_id = (select auth.uid())));

drop policy mesocycles_delete on public.mesocycles;

create policy mesocycles_delete on public.mesocycles for delete to authenticated
  using (((trainer_id = (select auth.uid())) AND private.trainer_of(student_id) AND (NOT private.mesociclo_tem_historico(id))));

drop policy mesocycles_insert on public.mesocycles;

create policy mesocycles_insert on public.mesocycles for insert to authenticated
  with check (((trainer_id = (select auth.uid())) AND private.trainer_of(student_id)));

drop policy mesocycles_select on public.mesocycles;

create policy mesocycles_select on public.mesocycles for select to authenticated
  using (((student_id = (select auth.uid())) OR (trainer_id = (select auth.uid()))));

drop policy mesocycles_update on public.mesocycles;

create policy mesocycles_update on public.mesocycles for update to authenticated
  using (((trainer_id = (select auth.uid())) AND private.trainer_of(student_id)))
  with check (((trainer_id = (select auth.uid())) AND private.trainer_of(student_id)));

drop policy post_comments_delete on public.post_comments;

create policy post_comments_delete on public.post_comments for delete to authenticated
  using ((author_id = (select auth.uid())));

drop policy post_comments_insert on public.post_comments;

create policy post_comments_insert on public.post_comments for insert to authenticated
  with check (((author_id = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM posts p
  WHERE ((p.id = post_comments.post_id) AND private.pode_ver_post(p.student_id, p.visibility))))));

drop policy post_likes_delete on public.post_likes;

create policy post_likes_delete on public.post_likes for delete to authenticated
  using ((user_id = (select auth.uid())));

drop policy post_likes_insert on public.post_likes;

create policy post_likes_insert on public.post_likes for insert to authenticated
  with check (((user_id = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM posts p
  WHERE ((p.id = post_likes.post_id) AND private.pode_ver_post(p.student_id, p.visibility))))));

drop policy posts_delete on public.posts;

create policy posts_delete on public.posts for delete to authenticated
  using ((student_id = (select auth.uid())));

drop policy posts_insert on public.posts;

create policy posts_insert on public.posts for insert to authenticated
  with check ((student_id = (select auth.uid())));

drop policy posts_update on public.posts;

create policy posts_update on public.posts for update to authenticated
  using ((student_id = (select auth.uid())))
  with check ((student_id = (select auth.uid())));

drop policy students_delete on public.students;

create policy students_delete on public.students for delete to authenticated
  using ((trainer_id = (select auth.uid())));

drop policy students_insert on public.students;

create policy students_insert on public.students for insert to authenticated
  with check (((id = (select auth.uid())) AND (trainer_id = (select auth.uid()))));

drop policy students_select on public.students;

create policy students_select on public.students for select to authenticated
  using (((id = (select auth.uid())) OR (trainer_id = (select auth.uid()))));

drop policy students_update on public.students;

create policy students_update on public.students for update to authenticated
  using (((id = (select auth.uid())) OR (trainer_id = (select auth.uid()))))
  with check (((trainer_id = (select auth.uid())) OR ((id = (select auth.uid())) AND (trainer_id = (select private.my_trainer_id())))));

drop policy term_acceptances_insert on public.term_acceptances;

create policy term_acceptances_insert on public.term_acceptances for insert to authenticated
  with check ((user_id = (select auth.uid())));

drop policy term_acceptances_select on public.term_acceptances;

create policy term_acceptances_select on public.term_acceptances for select to authenticated
  using ((user_id = (select auth.uid())));

drop policy trainers_insert on public.trainers;

create policy trainers_insert on public.trainers for insert to authenticated
  with check ((id = (select auth.uid())));

drop policy trainers_select on public.trainers;

create policy trainers_select on public.trainers for select to authenticated
  using (((id = (select auth.uid())) OR (id = (select private.my_trainer_id()))));

drop policy trainers_update on public.trainers;

create policy trainers_update on public.trainers for update to authenticated
  using ((id = (select auth.uid())))
  with check ((id = (select auth.uid())));

drop policy workout_sessions_delete on public.workout_sessions;

create policy workout_sessions_delete on public.workout_sessions for delete to authenticated
  using (((student_id = (select auth.uid())) AND (finished_at IS NULL)));

drop policy workout_sessions_insert on public.workout_sessions;

create policy workout_sessions_insert on public.workout_sessions for insert to authenticated
  with check (((student_id = (select auth.uid())) AND private.can_read_workout(workout_id)));

drop policy workout_sessions_select on public.workout_sessions;

create policy workout_sessions_select on public.workout_sessions for select to authenticated
  using (((student_id = (select auth.uid())) OR private.trainer_of(student_id)));

drop policy workout_sessions_update on public.workout_sessions;

create policy workout_sessions_update on public.workout_sessions for update to authenticated
  using ((student_id = (select auth.uid())))
  with check (((student_id = (select auth.uid())) AND private.can_read_workout(workout_id)));

drop policy "treinos: aluno apaga a propria foto" on storage.objects;

create policy "treinos: aluno apaga a propria foto" on storage.objects for delete to authenticated
  using (((bucket_id = 'treinos'::text) AND ((storage.foldername(name))[1] = ((select auth.uid()))::text)));

drop policy "treinos: aluno escreve na propria pasta" on storage.objects;

create policy "treinos: aluno escreve na propria pasta" on storage.objects for insert to authenticated
  with check (((bucket_id = 'treinos'::text) AND ((storage.foldername(name))[1] = ((select auth.uid()))::text)));

drop policy "treinos: ve a propria foto ou a de post visivel" on storage.objects;

create policy "treinos: ve a propria foto ou a de post visivel" on storage.objects for select to authenticated
  using (((bucket_id = 'treinos'::text) AND (((storage.foldername(name))[1] = ((select auth.uid()))::text) OR (EXISTS ( SELECT 1
   FROM posts p
  WHERE ((p.photo_path = objects.name) AND private.pode_ver_post(p.student_id, p.visibility)))))));

-- ------------------------------------------ comentários que o drop levou ----
--
-- `comment on policy` não sobrevive a um `drop policy`. Estes sete são a
-- memória de por que a regra é como é — cada um veio de um furo real — e
-- perdê-los num commit de performance seria a pior parte deste commit.
comment on policy mesocycles_insert on public.mesocycles is
  'Só o personal do próprio aluno cria programa: trainer_id sozinho deixa prescrever para aluno alheio (0007).';
comment on policy mesocycles_update on public.mesocycles is
  'O relacionamento é conferido no update também: senão insere legítimo e troca o student_id depois.';
comment on policy mesocycles_delete on public.mesocycles is
  'Programa com sessão executada não se apaga, se arquiva: o delete levaria as séries do aluno por cascata.';
comment on policy students_insert on public.students is
  'Só o personal virando aluno de si mesmo. O aluno de verdade nasce no gatilho, que não passa por policy. O `and` é a trava: com `or`, o trainer_id ficaria livre (furo da 0010).';
comment on policy students_update on public.students is
  'O aluno edita o próprio perfil mas não troca o trainer_id; trocar de personal é do lado de quem convida.';
comment on policy workout_sessions_update on public.workout_sessions is
  'Dono da sessão E treino que o aluno pode ler: sem isto, trocar workout_id contornava a trava da 0009.';
comment on policy workout_sessions_delete on public.workout_sessions is
  'Só sessão em andamento: apagar sessão concluída levaria as séries por cascata, e histórico não se apaga.';

-- --------------------------------- chaves estrangeiras sem índice ----------
--
-- O advisor aponta três, e as três valem — mas por motivos diferentes, e é o
-- motivo que decide, não o aviso:
--
--   `post_comments(author_id)` — `post_comments_delete` filtra por ela, e o
--     `on delete cascade` de `auth.users` varre a tabela a cada conta apagada.
--   `post_likes(user_id)` — a chave primária começa por `post_id`, então o
--     filtro por usuário sozinho (as "minhas curtidas" do feed, e o descurtir)
--     não é coberto por ela.
--   `posts(session_id)` — nada lê por ela, mas o `on delete set null` varre
--     `posts` toda vez que uma sessão é descartada. E sessão vazia é descartada
--     **toda vez que o aluno começa outro treino** — é caminho quente.
create index post_comments_author_idx on public.post_comments (author_id);
create index post_likes_user_idx      on public.post_likes (user_id);
create index posts_session_idx        on public.posts (session_id);
