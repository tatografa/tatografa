-- Reps Club · Fase 1 · O macrotreino só nasce para aluno da própria carteira
--
-- Encontrado ao verificar o RLS do card M1-03 (editor de treino), por SQL:
--
--   A policy `mesocycles_write` exigia apenas `trainer_id = auth.uid()`. Ela
--   confere quem é o dono da linha, mas não confere de quem é o aluno. Um
--   personal qualquer podia então inserir um macrotreino com o próprio
--   `trainer_id` e o `student_id` de um aluno alheio — e, a partir daí, os
--   treinos e a prescrição inteira, porque `can_write_mesocycle` só olha o
--   `trainer_id` do macrotreino que ele mesmo acabou de criar.
--
--   O aluno via o treino do intruso: `mesocycles_select` libera
--   `student_id = auth.uid()`. Ou seja, dava para empurrar prescrição para o
--   aluno de outro personal conhecendo só o uuid dele.
--
-- A correção é fechar a porta de entrada da cadeia: o macrotreino só pode ser
-- escrito por quem é o personal daquele aluno. Todo o resto (workouts,
-- workout_exercises) já pendura no macrotreino e passa a herdar a checagem.
--
-- Reversível: `drop policy` + a versão anterior recria o estado antigo. Nenhum
-- dado é alterado ou apagado por esta migration.

drop policy mesocycles_write on public.mesocycles;

create policy mesocycles_write on public.mesocycles for all to authenticated
  using (trainer_id = auth.uid() and private.trainer_of(student_id))
  with check (trainer_id = auth.uid() and private.trainer_of(student_id));

comment on policy mesocycles_write on public.mesocycles is
  'Escrita só do personal do próprio aluno: trainer_id sozinho não impede prescrever para aluno alheio.';
