/**
 * Estado da execução do treino. Funções puras, sem banco, sem React e sem
 * `localStorage` — tudo o que decide "qual é a série da vez" mora aqui para
 * poder ser conferido sem subir a tela.
 *
 * A regra que atravessa o arquivo inteiro: **uma série é identificada por
 * `(workout_exercise_id, set_number)`**, exatamente como no índice único de
 * `session_sets`. Nada aqui conta linhas para saber em que série o aluno está;
 * contar daria o número errado assim que uma série for pulada ou corrigida.
 */

/** Passo do stepper de carga, em quilos (doc 05, seção 5). */
export const PASSO_DE_CARGA = 2.5;

/** Limites dos steppers. Espelham o que a Server Action valida. */
export const LIMITES_DA_EXECUCAO = {
  cargaMin: 0,
  cargaMax: 999.99,
  repsMin: 0,
  repsMax: 999,
} as const;

/** Quanto o botão "+30s" acrescenta ao descanso. */
export const ACRESCIMO_DE_DESCANSO = 30;

/** Uma linha da prescrição, na medida do que a execução precisa saber. */
export type ExercicioEmExecucao = {
  /** `workout_exercises.id` — a chave que `session_sets` referencia. */
  id: string;
  sets: number;
  rest_seconds: number;
};

/** Uma série registrada, do jeito que vai para `session_sets`. */
export type SerieDaExecucao = {
  workout_exercise_id: string;
  set_number: number;
  load_kg: number | null;
  reps: number | null;
  skipped: boolean;
};

/** Chave de uma série. Mesma tupla do índice único do banco. */
export function chaveDaSerie(
  workoutExerciseId: string,
  setNumber: number,
): string {
  return `${workoutExerciseId}#${setNumber}`;
}

/** Indexa uma lista de séries pela chave, para consulta em tempo constante. */
export function indexarSeries(
  series: SerieDaExecucao[],
): Map<string, SerieDaExecucao> {
  const mapa = new Map<string, SerieDaExecucao>();
  for (const serie of series) {
    mapa.set(chaveDaSerie(serie.workout_exercise_id, serie.set_number), serie);
  }
  return mapa;
}

/**
 * Junta o que veio do servidor com o que ainda está na fila local.
 *
 * A fila vence sempre: ela contém o que o aluno acabou de confirmar (ou
 * corrigir) e o servidor ainda não recebeu. O contrário faria uma correção
 * feita offline reverter para o valor antigo assim que a tela recarregasse.
 */
export function mesclarSeries(
  doServidor: SerieDaExecucao[],
  daFila: SerieDaExecucao[],
): Map<string, SerieDaExecucao> {
  const mapa = indexarSeries(doServidor);
  for (const serie of daFila) {
    mapa.set(chaveDaSerie(serie.workout_exercise_id, serie.set_number), serie);
  }
  return mapa;
}

/** Quantas séries de um exercício já têm registro (feitas ou puladas). */
export function seriesRegistradasDo(
  exercicio: ExercicioEmExecucao,
  series: Map<string, SerieDaExecucao>,
): number {
  let total = 0;
  for (let numero = 1; numero <= exercicio.sets; numero += 1) {
    if (series.has(chaveDaSerie(exercicio.id, numero))) total += 1;
  }
  return total;
}

/** O exercício acabou quando todas as séries prescritas têm registro. */
export function exercicioConcluido(
  exercicio: ExercicioEmExecucao,
  series: Map<string, SerieDaExecucao>,
): boolean {
  return seriesRegistradasDo(exercicio, series) >= exercicio.sets;
}

/**
 * O número da série ativa (1-based), ou `null` se o exercício acabou.
 *
 * É o menor número **sem registro**, não "a última + 1": se o aluno corrigir
 * uma série do meio, a ativa continua sendo a que falta, e não volta atrás.
 */
export function serieAtiva(
  exercicio: ExercicioEmExecucao,
  series: Map<string, SerieDaExecucao>,
): number | null {
  for (let numero = 1; numero <= exercicio.sets; numero += 1) {
    if (!series.has(chaveDaSerie(exercicio.id, numero))) return numero;
  }
  return null;
}

/**
 * Em que exercício o aluno deve cair ao abrir (ou reabrir) a execução: o
 * primeiro que ainda não acabou. Se todos acabaram, o último — a tela mostra
 * "concluir treino" em vez de um índice fora da lista.
 */
