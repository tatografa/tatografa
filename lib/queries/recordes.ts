import "server-only";

import {
  recordePorExercicio,
  ultimaVezPorExercicio,
  type SerieComparavel,
  type UltimaVez,
} from "@/lib/domain/recordes";
import { createClient } from "@/lib/supabase/server";

import { chaveDoExercicio, type ReferenciaDeExercicio } from "./exercicios";

/** Tamanho da página ao varrer `session_sets`. Mesmo teto do histórico. */
const PAGINA_DE_SERIES = 1000;

/** Uma linha da prescrição, na medida do que a referência precisa saber. */
export type ExercicioParaReferencia = {
  /** `workout_exercises.id` — a chave que a tela de execução usa. */
  id: string;
  exercicio: ReferenciaDeExercicio;
};

/**
 * Todas as séries que o aluno já registrou, em sessões **concluídas**, nos
 * exercícios pedidos.
 *
 * Uma consulta paginada para o treino inteiro, não uma por exercício: o card
 * é explícito sobre não abrir N+1 numa tela que o aluno abre entre séries, de
 * pé, com a internet da academia.
 *
 * Três recortes que não são detalhe:
 *
 * 1. **Sessão em andamento fica de fora** (`finished_at` não nulo). Ela é o
 *    treino de agora; contá-la faria a pílula "última vez" mostrar a série que
 *    o aluno acabou de confirmar.
 * 2. **`exceto` tira uma sessão específica.** É o que a tela de conclusão usa
 *    para perguntar "qual era o recorde antes de hoje": incluir a sessão que
 *    acabou faria a marca nova ser o próprio teto, e nenhum recorde apareceria.
 * 3. **A varredura por `range`** é a mesma precaução do histórico — o corte de
 *    página do PostgREST é silencioso, e uma página perdida aqui esconderia
 *    justamente o dia em que o aluno levantou mais.
 *
 * O embed de `workout_exercises` é o que resolve a identidade do exercício:
 * `session_sets` só guarda `workout_exercise_id`, que é uma linha de
 * prescrição, e a mesma prescrição se repete a cada treino e a cada programa.
 */
async function seriesAnteriores(
  alunoId: string,
  referencias: ReferenciaDeExercicio[],
  opcoes: { exceto?: string } = {},
): Promise<SerieComparavel[]> {
  if (!referencias.length) return [];

  const chavesPedidas = new Set(referencias.map(chaveDoExercicio));
  const idsPedidos = [...new Set(referencias.map((r) => r.exercise_id))];

  const supabase = await createClient();
  const series: SerieComparavel[] = [];

  for (let inicio = 0; ; inicio += PAGINA_DE_SERIES) {
    let consulta = supabase
      .from("session_sets")
      .select(
        "session_id, set_number, load_kg, reps, skipped, workout_sessions!inner(student_id, finished_at), workout_exercises!inner(exercise_id, exercise_source)",
      )
      .eq("workout_sessions.student_id", alunoId)
      .not("workout_sessions.finished_at", "is", null)
      .in("workout_exercises.exercise_id", idsPedidos);

    if (opcoes.exceto) consulta = consulta.neq("session_id", opcoes.exceto);

    const { data, error } = await consulta
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
      // O filtro do banco é por `exercise_id`; a origem se confere aqui. Sem
      // isto, um exercício próprio com o mesmo uuid de um do catálogo entraria
      // na conta do outro.
      if (!chavesPedidas.has(chave)) continue;

      series.push({
        chave,
        sessaoId: linha.session_id,
        concluidaEm,
        set_number: linha.set_number,
        // `load_kg` é `numeric` no Postgres e chega como string no cliente JS:
        // sem o `Number()`, `"9"` fica maior que `"80"` na comparação.
        load_kg: linha.load_kg === null ? null : Number(linha.load_kg),
        reps: linha.reps,
        skipped: linha.skipped,
      });
    }

    if (pagina.length < PAGINA_DE_SERIES) break;
  }

  return series;
}

/**
 * A pílula "última vez" de cada linha da prescrição, pronta para a tela.
 *
 * Chaveada por `workout_exercises.id` — a tela de execução pensa em linha de
 * prescrição, não em identidade de exercício. Duas linhas do mesmo exercício
 * no mesmo treino recebem a mesma referência, que é o certo: é o mesmo
 * movimento.
 *
 * Exercício que o aluno nunca fez simplesmente não aparece no objeto.
 */
export async function referenciaDoTreino(
  alunoId: string,
  exercicios: ExercicioParaReferencia[],
): Promise<Record<string, UltimaVez>> {
  const series = await seriesAnteriores(
    alunoId,
    exercicios.map((e) => e.exercicio),
  );
  const porChave = ultimaVezPorExercicio(series);

  const porLinha: Record<string, UltimaVez> = {};
  for (const exercicio of exercicios) {
    const ultima = porChave.get(chaveDoExercicio(exercicio.exercicio));
    if (ultima) porLinha[exercicio.id] = ultima;
  }
  return porLinha;
}

/**
 * A maior carga de cada exercício **antes** da sessão informada.
 *
 * É o teto que a tela de conclusão compara com o que o aluno acabou de fazer.
 */
export async function recordesAntesDaSessao(
  alunoId: string,
  referencias: ReferenciaDeExercicio[],
  sessaoId: string,
): Promise<Map<string, number>> {
  const series = await seriesAnteriores(alunoId, referencias, {
    exceto: sessaoId,
  });
  return recordePorExercicio(series);
}
