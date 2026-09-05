import "server-only";

import {
  agruparProgresso,
  type ExercicioDoProgresso,
  type SerieDoProgresso,
} from "@/lib/domain/progresso";
import { createClient } from "@/lib/supabase/server";

import {
  chaveDoExercicio,
  exerciciosPorReferencia,
  type ReferenciaDeExercicio,
} from "./exercicios";

/** Tamanho da página ao varrer `session_sets`. Mesmo teto do histórico. */
const PAGINA_DE_SERIES = 1000;

export type ExercicioComProgresso = ExercicioDoProgresso & {
  /** Nome de exibição. Exercício próprio apagado vira o rótulo genérico. */
  nome: string;
  /** O sinalizador da prescrição, não a ausência de carga no histórico. */
  is_bodyweight: boolean;
};

/**
 * O histórico inteiro do aluno, agrupado por exercício.
 *
 * Uma varredura só, paginada por `range` até a página vir curta. O corte de
 * página do PostgREST é silencioso, e aqui ele apagaria treino da curva sem
 * avisar — o defeito que o card chama de "mentir sobre a evolução do aluno".
 *
 * A tela carrega tudo de uma vez de propósito: o acordeão abre e o filtro de
 * intervalo muda sem ir ao servidor, que é o que se quer de um app usado com a
 * internet da academia. O teto por exercício (`LIMITE_DE_SESSOES`) é aplicado
 * no agrupamento, e a tela avisa quando encosta nele.
 *
 * Sessão em andamento fica de fora (`finished_at` não nulo): ela é o treino de
 * agora, e entraria na curva como um dia pela metade.
 *
 * O filtro por `student_id` está aqui mesmo com o RLS cobrindo: a query não
 * deve depender só da policy para saber de quem é o dado.
 */
export async function progressoDoAluno(
  alunoId: string,
): Promise<ExercicioComProgresso[]> {
  const supabase = await createClient();

  const series: SerieDoProgresso[] = [];
  const referencias = new Map<string, ReferenciaDeExercicio>();

  for (let inicio = 0; ; inicio += PAGINA_DE_SERIES) {
    const { data, error } = await supabase
      .from("session_sets")
      .select(
        "session_id, set_number, load_kg, reps, skipped, workout_sessions!inner(student_id, finished_at), workout_exercises!inner(exercise_id, exercise_source)",
      )
      .eq("workout_sessions.student_id", alunoId)
      .not("workout_sessions.finished_at", "is", null)
      .order("session_id")
      .order("workout_exercise_id")
      .order("set_number")
      .range(inicio, inicio + PAGINA_DE_SERIES - 1);

    if (error) throw error;
    const pagina = data ?? [];

    for (const linha of pagina) {
      const concluidaEm = linha.workout_sessions?.finished_at;
      if (!concluidaEm) continue;

      const chave = chaveDoExercicio(linha.workout_exercises);
      referencias.set(chave, {
        exercise_id: linha.workout_exercises.exercise_id,
        exercise_source: linha.workout_exercises.exercise_source,
      });

      series.push({
        chave,
        sessaoId: linha.session_id,
        concluidaEm,
        set_number: linha.set_number,
        // `load_kg` é `numeric` no Postgres e chega como string no cliente JS:
        // sem o `Number()` a escala do gráfico ordena "9" acima de "80".
        load_kg: linha.load_kg === null ? null : Number(linha.load_kg),
        reps: linha.reps,
        skipped: linha.skipped,
      });
    }

    if (pagina.length < PAGINA_DE_SERIES) break;
  }

  const agrupado = agruparProgresso(series);
  if (!agrupado.length) return [];

  // Duas consultas no total — uma por origem —, nunca uma por exercício.
  const nomes = await exerciciosPorReferencia(
    agrupado.flatMap((e) => {
      const ref = referencias.get(e.chave);
      return ref ? [ref] : [];
    }),
  );

  return agrupado.map((exercicio) => {
    const dados = nomes.get(exercicio.chave);
    return {
      ...exercicio,
      // Exercício próprio apagado depois do treino: a linha de `exercises` sumiu
      // mas o histórico do aluno continua valendo. Nome genérico, sem inventar.
      nome: dados?.name ?? "Exercício removido",
      is_bodyweight: dados?.is_bodyweight ?? exercicio.pesoCorporal,
    };
  });
}