export function primeiroExercicioPendente(
  exercicios: ExercicioEmExecucao[],
  series: Map<string, SerieDaExecucao>,
): number {
  const indice = exercicios.findIndex((e) => !exercicioConcluido(e, series));
  if (indice >= 0) return indice;
  return Math.max(0, exercicios.length - 1);
}

export type ProgressoDaExecucao = {
  exerciciosConcluidos: number;
  totalDeExercicios: number;
  seriesRegistradas: number;
  totalDeSeries: number;
  /** 0 a 1, para a barra de progresso. */
  fracao: number;
};

/** Progresso da sessão, medido em exercícios concluídos (doc 05, topo). */
export function progressoDaExecucao(
  exercicios: ExercicioEmExecucao[],
  series: Map<string, SerieDaExecucao>,
): ProgressoDaExecucao {
  let exerciciosConcluidos = 0;
  let seriesRegistradas = 0;
  let totalDeSeries = 0;

  for (const exercicio of exercicios) {
    const feitas = seriesRegistradasDo(exercicio, series);
    seriesRegistradas += feitas;
    totalDeSeries += exercicio.sets;
    if (feitas >= exercicio.sets) exerciciosConcluidos += 1;
  }

  return {
    exerciciosConcluidos,
    totalDeExercicios: exercicios.length,
    seriesRegistradas,
    totalDeSeries,
    fracao: exercicios.length ? exerciciosConcluidos / exercicios.length : 0,
  };
}

/** Todo o treino terminou. */
export function execucaoConcluida(
  exercicios: ExercicioEmExecucao[],
  series: Map<string, SerieDaExecucao>,
): boolean {
  return exercicios.every((e) => exercicioConcluido(e, series));
}

/**
 * As séries que faltam num exercício, para gravar como puladas de uma vez.
 * Séries já registradas não são tocadas: pular o resto não apaga o que o
 * aluno fez.
 */
export function seriesQueFaltam(
  exercicio: ExercicioEmExecucao,
  series: Map<string, SerieDaExecucao>,
): SerieDaExecucao[] {
  const faltando: SerieDaExecucao[] = [];
  for (let numero = 1; numero <= exercicio.sets; numero += 1) {
    if (series.has(chaveDaSerie(exercicio.id, numero))) continue;
    faltando.push({
      workout_exercise_id: exercicio.id,
      set_number: numero,
      load_kg: null,
      reps: null,
      skipped: true,
    });
  }
  return faltando;
}

/**
 * Segundos que faltam de descanso.
 *
 * O descanso é guardado como **o instante em que termina**, não como um
 * contador que anda: `setInterval` para quando o celular bloqueia a tela, e o
 * aluno voltaria com o tempo congelado. Derivar do relógio dá o valor certo
 * mesmo depois de cinco minutos com o aparelho no bolso.
 */
export function segundosRestantes(fimEm: number, agora: number): number {
  return Math.max(0, Math.ceil((fimEm - agora) / 1000));
}

/** Alvo de repetições em número, para o stepper abrir no lugar certo. */
export function alvoDeRepeticoes(repsTarget: string): number {
  // `reps_target` é texto e pode ser faixa ("8-10"); a validação do editor
  // garante que é número ou faixa de números. O topo da faixa é o alvo: o
  // aluno mira no melhor caso e desce com o stepper se não alcançar.
  const numeros = repsTarget.match(/\d{1,3}/g);
  if (!numeros?.length) return LIMITES_DA_EXECUCAO.repsMin;
  const ultimo = Number(numeros[numeros.length - 1]);
  return Math.min(Math.max(ultimo, LIMITES_DA_EXECUCAO.repsMin), LIMITES_DA_EXECUCAO.repsMax);
}

/** Aplica um passo ao stepper, respeitando os limites. */
export function ajustar(
  valor: number,
  passo: number,
  minimo: number,
  maximo: number,
): number {
  const novo = valor + passo;
  const preso = Math.min(Math.max(novo, minimo), maximo);
  // Carga anda de 2,5 em 2,5: sem o arredondamento a soma binária deixa
  // 47.50000000000001 na tela e no banco.
  return Math.round(preso * 100) / 100;
}
