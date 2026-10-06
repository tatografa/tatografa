/**
 * A evolução do aluno por exercício. Funções puras, sem banco e sem React.
 *
 * Esta é a tela que o doc 01 chama de valor central do produto — e é também a
 * que mente com mais facilidade: um agrupamento errado aqui não estoura em
 * lugar nenhum, só desenha uma linha plausível sobre uma evolução que não
 * aconteceu. Por isso tudo o que vira número ou coordenada mora neste arquivo,
 * onde dá para conferir sem subir o app.
 *
 * A identidade do exercício é a mesma chave opaca de `recordes.ts`, montada
 * pela camada de dados a partir de `(exercise_source, exercise_id)`. Agrupar
 * por `workout_exercise_id` faria a curva recomeçar do zero a cada macrotreino
 * novo.
 */

import { FUSO } from "./fuso";
import { formatarNumero } from "./historico";

/** Uma série registrada, com a sessão a que pertence. */
export type SerieDoProgresso = {
  chave: string;
  sessaoId: string;
  /** `workout_sessions.finished_at`. Sessão em andamento nunca chega aqui. */
  concluidaEm: string;
  set_number: number;
  load_kg: number | null;
  reps: number | null;
  skipped: boolean;
};

/** Uma série, do jeito que a planilha e o ponto do gráfico mostram. */
export type SerieNaSessao = {
  set_number: number;
  carga: number | null;
  reps: number | null;
};

/** Um dia de treino daquele exercício. */
export type SessaoDoExercicio = {
  sessaoId: string;
  concluidaEm: string;
  /**
   * A **carga máxima daquela sessão** (doc 03, `exerciseProgress`) — é o ponto
   * da linha. Nula em exercício de peso corporal, que por isso fica fora do
   * gráfico de carga.
   */
  cargaMaxima: number | null;
  /** Repetições da série que deu a carga máxima. */
  repsDaMaxima: number | null;
  /** Todas as séries feitas naquele dia, em ordem de prescrição. */
  series: SerieNaSessao[];
};

export type ExercicioDoProgresso = {
  chave: string;
  /** Da mais recente para a mais antiga: é assim que a planilha lê. */
  sessoes: SessaoDoExercicio[];
  /** Nenhuma sessão com carga registrada — o gráfico de carga não se aplica. */
  pesoCorporal: boolean;
};

/**
 * Teto de sessões guardadas por exercício.
 *
 * A tela carrega o histórico inteiro de uma vez para não ir ao servidor a cada
 * acordeão aberto, e um aluno de um ano tem milhares de séries. Sessenta
 * sessões do mesmo exercício são cinco meses treinando três vezes por semana —
 * folga de sobra para o piloto, e um teto que a tela **avisa** quando encosta,
 * porque corte silencioso faz o aluno achar que perdeu treino.
 */
export const LIMITE_DE_SESSOES = 60;

/** Séries que valem: pulada não é treino feito. */
function contaComoFeita(serie: SerieDoProgresso): boolean {
  if (serie.skipped) return false;
  return serie.load_kg !== null || serie.reps !== null;
}

/**
 * Agrupa as séries soltas em exercício → sessão → séries.
 *
 * Os exercícios saem ordenados pelo **treinado mais recentemente**: é o que o
 * aluno abre o app para ver, e empurra para o fim o exercício que saiu do
 * programa há dois meses.
 */
export function agruparProgresso(
  series: SerieDoProgresso[],
): ExercicioDoProgresso[] {
  const porExercicio = new Map<string, Map<string, SessaoDoExercicio>>();

  for (const serie of series) {
    if (!contaComoFeita(serie)) continue;

    const sessoes = porExercicio.get(serie.chave) ?? new Map();
    porExercicio.set(serie.chave, sessoes);

    const sessao = sessoes.get(serie.sessaoId) ?? {
      sessaoId: serie.sessaoId,
      concluidaEm: serie.concluidaEm,
      cargaMaxima: null,
      repsDaMaxima: null,
      series: [],
    };

    sessao.series.push({
      set_number: serie.set_number,
      carga: serie.load_kg,
      reps: serie.reps,
    });

    // A carga máxima do dia é o ponto da linha. Empate de carga fica com as
    // repetições maiores — a mesma regra da pílula "última vez".
    if (
      serie.load_kg !== null &&
      (sessao.cargaMaxima === null ||
        serie.load_kg > sessao.cargaMaxima ||
        (serie.load_kg === sessao.cargaMaxima &&
          (serie.reps ?? 0) > (sessao.repsDaMaxima ?? 0)))
    ) {
      sessao.cargaMaxima = serie.load_kg;
      sessao.repsDaMaxima = serie.reps;
    }

    sessoes.set(serie.sessaoId, sessao);
  }

  const exercicios: ExercicioDoProgresso[] = [];

  for (const [chave, mapaDeSessoes] of porExercicio) {
    const sessoes = [...mapaDeSessoes.values()]
      .map((sessao) => ({
        ...sessao,
        series: [...sessao.series].sort((a, b) => a.set_number - b.set_number),
      }))
      .sort(ordemDecrescente)
      .slice(0, LIMITE_DE_SESSOES);

    if (!sessoes.length) continue;

    exercicios.push({
      chave,
      sessoes,
      pesoCorporal: sessoes.every((s) => s.cargaMaxima === null),
    });
  }

  return exercicios.sort((a, b) =>
    ordemDecrescente(a.sessoes[0], b.sessoes[0]),
  );
}

