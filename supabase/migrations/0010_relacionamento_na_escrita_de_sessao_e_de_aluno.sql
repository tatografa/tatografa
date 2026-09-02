-- Reps Club · Fase 1 · Dono da linha não é dono do relacionamento (3ª vez)
--
-- Quatro policies de escrita conferiam só quem é o dono da linha e deixavam a
-- coluna que aponta para o relacionamento entrar sem checagem. É a mesma forma
-- das migrations 0007 (macrotreino) e 0009 (série), encontrada na revisão
-- consolidada do M1 e reproduzida por SQL antes de escrever esta correção.
--
-- Reversível: cada bloco é `drop policy` + `create policy`, e a versão anterior
-- de cada uma está no comentário do bloco. Nenhum dado é alterado ou apagado.

-- ------------------------- 1. workout_sessions_update: o treino da sessão ---
--
--   Antes: using (student_id = auth.uid()) with check (student_id = auth.uid()).
--
--   `workout_sessions_insert` já exigia `private.can_read_workout(workout_id)`,
--   mas o update não. O aluno A abria uma sessão legítima e mandava um PATCH
--   trocando `workout_id` para o treino do aluno B. A partir daí
--   `private.serie_no_treino_da_sessao` (0009) resolve pelo `workout_id` já
--   adulterado e AUTORIZA gravar série na prescrição do B — exatamente o que a
--   0009 documenta como bloqueado. A trava da 0009 dependia de um campo que a
--   própria vítima do ataque podia reescrever.
--
--   O `using` continua só com o dono: o que precisa ser conferido é o valor que
--   entra, não o que já está lá. As duas escritas do app (`concluirTreino` e
--   `encerrarPendenteEComecar`) só tocam `finished_at`/`duration_seconds` e
--   mantêm o `workout_id` original, que passa no `can_read_workout`.
drop policy workout_sessions_update on public.workout_sessions;

create policy workout_sessions_update on public.workout_sessions for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid() and private.can_read_workout(workout_id));

comment on policy workout_sessions_update on public.workout_sessions is
  'Dono da sessão E treino que o aluno pode ler: sem isto, trocar workout_id contornava a trava da 0009.';

-- ---------------- 2. workout_sessions_delete: sessão concluída é histórico ---
--
--   Antes: using (student_id = auth.uid()).
--
--   O aluno apagava uma sessão já concluída e levava junto, por cascata, todas
--   as `session_sets` dela. Contraria a decisão registrada no handoff
--   `execucao.md` — "série que o aluno executou é histórico, nunca apagada" — e
--   quem perde a leitura é o personal, que não tem como recuperar.
--
--   O app só apaga sessão em andamento e vazia (descartar em
--   `encerrarPendenteEComecar`); esse caminho continua passando.
drop policy workout_sessions_delete on public.workout_sessions;

create policy workout_sessions_delete on public.workout_sessions for delete to authenticated
  using (student_id = auth.uid() and finished_at is null);

comment on policy workout_sessions_delete on public.workout_sessions is
  'Só sessão em andamento: apagar sessão concluída levaria as séries por cascata, e histórico não se apaga.';

-- ------------------------- 3. students_insert: o convite não é decorativo ---
--
--   Antes: with check (trainer_id = auth.uid() or id = auth.uid()).
--
--   O ramo `id = auth.uid()` deixava qualquer usuário autenticado inserir a
--   própria linha em `students` com o `trainer_id` de uma personal qualquer e
--   entrar na carteira dela por um POST direto — sem convite nenhum. Todo o
--   sistema de convite (token de 192 bits, gatilho da 0006, conferência de
--   e-mail divergente) era contornável.
--
--   O aluno legítimo não nasce por aqui: `private.handle_new_user` é
--   `security definer`, roda como dono da tabela e não passa por policy. Logo,
--   remover o ramo não quebra o convite — só fecha a porta lateral.
drop policy students_insert on public.students;

create policy students_insert on public.students for insert to authenticated
  with check (trainer_id = auth.uid());

comment on policy students_insert on public.students is
  'Só o personal cria linha de aluno pela API. O aluno legítimo nasce no gatilho, que não passa por policy.';

-- ------------- 4. students_update: o aluno não se transfere de personal ------
--
--   Antes: with check (id = auth.uid() or trainer_id = auth.uid()).
--
--   Com o ramo `id = auth.uid()`, um PATCH do próprio aluno podia trocar o
--   `trainer_id` e migrar sozinho para a carteira de outra personal, vendo o
--   perfil dela e recebendo prescrição dela. Mudar de personal é decisão de
--   quem convida, não de quem aceita.
--
--   `private.my_trainer_id()` é `stable` e enxerga a linha do snapshot do
--   statement, isto é, o `trainer_id` ANTES do update: o aluno segue editando
--   o próprio perfil desde que o vínculo continue o mesmo.
drop policy students_update on public.students;

create policy students_update on public.students for update to authenticated
  using (id = auth.uid() or trainer_id = auth.uid())
  with check (
    trainer_id = auth.uid()
    or (id = auth.uid() and trainer_id = private.my_trainer_id())
  );

comment on policy students_update on public.students is
  'O aluno edita o próprio perfil mas não troca o trainer_id; trocar de personal é do lado de quem convida.';
