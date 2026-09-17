-- Duplicar treino e duplicar macrotreino inteiro (doc 06 §5).
--
-- O doc justifica em cinco palavras: "o personal reaproveita muito". Montar um
-- programa de hipertrofia do zero é meia hora de trabalho; entregá-lo ao
-- segundo aluno era **a mesma meia hora**, digitada de novo. É o item da lista
-- do §5 que mais decide se o personal adota o produto, e também é o
-- "enviar/atribuir a um ou vários alunos" do mesmo parágrafo: atribuir um
-- programa a outro aluno é copiá-lo para ele.
--
-- **Uma transação, não uma sequência.** Copiar um programa é 1 `mesocycles` +
-- N `workouts` + M `workout_exercises`. Em passos soltos pela Server Action,
-- uma falha no meio deixa um programa que **existe e parece real** — aparece na
-- lista, abre, e tem dois dos cinco treinos. O personal ativa, o aluno vai para
-- a academia e o treino de quinta não está lá. Mesma decisão de
-- `ativar_macrotreino` (0012) e de `enviar_reavaliacao` (0023).
--
-- **`security invoker` (o padrão), de propósito.** Toda leitura e toda escrita
-- passam pelo RLS de quem chamou: o `select` não enxerga programa de outra
-- carteira, e `mesocycles_write` / `workouts_write` / `workout_exercises_write`
-- recusam a cópia para aluno alheio. A função não alarga o acesso de ninguém —
-- só junta numa transação o que já era permitido.
--
-- Reversível: `drop function` das duas. Nenhum dado é alterado pela migration.

-- ------------------------------------------------- duplicar_macrotreino ----

create function public.duplicar_macrotreino(
  p_mesocycle_id uuid,
  p_student_id   uuid,
  p_name         text
) returns uuid
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

  -- Nulo cobre id inexistente e programa que o RLS esconde. São a mesma coisa
  -- para quem está olhando, e distinguir contaria a um estranho que o id existe.
  if v_origem.id is null then
    raise exception 'macrotreino nao encontrado' using errcode = 'no_data_found';
  end if;

  insert into public.mesocycles (student_id, trainer_id, name, total_weeks, started_at, status)
  values (
    p_student_id,
    -- O `trainer_id` é de quem copiou, não o da origem: a cópia é dele. O RLS
    -- recusaria o contrário de qualquer jeito, e copiar a coluna esconderia
    -- isso atrás de um erro genérico.
    (select auth.uid()),
    p_name,
    v_origem.total_weeks,
    -- **`started_at` não se copia.** A semana da rotação sai daqui (decisão de
    -- 04/09), então herdar a data da origem faria a cópia nascer na semana 5 de
    -- 8 — o aluno novo abriria o app já no meio do programa.
    current_date,
    -- **Nasce arquivada, sempre**, mesmo que o aluno de destino não tenha
    -- programa ativo. É a convenção da 0012: ativar é um clique explícito. Uma
    -- cópia que nascesse ativa trocaria o treino do aluno sem ninguém mandar —
    -- e o índice parcial da 0011 ainda recusaria, se ele já tivesse um.
    'arquivado'
  )
  returning id into v_novo_id;

  -- Laço e não `insert ... select` porque cada treino copiado precisa do **id
  -- novo** para pendurar a prescrição, e `returning` não devolve o id da linha
  -- de origem junto. São 3 a 6 treinos por programa: a clareza vale mais aqui
  -- do que economizar quatro statements dentro da mesma transação.
  for v_treino in
    select * from public.workouts w
     where w.mesocycle_id = p_mesocycle_id
     order by w.position, w.created_at
  loop
    insert into public.workouts (mesocycle_id, label, name, position, notes)
    values (v_novo_id, v_treino.label, v_treino.name, v_treino.position, v_treino.notes)
    returning id into v_novo_treino_id;

    insert into public.workout_exercises
      (workout_id, exercise_id, exercise_source, position, sets, reps_target, rest_seconds, technique, notes)
    select v_novo_treino_id, we.exercise_id, we.exercise_source, we.position,
           we.sets, we.reps_target, we.rest_seconds, we.technique, we.notes
      from public.workout_exercises we
     where we.workout_id = v_treino.id;
  end loop;

  -- **`workout_sessions` e `session_sets` ficam para trás, e isso não é
  -- esquecimento.** O programa é a prescrição; a sessão é o que o aluno
  -- levantou. Copiar o histórico junto daria ao aluno novo um passado que não é
  -- dele — e ao personal um recorde inventado na tela de progresso.
  return v_novo_id;
end;
$$;

comment on function public.duplicar_macrotreino(uuid, uuid, text) is
  'Copia um programa inteiro (treinos e prescrição) para um aluno, numa transação. Nasce arquivado; histórico de execução não vem junto.';

grant execute on function public.duplicar_macrotreino(uuid, uuid, text) to authenticated;

-- ----------------------------------------------------- duplicar_treino ----

create function public.duplicar_treino(p_workout_id uuid) returns uuid
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

  -- A primeira letra livre do programa. O personal pensa em A, B, C — e uma
  -- cópia chamada "A" ao lado de outra "A" faria o aluno abrir o app com dois
  -- treinos de mesmo nome e nenhuma pista de qual é qual. `label` é texto livre
  -- no schema (0001), então a letra é convenção de produto, e é aqui que ela
  -- vive para a cópia.
  select c into v_label
    from unnest(string_to_array('A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z', ',')) as c
   where c not in (
     select w.label from public.workouts w where w.mesocycle_id = v_origem.mesocycle_id
   )
   limit 1;

  -- Programa com as 26 letras ocupadas não trava a cópia: ela sai sem letra
  -- nova e o personal renomeia. Recusar seria punir por um caso que ninguém vive.
  insert into public.workouts (mesocycle_id, label, name, position, notes)
  values (
    v_origem.mesocycle_id,
    coalesce(v_label, v_origem.label),
    -- O nome ganha o sufixo porque a lista mostra nome, não letra, e duas
    -- linhas "Peito e tríceps" seguidas não dizem qual é a cópia.
    left(v_origem.name || ' (cópia)', 80),
    -- No fim da lista: a cópia é o treino mais novo do programa, e entrar no
    -- meio mudaria a ordem em que o aluno vê os treinos que já existiam.
    coalesce(
      (select max(w.position) + 1 from public.workouts w where w.mesocycle_id = v_origem.mesocycle_id),
      0
    ),
    v_origem.notes
  )
  returning id into v_novo_id;

  insert into public.workout_exercises
    (workout_id, exercise_id, exercise_source, position, sets, reps_target, rest_seconds, technique, notes)
  select v_novo_id, we.exercise_id, we.exercise_source, we.position,
         we.sets, we.reps_target, we.rest_seconds, we.technique, we.notes
    from public.workout_exercises we
   where we.workout_id = p_workout_id;

  return v_novo_id;
end;
$$;

comment on function public.duplicar_treino(uuid) is
  'Copia um treino e a prescrição dele dentro do mesmo programa, numa transação. Recebe a primeira letra livre.';

grant execute on function public.duplicar_treino(uuid) to authenticated;
