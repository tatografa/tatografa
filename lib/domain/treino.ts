/**
 * Regras de negócio do treino. Funções puras, sem banco e sem React.
 *
 * Doc 02: "regras de negócio ficam em lib/domain/, não em componentes."
 * Nada aqui é coluna no banco — tudo é calculado na leitura (doc 03).
 */

/** Tempo médio de execução de uma série, usado só na duração estimada. */
const SEGUNDOS_POR_SERIE = 40;

export type ExercicioPrescrito = {
  sets: number;
  rest_seconds: number;
};

/**
 * Duração estimada do treino, em minutos, arredondada para múltiplo de 5.
 *
 * Fórmula do doc 03: soma(sets × (tempo_médio_série + rest_seconds)).
 * O último descanso de cada exercício não conta — o aluno já foi para o próximo.
 */
export function duracaoEstimadaMin(exercicios: ExercicioPrescrito[]): number {
  const segundos = exercicios.reduce((total, e) => {
    const execucao = e.sets * SEGUNDOS_POR_SERIE;
    const descanso = Math.max(0, e.sets - 1) * e.rest_seconds;
    return total + execucao + descanso;
  }, 0);

  const minutos = segundos / 60;
  return Math.max(5, Math.round(minutos / 5) * 5);
}

/** Total de séries prescritas no treino. */
export function totalDeSeries(exercicios: ExercicioPrescrito[]): number {
  return exercicios.reduce((total, e) => total + e.sets, 0);
}

export type SerieRegistrada = {
  load_kg: number | null;
  reps: number | null;
  skipped: boolean;
};

/**
 * Volume da sessão: soma de carga × reps.
 *
 * Série pulada não conta. Exercício de peso corporal (carga nula) também não
 * entra no volume — somar reps a quilos daria um número sem significado.
 */
export function volumeDaSessao(series: SerieRegistrada[]): number {
  return series.reduce((total, s) => {
    if (s.skipped || s.load_kg === null || s.reps === null) return total;
    return total + s.load_kg * s.reps;
  }, 0);
}

/**
 * Semana atual do macrotreino, contando a partir de `started_at`.
 *
 * Sempre entre 1 e `total_weeks`: um macrotreino que passou do prazo continua
 * mostrando a última semana em vez de um número maior que o total.
 */
export function semanaAtual(
  inicio: Date,
  totalDeSemanas: number,
  hoje: Date = new Date(),
): number {
  const umDia = 24 * 60 * 60 * 1000;
  const dias = Math.floor((diaLimpo(hoje) - diaLimpo(inicio)) / umDia);
  const semana = Math.floor(dias / 7) + 1;
  return Math.min(Math.max(semana, 1), totalDeSemanas);
}

/** Meia-noite local do dia, em milissegundos. Evita erro de fuso na subtração. */
function diaLimpo(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

/**
 * Saudação por horário, usada no cabeçalho da home do aluno.
 * Doc 05: "Bom dia, {nome}" — varia por horário.
 */
export function saudacao(hora: number = new Date().getHours()): string {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Formata segundos como m:ss — usado no timer de descanso e no cronômetro
 * da sessão.
 */
export function comoRelogio(segundos: number): string {
  const seguro = Math.max(0, Math.floor(segundos));
  const min = Math.floor(seguro / 60);
  const seg = seguro % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}
