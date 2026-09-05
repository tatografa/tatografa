-- Reps Club · Correção da revisão do M2 · A última sessão de cada aluno
--
-- `listarAlunos` respondia "quando este aluno treinou pela última vez" trazendo
-- **todas** as sessões concluídas da carteira ordenadas por data e pegando a
-- primeira de cada aluno. Sem paginação, e o corte de página do PostgREST é
-- silencioso: passando do teto, as sessões mais antigas somem da resposta e o
-- aluno que treinou há três meses volta como `ultima_sessao = null`.
--
-- No M1 isso era um rótulo errado na lista ("ainda não treinou"). O M2-07
-- transformou o mesmo dado em **alerta**: aquele aluno passaria a aparecer em
-- "precisam de atenção" com o motivo errado — "entrou há 200 dias e ainda não
-- treinou" —, sobre alguém que treina toda semana. Número errado com cara de
-- certo, na tela que o personal usa para decidir com quem falar.
--
-- `distinct on` resolve no banco o que a varredura fazia em memória: uma linha
-- por aluno, sem trazer o histórico inteiro para descobrir a data mais recente.
--
-- `security invoker` (o padrão), e sem argumento de id: quem define "quais
-- alunos" é o RLS de `workout_sessions`, como em `sessoes_na_semana` (0015).

create function public.ultima_sessao_por_aluno()
  returns table (student_id uuid, finished_at timestamptz)
  language sql
  stable
  set search_path = public
as $$
  select distinct on (ws.student_id) ws.student_id, ws.finished_at
    from public.workout_sessions ws
   where ws.finished_at is not null
   order by ws.student_id, ws.finished_at desc
$$;

comment on function public.ultima_sessao_por_aluno() is
  'Data da última sessão concluída por aluno, para a carteira que o RLS liberar. Uma linha por aluno, agregada no banco: a varredura em memória truncava e fazia aluno ativo parecer inativo.';

grant execute on function public.ultima_sessao_por_aluno() to authenticated;
