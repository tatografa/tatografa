-- Reps Club · Aluno inativo não escreve nada
--
-- Decisão do Otávio (26/09): **aluno inativo perde o acesso ao app.** O dado
-- histórico fica — não se apaga nada —, mas o login passa a ser limitado até
-- ele voltar a pagar.
--
-- A 0035 tirou o arquivado da turma do feed. Esta fecha o resto: ele não começa
-- treino, não publica, não comenta, não curte e não responde reavaliação.
--
-- **O que continua, e não por esquecimento:** ler o próprio histórico, ler o
-- próprio perfil e **editá-lo**. A política de privacidade publicada promete,
-- em "Seus direitos", que "seu perfil e seu histórico estão todos lá, o perfil
-- é editável" — corrigir dado errado sobre si é direito da LGPD, e não é o tipo
-- de coisa que se suspende por inadimplência. Trancar isso faria do texto
-- publicado uma mentira, que é o defeito que este projeto já cometeu três
-- vezes na direção oposta.
--
-- A trava de verdade é esta; o portão na tela é a explicação. Um POST direto
-- não passa por tela nenhuma.

-- ------------------------------------------------------------ o helper -----
--
-- Definido **sobre `minha_turma()`** (0035) de propósito, e não com um
-- `status = 'ativo'` de novo. Duas cópias da mesma condição divergem no dia em
-- que "ativo" deixar de ser o único valor que vale — e aí uma tela liberaria o
-- que a outra recusa, em silêncio. Uma pergunta, um lugar.

create function private.aluno_ativo()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select private.minha_turma() is not null
$$;

comment on function private.aluno_ativo() is
  'Quem está logado é aluno ativo? Escrito sobre minha_turma() para "ativo" ser definido num lugar só.';

-- -------------------------------------------------- não começa treino ------
--
-- Só o **insert**. O `update` fica livre de propósito: quem for arquivado com
-- um treino aberto no celular precisa conseguir fechá-lo e mandar as séries que
-- ficaram na fila do aparelho. Bloquear aqui transformaria a trava em perda de
-- dado dele — e o que se quer é que ele pare de treinar, não que ele perca o
-- que já levantou. Sem poder abrir sessão nova, isso acontece no máximo uma vez.

drop policy workout_sessions_insert on public.workout_sessions;

create policy workout_sessions_insert on public.workout_sessions for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and private.can_read_workout(workout_id)
    and private.aluno_ativo()
  );

comment on policy workout_sessions_insert on public.workout_sessions is
  'Aluno ativo, dono da sessão, em treino que ele pode ler. O update fica livre para fechar o que já estava aberto.';

-- ------------------------------------------------------- não publica -------
--
-- Substitui a regra da 0035 ("turma só para quem está nela"), que agora fica
-- contida nesta: sem turma não há post nenhum, nem o privado. O canal com o
-- personal não fecha — ele continua a um toque no WhatsApp, pela ficha dele em
-- `/app/perfil`, que segue aberta. Publicar foto de treino é produto; mandar
-- mensagem para quem te treina é conversa, e ela nunca morou aqui dentro.

drop policy posts_insert on public.posts;

create policy posts_insert on public.posts for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and (session_id is null or private.owns_session(session_id))
    and private.aluno_ativo()
  );

drop policy posts_update on public.posts;

create policy posts_update on public.posts for update to authenticated
  using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid())
    and (session_id is null or private.owns_session(session_id))
    and private.aluno_ativo()
  );

comment on policy posts_insert on public.posts is
  'Post do próprio aluno, apontando para sessão dele, e só enquanto ele estiver ativo.';
comment on policy posts_update on public.posts is
  'Mesma regra do insert: sem isto, gravar ativo e reescrever depois contornaria a trava.';

-- Apagar continua liberado: a política promete "você apaga o post quando
-- quiser", e esse direito não depende de mensalidade.

-- ------------------------------------------ não comenta e não curte --------
--
-- As duas já passavam por `pode_ver_post`, que a 0035 fechou para a turma. Falta
-- o caso que sobra: o **próprio post** dele, que `pode_ver_post` libera pelo
-- primeiro ramo. Sem isto, o arquivado continuaria comentando embaixo das
-- próprias fotos antigas, que ainda estão na tela dos colegas.

drop policy post_comments_insert on public.post_comments;

create policy post_comments_insert on public.post_comments for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.posts p
       where p.id = post_id and private.pode_ver_post(p.student_id, p.visibility)
    )
    -- O personal comenta no post do aluno dele e não é aluno de ninguém: a
    -- trava vale para quem **é** aluno. `trainer_of` é o que separa os dois.
    and (private.aluno_ativo() or private.trainer_of((select p.student_id from public.posts p where p.id = post_id)))
  );

drop policy post_likes_insert on public.post_likes;

create policy post_likes_insert on public.post_likes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.posts p
       where p.id = post_id and private.pode_ver_post(p.student_id, p.visibility)
    )
    and (private.aluno_ativo() or private.trainer_of((select p.student_id from public.posts p where p.id = post_id)))
  );

comment on policy post_comments_insert on public.post_comments is
  'Post visível para quem escreve, e quem escreve é aluno ativo ou o personal do dono do post.';
comment on policy post_likes_insert on public.post_likes is
  'Mesma regra do comentário: aluno ativo, ou o personal do dono do post.';

-- --------------------------------------------- não responde reavaliação ----
--
-- `assessments_update` é o fechamento da reavaliação pelo aluno, e
-- `student_measurements` são as medidas que ele digita. O personal continua
-- liberando e apagando a dele — `assessments_insert` e `_delete` são dele e não
-- mudam. O que some é a mão do aluno inativo.

drop policy assessments_update on public.assessments;

create policy assessments_update on public.assessments for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()) and private.aluno_ativo());

comment on policy assessments_update on public.assessments is
  'Só o aluno responde, e só enquanto ativo. O gatilho assessments_imutavel é quem congela depois do envio.';

drop policy student_measurements_insert on public.student_measurements;

create policy student_measurements_insert on public.student_measurements for insert to authenticated
  with check (private.pode_medir(assessment_id) and private.aluno_ativo());

drop policy student_measurements_update on public.student_measurements;

create policy student_measurements_update on public.student_measurements for update to authenticated
  using (private.pode_medir(assessment_id))
  with check (private.pode_medir(assessment_id) and private.aluno_ativo());

comment on policy student_measurements_insert on public.student_measurements is
  'A medida vem de quem mediu, e só enquanto ele for aluno ativo.';
comment on policy student_measurements_update on public.student_measurements is
  'Mesma regra do insert: a trava que só existe no insert não vale nada.';
