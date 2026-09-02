-- Reps Club · Fase 1 · A série só pode apontar para a prescrição da própria sessão
--
-- Encontrado ao verificar o RLS do card M1-05 (execução do treino), por SQL:
--
--   `session_sets_write` exigia apenas `private.owns_session(session_id)`. Ela
--   confere de quem é a sessão, mas não confere de quem é a linha da
--   prescrição: `workout_exercise_id` entrava sem nenhuma checagem. Um aluno
--   podia então gravar séries na própria sessão apontando para o
--   `workout_exercises.id` do treino de outro aluno, de outro personal.
--
--   O estrago é no histórico alheio: `session_sets_progresso_idx` existe
--   justamente porque todo gráfico de evolução, PR e volume sai desta tabela,
--   e a função `series_por_exercicio` (migration 0008) conta por
--   `workout_exercise_id` — é o número que o editor do personal usa para
--   avisar antes de remover um exercício "que o aluno já executou". Séries
--   forjadas inflam essa contagem no treino de um estranho.
--
-- É a mesma lição da migration 0007: **dono da linha não é dono do
-- relacionamento**. A policy passa a exigir que o exercício pertença ao treino
-- da sessão em que a série está sendo gravada.
--
-- A Server Action `registrarSeries` faz a mesma conferência antes de gravar,
-- para recusar com mensagem em vez de erro de RLS sem explicação. Esta
-- migration é a rede embaixo: uma requisição forjada não passa pelo action.
--
-- Reversível: `drop policy` + a versão anterior (owns_session sozinho) recria
-- o estado antigo. Nenhum dado é alterado ou apagado por esta migration.

create function private.serie_no_treino_da_sessao(
  p_session_id uuid,
  p_workout_exercise_id uuid
) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.workout_sessions ws
    join public.workout_exercises we on we.workout_id = ws.workout_id
    where ws.id = p_session_id
      and we.id = p_workout_exercise_id
  )
$$;

-- Helper de autorização não é API: vive em `private`, que o PostgREST não
-- publica, e só o papel `authenticated` executa.
revoke execute on function private.serie_no_treino_da_sessao(uuid, uuid)
  from public, anon;
grant execute on function private.serie_no_treino_da_sessao(uuid, uuid)
  to authenticated;

drop policy session_sets_write on public.session_sets;

create policy session_sets_write on public.session_sets for all to authenticated
  using (
    private.owns_session(session_id)
    and private.serie_no_treino_da_sessao(session_id, workout_exercise_id)
  )
  with check (
    private.owns_session(session_id)
    and private.serie_no_treino_da_sessao(session_id, workout_exercise_id)
  );

comment on policy session_sets_write on public.session_sets is
  'Dono da sessão E exercício do treino daquela sessão: owns_session sozinho deixava gravar série no histórico de treino alheio.';
