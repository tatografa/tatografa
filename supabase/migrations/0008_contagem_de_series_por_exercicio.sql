-- Reps Club · Fase 1 · Contagem de séries executadas, agregada no banco
--
-- O editor precisa saber quantas séries o aluno já registrou em cada linha da
-- prescrição, para avisar antes de remover um exercício com histórico.
--
-- A primeira versão trazia todas as linhas de `session_sets` e contava em
-- memória. Dois problemas, e o segundo é o grave:
--
--   1. Volume: 10 exercícios × 4 séries × 60 sessões já são milhares de linhas
--      viajando a cada abertura do editor, para produzir um punhado de números.
--   2. Truncamento silencioso: se o `db-max-rows` do PostgREST cortar a página,
--      a contagem volta MENOR do que é — e uma contagem menor que chega a zero
--      faz o editor remover o exercício sem confirmar, apagando por cascata o
--      histórico que essa confirmação existe para proteger.
--
-- `security invoker` (o padrão) de propósito: o RLS de `session_sets` e de
-- `workout_exercises` continua valendo para quem chama, então esta função não
-- alarga o acesso de ninguém — só evita trazer as linhas para contar fora.

create function public.series_por_exercicio(p_workout_id uuid)
  returns table (workout_exercise_id uuid, total bigint)
  language sql
  stable
  set search_path = public
as $$
  select ss.workout_exercise_id, count(*)
    from public.session_sets ss
    join public.workout_exercises we on we.id = ss.workout_exercise_id
   where we.workout_id = p_workout_id
   group by ss.workout_exercise_id
$$;

comment on function public.series_por_exercicio(uuid) is
  'Séries já registradas por linha da prescrição. Agregado no banco: contar em memória trunca em silêncio.';

grant execute on function public.series_por_exercicio(uuid) to authenticated;
