import "server-only";

import { duracaoEstimadaMin, totalDeSeries } from "@/lib/domain/treino";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import {
  chaveDoExercicio,
  exerciciosPorReferencia,
  type ExercicioDisponivel,
} from "./exercicios";

export type AlunoDoTreino = Pick<Tables<"students">, "id" | "name">;

export type MacrotreinoAtivo = Pick<
  Tables<"mesocycles">,
  "id" | "name" | "total_weeks" | "started_at" | "student_id"
>;

/** Uma linha da prescrição, já com o exercício resolvido. */
export type ExercicioPrescrito = {
  /** `workout_exercises.id` — é a chave que `session_sets` referencia. */
  id: string;
  position: number;
  sets: number;
  reps_target: string;
  rest_seconds: number;
  technique: string | null;
  notes: string | null;
  exercicio: ExercicioDisponivel;
  /** Séries já executadas por qualquer sessão do aluno. 0 = nunca treinado. */
  series_registradas: number;
};

export type TreinoCompleto = {
  id: string;
  label: string;
  name: string;
  notes: string | null;
  position: number;
  aluno: AlunoDoTreino;
  macrotreino: Omit<MacrotreinoAtivo, "student_id">;
  exercicios: ExercicioPrescrito[];
  total_series: number;
  duracao_min: number;
};

export type TreinoResumido = {
  id: string;
  label: string;
  name: string;
  total_exercicios: number;
  total_series: number;
  duracao_min: number;
};

export type TreinosDoAluno = {
  aluno: AlunoDoTreino;
  macrotreino: Omit<MacrotreinoAtivo, "student_id"> | null;
  treinos: TreinoResumido[];
};

const COLUNAS_PRESCRICAO =
  "id, workout_id, exercise_id, exercise_source, position, sets, reps_target, rest_seconds, technique, notes";

/**
 * Os treinos do **programa ativo** de cada aluno do personal.
 *
 * Quatro consultas fixas, não uma por aluno nem uma por treino: alunos,
 * macrotreinos, treinos e prescrições vêm em lote e o agrupamento acontece em
 * memória. O RLS já restringe tudo à carteira do personal logado.
 *
 * Só o programa ativo entra. No M1 a função trazia os treinos de TODOS os
 * mesociclos do aluno enquanto o cabeçalho mostrava só o ativo — latente
 * enquanto havia um programa por aluno, e lista errada assim que passou a
 * haver gestão de macrotreino: os treinos do programa velho apareceriam sob o
 * nome do programa novo, sem nada distinguindo os dois. Programa arquivado se
 * consulta em `/painel/macrotreinos`.
 */
export async function listarTreinosPorAluno(): Promise<TreinosDoAluno[]> {
  const supabase = await createClient();

  const { data: alunos, error: erroAlunos } = await supabase
    .from("students")
    .select("id, name")
    .order("name");

  if (erroAlunos) throw erroAlunos;
  if (!alunos?.length) return [];

  const { data: macros, error: erroMacros } = await supabase
    .from("mesocycles")
    .select("id, name, total_weeks, started_at, student_id, created_at")
    .eq("status", "ativo")
    .in(
      "student_id",
      alunos.map((a) => a.id),
    )
    .order("created_at", { ascending: false });

  if (erroMacros) throw erroMacros;

  const macroPorAluno = new Map<string, Omit<MacrotreinoAtivo, "student_id">>();
  for (const macro of macros ?? []) {
    // Um ativo por aluno é garantido pelo índice parcial da migration 0011.
    // O `if` fica como rede: se o índice cair, o mais recente prevalece.
    if (!macroPorAluno.has(macro.student_id)) {
      macroPorAluno.set(macro.student_id, {
        id: macro.id,
        name: macro.name,
        total_weeks: macro.total_weeks,
        started_at: macro.started_at,
      });
    }
  }

  const idsDeMacro = [...macroPorAluno.values()].map((m) => m.id);
  const alunoPorMacro = new Map(
    [...macroPorAluno.entries()].map(([alunoId, macro]) => [macro.id, alunoId]),
  );

  // Erro aqui não pode virar lista vazia: "nenhum treino ainda" para um
  // personal que tem treinos o faria remontar tudo por cima.
  let treinos: Pick<Tables<"workouts">, "id" | "mesocycle_id" | "label" | "name" | "position">[] = [];
  if (idsDeMacro.length) {
    const { data, error } = await supabase
      .from("workouts")
      .select("id, mesocycle_id, label, name, position")
      .in("mesocycle_id", idsDeMacro)
      .order("position");
    if (error) throw error;
    treinos = data ?? [];
  }

  const idsDeTreino = treinos.map((t) => t.id);

  let prescricoes: Pick<
    Tables<"workout_exercises">,
    "workout_id" | "sets" | "rest_seconds"
  >[] = [];
  if (idsDeTreino.length) {
    const { data, error } = await supabase
      .from("workout_exercises")
      .select("workout_id, sets, rest_seconds")
      .in("workout_id", idsDeTreino);
    if (error) throw error;
    prescricoes = data ?? [];
  }

  const porTreino = new Map<string, { sets: number; rest_seconds: number }[]>();
  for (const linha of prescricoes) {
    const lista = porTreino.get(linha.workout_id) ?? [];
    lista.push({ sets: linha.sets, rest_seconds: linha.rest_seconds });
    porTreino.set(linha.workout_id, lista);
  }

  const treinosPorAluno = new Map<string, TreinoResumido[]>();
  for (const treino of treinos) {
    const alunoId = alunoPorMacro.get(treino.mesocycle_id);
    if (!alunoId) continue;
    const exercicios = porTreino.get(treino.id) ?? [];
    const lista = treinosPorAluno.get(alunoId) ?? [];
    lista.push({
      id: treino.id,
      label: treino.label,
      name: treino.name,
      total_exercicios: exercicios.length,
      total_series: totalDeSeries(exercicios),
      duracao_min: duracaoEstimadaMin(exercicios),
    });
    treinosPorAluno.set(alunoId, lista);
  }

  return alunos.map((aluno) => ({
    aluno,
    macrotreino: macroPorAluno.get(aluno.id) ?? null,
    treinos: treinosPorAluno.get(aluno.id) ?? [],
  }));
}

