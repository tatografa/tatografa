-- Limite de tamanho na observação do treino.
--
-- `workout_sessions.notes` existe desde a 0001 e **nunca recebeu uma linha** —
-- é o mesmo formato de `posts.session_id` e de `trainers.phone`: coluna com a
-- intenção escrita no schema e nenhuma tela preenchendo. O menu ⋮ da execução
-- (doc 05 §5) passa a preenchê-la, e por isso o limite entra agora.
--
-- As outras duas colunas de texto livre deste banco já têm o seu
-- (`appointments.notes` 1..500, `trainer_notes.body` 1..2000); esta ficou de
-- fora porque ninguém escrevia nela. Sem limite, um POST direto grava
-- megabytes numa linha que o personal lê em toda leitura de histórico.
--
-- 500 é a medida da coisa: "ombro direito doeu, fui leve no supino" cabe com
-- folga, e um texto de dez parágrafos no meio do treino não é o que o campo é.
--
-- `not valid` não é preciso: a coluna está vazia em todas as linhas.

alter table public.workout_sessions
  add constraint workout_sessions_notes_tamanho
  check (notes is null or length(btrim(notes)) between 1 and 500);

comment on column public.workout_sessions.notes is
  'Observação que o ALUNO escreve sobre a própria execução, pelo menu da tela de treino. O personal lê no detalhe da sessão.';