/** Mais recente primeiro. O id desempata para a ordem não depender da entrada. */
function ordemDecrescente(a: SessaoDoExercicio, b: SessaoDoExercicio): number {
  const diferenca = Date.parse(b.concluidaEm) - Date.parse(a.concluidaEm);
  if (diferenca !== 0 && !Number.isNaN(diferenca)) return diferenca;
  return b.sessaoId.localeCompare(a.sessaoId);
}

/** Os intervalos do filtro (doc 05). `null` é "Total". */
export const INTERVALOS = [
  { rotulo: "6 sessões", sessoes: 6 },
  { rotulo: "12 sessões", sessoes: 12 },
  { rotulo: "Total", sessoes: null },
] as const;

export type Intervalo = (typeof INTERVALOS)[number]["sessoes"];

/** As N sessões mais recentes, ainda da mais recente para a mais antiga. */
export function recortarIntervalo(
  sessoes: SessaoDoExercicio[],
  intervalo: Intervalo,
): SessaoDoExercicio[] {
  return intervalo === null ? sessoes : sessoes.slice(0, intervalo);
}

// ------------------------------------------------------------- gráfico -----

export type SessaoComCarga = SessaoDoExercicio & { cargaMaxima: number };

/**
 * As sessões que entram no gráfico de carga, na ordem do eixo.
 *
 * **O eixo é cronológico: mais antigo à esquerda, mais recente à direita.** As
 * listas da tela são "mais recente primeiro" (o doc 05 pede isso do acordeão e
 * da lista de exercícios), mas inverter o eixo do gráfico inverteria o
 * significado de uma barra crescendo — e o card avisa que erro aqui mente sobre
 * a evolução do aluno.
 *
 * Só entram sessões com carga. Lista vazia é exercício de peso corporal, que
 * aparece na planilha e não no gráfico.
 */
export function sessoesComCarga(sessoes: SessaoDoExercicio[]): SessaoComCarga[] {
  return sessoes
    .filter((s): s is SessaoComCarga => s.cargaMaxima !== null)
    .sort((a, b) => -ordemDecrescente(a, b));
}

/** "67,5 kg". */
export function formatarCarga(kg: number): string {
  return `${formatarNumero(kg)} kg`;
}

/**
 * O que a linha fechada do acordeão mostra: o último registro do exercício.
 *
 * Peso corporal não tem carga, e "0 kg" diria que o aluno não levantou nada
 * quando ele levantou o próprio corpo.
 */
export function ultimoRegistro(exercicio: ExercicioDoProgresso): string {
  const ultima = exercicio.sessoes[0];
  if (!ultima) return "—";
  if (ultima.cargaMaxima === null) {
    const reps = Math.max(...ultima.series.map((s) => s.reps ?? 0));
    return reps > 0 ? `${reps} reps` : "—";
  }
  return formatarCarga(ultima.cargaMaxima);
}

/**
 * Uma série em texto: "60 kg × 10", ou "9 reps" no exercício de peso corporal.
 *
 * Uma função só para a planilha e para o painel do ponto do gráfico: são a
 * mesma informação em dois lugares, e duas cópias divergiriam na primeira
 * mudança de formato.
 */
export function textoDaSerie(serie: SerieNaSessao): string {
  if (serie.carga === null) {
    return serie.reps === null ? "—" : `${serie.reps} reps`;
  }
  const carga = formatarCarga(serie.carga);
  return serie.reps === null ? carga : `${carga} × ${serie.reps}`;
}

/** "27/08". Data curta do eixo e do cabeçalho de sessão na planilha. */
export function dataCurta(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}
