-- Reps Club · M2-07 · Sessões da semana, para a carteira inteira
--
-- O painel mostra "treinos executados na semana" e a aderência média. As duas
-- contas precisam de uma sessão por aluno agregada, e agregar em memória aqui
-- seria o erro de sempre: o corte de página do PostgREST é silencioso, e uma
-- página perdida faria a aderência da carteira aparecer menor do que é —
-- número errado com cara de certo, na tela que o personal usa para decidir com
-- quem falar.
--
-- Irmã de `treinos_feitos_na_semana` (migration 0011), que responde a mesma
-- pergunta para **um** aluno e serve à rotação. Esta responde para todos de uma
-- vez e não recebe id nenhum: quem define "todos" é o RLS.
--
-- `security invoker` (o padrão): lê `workout_sessions` com as permissões de
-- quem chama, então o personal vê a própria carteira e o aluno veria só a si
-- mesmo. Não alarga acesso.
--
-- Mesma fronteira de dia das outras duas — `started_at` no fuso do produto —,
-- porque o treino pertence ao dia em que o aluno começou.

create function public.sessoes_na_semana(p_de date, p_ate date)
  returns table (student_id uuid, total bigint)
  language sql
  stable
  set search_path = public
as $$
  select ws.student_id, count(*)
    from public.workout_sessions ws
   where ws.finished_at is not null
     and (ws.started_at at time zone 'America/Sao_Paulo')::date >= p_de
     and (ws.started_at at time zone 'America/Sao_Paulo')::date <  p_ate
   group by ws.student_id
$$;

comment on function public.sessoes_na_semana(date, date) is
  'Sessões concluídas por aluno no intervalo, para a carteira que o RLS liberar. Fronteira em dia de calendário no fuso do produto.';

grant execute on function public.sessoes_na_semana(date, date) to authenticated;
