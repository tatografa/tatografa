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
  /** RIR alvo ("0-2"). Nulo = o personal não prescreveu. */
  rir_target: string | null;
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

const COLUNAS_PRESCRICAO =
  "id, workout_id, exercise_id, exercise_source, position, sets, reps_target, rir_target, rest_seconds, technique, notes";

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
      rir_target: linha.rir_target,
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
