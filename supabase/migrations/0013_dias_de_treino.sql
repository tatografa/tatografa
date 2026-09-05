-- Reps Club · M2-05 · Os dias em que o aluno treinou
--
-- A sequência ("🔥 5 dias seguidos") precisa saber **quais dias** tiveram
-- treino, não quantas sessões existem. Duas sessões no mesmo dia são um dia só,
-- e é o banco que agrupa: trazer as sessões para contar em memória esbarraria
-- no corte de página silencioso do PostgREST, e uma página perdida encurtaria a
-- sequência sem avisar ninguém.
--
-- `security invoker` (o padrão) de propósito: a função lê `workout_sessions`
-- com o RLS do chamador, então ela não alarga acesso nenhum — o aluno vê os
-- próprios dias, o personal vê os do aluno dele, e mais ninguém.
--
-- **Fronteira de dia no fuso do produto**, como `lib/domain/fuso.ts` e como
-- `treinos_feitos_na_semana` (migration 0011). O servidor roda em UTC e às 21h
-- no Brasil já virou o dia seguinte — exatamente o horário em que se treina.
--
-- **É `started_at`, não `finished_at`**, pela mesma razão da 0011: o treino
-- pertence ao dia em que o aluno começou. Quem entra na academia às 23h40 e
-- termina depois da meia-noite treinou naquele dia, não no seguinte — e a
-- rotação já conta assim, então os dois números não discordam.

create function public.dias_de_treino(p_student_id uuid)
  returns table (dia date)
  language sql
  stable
  set search_path = public
as $$
  select distinct (ws.started_at at time zone 'America/Sao_Paulo')::date
    from public.workout_sessions ws
   where ws.student_id = p_student_id
     and ws.finished_at is not null
   order by 1 desc
$$;

comment on function public.dias_de_treino(uuid) is
  'Dias de calendário (fuso do produto) com ao menos uma sessão concluída. Agregado no banco; a sequência é calculada em lib/domain/sequencia.ts.';

grant execute on function public.dias_de_treino(uuid) to authenticated;