/**
 * Um treino com a prescrição inteira, pronto para o editor e para as telas do
 * aluno. Contrato descrito em `docs/handoffs/prescricao.md`.
 *
 * Devolve `null` quando o treino não existe *ou* quando o RLS não deixa ler —
 * do ponto de vista de quem chama é a mesma coisa, e distinguir os dois casos
 * na resposta contaria a um estranho que aquele id existe.
 */
export async function lerTreino(treinoId: string): Promise<TreinoCompleto | null> {
  const supabase = await createClient();

  // O aluno e o macrotreino vêm embutidos: um join do PostgREST, não uma
  // segunda ida ao banco.
  const { data: treino } = await supabase
    .from("workouts")
    .select(
      "id, label, name, notes, position, mesocycles!inner(id, name, total_weeks, started_at, students!inner(id, name))",
    )
    .eq("id", treinoId)
    .maybeSingle();

  if (!treino) return null;

  const { data: prescricoes, error } = await supabase
    .from("workout_exercises")
    .select(COLUNAS_PRESCRICAO)
    .eq("workout_id", treinoId)
    .order("position");

  if (error) throw error;

  const linhas = prescricoes ?? [];
  const [porReferencia, executadas] = await Promise.all([
    exerciciosPorReferencia(linhas),
    seriesRegistradas(treinoId),
  ]);

  const exercicios: ExercicioPrescrito[] = [];
  for (const linha of linhas) {
    const exercicio = porReferencia.get(chaveDoExercicio(linha));
    // `exercise_id` não tem fk: um exercício próprio apagado deixaria a linha
    // órfã. Pular é melhor que quebrar a tela do aluno na academia.
    if (!exercicio) continue;
    exercicios.push({
      id: linha.id,
      // A posição é renumerada sobre o que sobrou, não copiada do banco: pular
      // uma linha órfã deixaria buraco (0, 2), e a tela do aluno conta em cima
      // disto ("exercício 3 de 5"). A ordem relativa vem do `order` acima.
      position: exercicios.length,
      sets: linha.sets,
      reps_target: linha.reps_target,
      rest_seconds: linha.rest_seconds,
      technique: linha.technique,
      notes: linha.notes,
      exercicio,
      series_registradas: executadas.get(linha.id) ?? 0,
    });
  }

  return {
    id: treino.id,
    label: treino.label,
    name: treino.name,
    notes: treino.notes,
    position: treino.position,
    aluno: treino.mesocycles.students,
    macrotreino: {
      id: treino.mesocycles.id,
      name: treino.mesocycles.name,
      total_weeks: treino.mesocycles.total_weeks,
      started_at: treino.mesocycles.started_at,
    },
    exercicios,
    total_series: totalDeSeries(exercicios),
    duracao_min: duracaoEstimadaMin(exercicios),
  };
}

/**
 * Quantas séries já foram registradas para cada linha da prescrição.
 *
 * O editor usa isso para avisar antes de remover um exercício que o aluno já
 * executou: apagar a linha levaria o histórico junto, por cascata.
 *
 * A contagem é agregada no banco, não em memória. Trazer as linhas de
 * `session_sets` para contar aqui significaria milhares de registros por
 * abertura do editor com histórico real — e, pior, o corte de página do
 * PostgREST é silencioso: a contagem voltaria menor, e uma contagem que chega
 * a zero faz o editor remover sem confirmar exatamente o exercício cujo
 * histórico a confirmação existe para proteger.
 */
async function seriesRegistradas(treinoId: string): Promise<Map<string, number>> {
  const supabase = await createClient();
  const contagem = new Map<string, number>();

  const { data, error } = await supabase.rpc("series_por_exercicio", {
    p_workout_id: treinoId,
  });

  // Uma contagem que falhou não pode passar por "nunca treinado": nesse caso o
  // editor removeria sem avisar. Estourar deixa o erro visível.
  if (error) throw error;

  for (const linha of data ?? []) {
    contagem.set(linha.workout_exercise_id, Number(linha.total));
  }
  return contagem;
}
