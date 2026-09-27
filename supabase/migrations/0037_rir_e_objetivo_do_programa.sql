-- Reps Club · RIR na prescrição e objetivo no programa
--
-- Pedido do Otávio (27/09), junto com a tela "Divisão de treino" do protótipo:
--
-- 1. **RIR alvo por exercício** (`workout_exercises.rir_target`). RIR é
--    "repetições em reserva": quantas o aluno ainda conseguiria fazer ao fim da
--    série. Um alvo por exercício, e **não** por série — o protótipo prescreve
--    série a série (aquecimento, preparatória, work, drop, falha), e isso ficou
--    de fora por decisão do Otávio: mudaria a execução e o histórico inteiros.
--    Texto e não número pelo mesmo motivo de `reps_target`: "0-2" é prescrição,
--    não medida. Nulo = o personal não prescreveu RIR, que é o caso de todo
--    treino anterior a hoje; não existe valor "padrão" que caberia inventar.
--
-- 2. **Objetivo do programa** (`mesocycles.goal`). Mora no programa, não no
--    aluno: o mesmo aluno faz um bloco de força e depois um de hipertrofia, e
--    guardar no aluno reescreveria o passado a cada troca. Nulo = não
--    informado, sem quinto valor "outro" — mesma razão de `biological_profile`
--    (0034): o banco não guarda afirmação onde só há silêncio.
--
-- 3. As duas cópias (`duplicar_macrotreino`, `duplicar_treino`) passam a levar
--    as colunas novas. Elas listam coluna por coluna, então coluna nova que não
--    entra ali some em silêncio na primeira cópia — o personal duplica o
--    programa e o RIR que prescreveu desaparece do aluno novo.
--
-- 4. `series_por_programa`: a contagem de séries executadas de **todos** os
--    treinos de um programa numa ida só. A tela nova mostra o programa inteiro
--    de uma vez, e `series_por_exercicio` recebe um treino por chamada — sete
--    treinos seriam sete idas (N+1).
--
-- **Nenhuma policy muda.** As colunas novas não apontam para relacionamento
-- nenhum (a regra de "insert e update juntos" vale para `student_id`,
-- `workout_id`, `trainer_id`), e quem já pode escrever a linha pode escrever
-- nelas — o personal dono do programa.

-- ------------------------------------------------------------- colunas -----

create type public.training_goal as enum (
  'hipertrofia',
  'forca',
  'resistencia',
  'emagrecimento',
  'condicionamento'
);

alter table public.mesocycles
  add column goal public.training_goal;

comment on column public.mesocycles.goal is
  'Objetivo do programa. Nulo = não informado. Mora no programa, não no aluno: muda de um bloco para o outro.';

alter table public.workout_exercises
  add column rir_target text
    constraint workout_exercises_rir_target_formato
    check (rir_target ~ '^([0-9]|10)(-([0-9]|10))?$');

comment on column public.workout_exercises.rir_target is
  'RIR alvo do exercício: "2" ou "0-2", de 0 a 10. Nulo = não prescrito. Um por exercício, não por série.';

-- --------------------------------------------------------------- cópias -----
--
-- Reescritas inteiras a partir de `pg_get_functiondef` do banco vivo, com a
-- coluna nova acrescentada em cada lista. `security invoker` continua (0029):
-- a cópia passa pelo RLS de quem chamou.

create or replace function public.duplicar_macrotreino(p_mesocycle_id uuid, p_student_id uuid, p_name text)
  returns uuid
  language plpgsql
  set search_path = public
as $$
declare
  v_origem  public.mesocycles%rowtype;
  v_novo_id uuid;
  v_treino  record;
  v_novo_treino_id uuid;
begin
  select * into v_origem from public.mesocycles m where m.id = p_mesocycle_id;

  if v_origem.id is null then
    raise exception 'macrotreino nao encontrado' using errcode = 'no_data_found';
  end if;

  insert into public.mesocycles (student_id, trainer_id, name, total_weeks, started_at, status, goal)
  values (
    p_student_id,
    (select auth.uid()),
    p_name,
    v_origem.total_weeks,
    current_date,
    'arquivado',
    v_origem.goal
  )
  returning id into v_novo_id;

  for v_treino in
    select * from public.workouts w
     where w.mesocycle_id = p_mesocycle_id
     order by w.position, w.created_at
  loop
    insert into public.workouts (mesocycle_id, label, name, position, notes)
    values (v_novo_id, v_treino.label, v_treino.name, v_treino.position, v_treino.notes)
    returning id into v_novo_treino_id;

    insert into public.workout_exercises
      (workout_id, exercise_id, exercise_source, position, sets, reps_target, rest_seconds, technique, notes, rir_target)
    select v_novo_treino_id, we.exercise_id, we.exercise_source, we.position,
           we.sets, we.reps_target, we.rest_seconds, we.technique, we.notes, we.rir_target
      from public.workout_exercises we
     where we.workout_id = v_treino.id;
  end loop;

  return v_novo_id;
end;
$$;

create or replace function public.duplicar_treino(p_workout_id uuid)
  returns uuid
  language plpgsql
  set search_path = public
as $$
declare
  v_origem public.workouts%rowtype;
  v_label  text;
  v_novo_id uuid;
begin
  select * into v_origem from public.workouts w where w.id = p_workout_id;

  if v_origem.id is null then
    raise exception 'treino nao encontrado' using errcode = 'no_data_found';
  end if;

  select c into v_label
    from unnest(string_to_array('A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z', ',')) as c
   where c not in (
     select w.label from public.workouts w where w.mesocycle_id = v_origem.mesocycle_id
   )
   limit 1;

  insert into public.workouts (mesocycle_id, label, name, position, notes)
  values (
    v_origem.mesocycle_id,
    coalesce(v_label, v_origem.label),
    left(v_origem.name || ' (cópia)', 80),
    coalesce(
      (select max(w.position) + 1 from public.workouts w where w.mesocycle_id = v_origem.mesocycle_id),
      0
    ),
    v_origem.notes
  )
  returning id into v_novo_id;

  insert into public.workout_exercises
    (workout_id, exercise_id, exercise_source, position, sets, reps_target, rest_seconds, technique, notes, rir_target)
  select v_novo_id, we.exercise_id, we.exercise_source, we.position,
         we.sets, we.reps_target, we.rest_seconds, we.technique, we.notes, we.rir_target
    from public.workout_exercises we
   where we.workout_id = p_workout_id;

  return v_novo_id;
end;
$$;

-- ---------------------------------------------------- contagem em lote -----
--
-- `security invoker` e sem id de personal, como `series_por_exercicio` (0008):
-- quem define o que se conta é o RLS de `session_sets` e de `workouts`.

create function public.series_por_programa(p_mesocycle_id uuid)
  returns table (workout_exercise_id uuid, total bigint)
  language sql
  stable
  set search_path = public
as $$
  select ss.workout_exercise_id, count(*)
    from public.session_sets ss
    join public.workout_exercises we on we.id = ss.workout_exercise_id
    join public.workouts w on w.id = we.workout_id
   where w.mesocycle_id = p_mesocycle_id
   group by ss.workout_exercise_id
$$;

comment on function public.series_por_programa(uuid) is
  'Séries executadas por linha de prescrição, para todos os treinos do programa numa ida. Roda com o RLS de quem chama.';

revoke execute on function public.series_por_programa(uuid) from public, anon;
grant execute on function public.series_por_programa(uuid) to authenticated;
