-- Reps Club · Fase 3 · O post não pendura no treino de outro
--
-- **A quinta vez que o mesmo formato aparece**, depois de 0007, 0009, 0010 e
-- 0019: a policy de escrita confere o dono da linha e deixa solta a coluna que
-- aponta para o relacionamento. Aqui a coluna é `posts.session_id`.
--
-- `posts_insert` exigia só `student_id = auth.uid()`. Até esta semana isso não
-- tinha consequência, porque **nada preenchia `session_id`** — a coluna nasceu
-- na 0018 com a intenção escrita e ficou vazia. Agora a tela de conclusão do
-- treino oferece a foto e o post passa a carregar o treino que o gerou; a
-- coluna deixou de ser decorativa e virou afirmação na tela.
--
-- **O que dava para fazer.** Um POST direto criava um post legítimo (o
-- `student_id` é o do próprio atacante) apontando para a **sessão de um colega
-- de turma**. O RLS de `workout_sessions` protege o atacante de ler aquela
-- sessão, então na tela dele o selo não aparece — mas o **personal** lê as duas
-- sessões, e para ele o post do aluno A apareceria rotulado com o treino e o
-- volume do aluno B. Não vaza dado para quem não podia ver: mente para quem
-- podia. Num produto cujo valor é o registro do que foi levantado, isso é pior.
--
-- Conferido por SQL antes de escrever esta migration: o insert passou.
--
-- A Server Action já barrava (`resumoDaSessaoConcluida` só aceita sessão do
-- próprio aluno e concluída). Mas validação de aplicação não é trava: é a
-- primeira barreira, e a trava é esta.
--
-- `private.owns_session` já existia desde a 0005 e faz exatamente a pergunta
-- certa — "esta sessão é de quem está escrevendo?". O `session_id is null`
-- primeiro porque post avulso continua valendo: nem todo post nasce de treino.
--
-- O `(select auth.uid())` mantém o que a 0021 fez: identidade avaliada uma vez
-- por consulta, não por linha.

drop policy posts_insert on public.posts;

create policy posts_insert on public.posts for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and (session_id is null or private.owns_session(session_id))
  );

comment on policy posts_insert on public.posts is
  'Só o aluno publica, sobre si mesmo, e só pendurando no próprio treino: session_id solto deixava o post do aluno A mostrar o volume do aluno B para o personal.';

-- O mesmo no update, pelo motivo de sempre: um insert bem trancado não vale
-- nada se o update reescreve a mesma coluna depois.
drop policy posts_update on public.posts;

create policy posts_update on public.posts for update to authenticated
  using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid())
    and (session_id is null or private.owns_session(session_id))
  );

comment on policy posts_update on public.posts is
  'O autor edita o próprio post, e não repende num treino alheio — a mesma trava do insert, porque o update reescreveria a coluna.';
