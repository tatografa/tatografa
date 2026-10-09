-- Reps Club · Descanso de 120 segundos em todo exercício (pedido do Otávio, 09/10)
--
-- O descanso mora em três lugares, e os três mudam juntos:
--   * `exercises_catalog.default_rest_seconds` e `exercises.default_rest_seconds`
--     são o padrão que o quadro de treinos copia ao acrescentar o exercício;
--   * `workout_exercises.rest_seconds` é o que já foi prescrito, e é o que o
--     cronômetro do aluno conta na execução.
-- Mudar só o padrão deixaria todo treino já montado nos 60 de antes; mudar só a
-- prescrição faria o próximo exercício acrescentado voltar aos 60.
--
-- O padrão das colunas também sobe, para linha nova nascer igual. O personal
-- continua mudando o descanso exercício por exercício no quadro.

update public.exercises_catalog set default_rest_seconds = 120 where default_rest_seconds <> 120;
update public.exercises set default_rest_seconds = 120 where default_rest_seconds <> 120;
update public.workout_exercises set rest_seconds = 120 where rest_seconds <> 120;

alter table public.exercises_catalog alter column default_rest_seconds set default 120;
alter table public.exercises alter column default_rest_seconds set default 120;
alter table public.workout_exercises alter column rest_seconds set default 120;
