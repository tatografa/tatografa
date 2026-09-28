/**
 * O que o cartão "Programa atual" do perfil do aluno calcula sobre o histórico
 * de cada exercício: os grupos da planilha aberta (por data ou por série) e a
 * barra de cada sessão no gráfico.
 *
 * Função pura sobre `SessaoDoExercicio`, que é o mesmo dado da curva de
 * evolução do app do aluno (`agruparProgresso`). **A barra de "Carga" é a
 * carga máxima da sessão** — o mesmo ponto da linha que o aluno vê e o mesmo
 * critério do recorde (02/09): o desenho do painel é outro, o número é o mesmo.
 */

import { formatarNumero } from "./historico";
import {
  dataCurta,
  formatarCarga,
  textoDaSerie,
  type ExercicioDoProgresso,
  type SessaoDoExercicio,
} from "./progresso";

/**
 * A chave de um exercício entre as duas origens (catálogo e próprio do
 * personal). Mora aqui, e não só na consulta, porque o cartão do programa é
 * componente cliente e precisa casar a prescrição com o histórico — e uma
 * segunda cópia do formato da chave seria o jeito de as duas pararem de casar.
 */
export function chaveDe(origem: string, id: string): string {
  return `${origem}:${id}`;
}

/** Um bloco da planilha aberta: uma data, ou uma série ao longo das datas. */
export type GrupoDoHistorico = {
  titulo: string;
  /** "24 kg", ou "15 reps" no peso corporal. */
  maior: string;
  itens: { rotulo: string; valor: string }[];
};

/** O maior valor de uma lista de séries: carga, ou reps quando não há carga. */
function maiorDe(series: { carga: number | null; reps: number | null }[]): string {
  const cargas = series.map((s) => s.carga).filter((c): c is number => c !== null);
  if (cargas.length) return formatarCarga(Math.max(...cargas));
  const reps = series.map((s) => s.reps ?? 0);
  const maior = Math.max(0, ...reps);
  return maior > 0 ? `${maior} reps` : "—";
}

/**
 * "Por data": uma sessão por bloco, da mais recente para a mais antiga, com as
 * séries daquele dia.
 */
export function historicoPorData(sessoes: SessaoDoExercicio[]): GrupoDoHistorico[] {
  return sessoes.map((sessao) => ({
    titulo: dataCurta(sessao.concluidaEm),
    maior: maiorDe(sessao.series),
    itens: sessao.series.map((s) => ({ rotulo: `Série ${s.set_number}`, valor: textoDaSerie(s) })),
  }));
}

/**
 * "Por série": a série 1 de cada dia, depois a série 2… — é como o personal
 * vê se a última série cai mais que as outras de uma semana para a outra.
 */
export function historicoPorSerie(sessoes: SessaoDoExercicio[]): GrupoDoHistorico[] {
  const numeros = [...new Set(sessoes.flatMap((s) => s.series.map((x) => x.set_number)))].sort(
    (a, b) => a - b,
  );
  return numeros.map((numero) => {
    const dias = sessoes.flatMap((sessao) => {
      const serie = sessao.series.find((x) => x.set_number === numero);
      return serie ? [{ data: dataCurta(sessao.concluidaEm), serie }] : [];
    });
    return {
      titulo: `Série ${numero}`,
      maior: maiorDe(dias.map((d) => d.serie)),
      itens: dias.map((d) => ({ rotulo: d.data, valor: textoDaSerie(d.serie) })),
    };
  });
}

/**
 * O recorde do exercício: a maior carga já levantada nele (decisão do Otávio,
 * 02/09) — o mesmo número da tela de recordes do aluno. Peso corporal cai para
 * o maior número de repetições.
 */
export function recordeDoExercicio(exercicio: ExercicioDoProgresso): string {
  return maiorDe(exercicio.sessoes.flatMap((s) => s.series));
}

export type MetricaDoGrafico = "carga" | "repeticoes" | "volume";

export const METRICAS_DO_GRAFICO: { valor: MetricaDoGrafico; rotulo: string }[] = [
  { valor: "carga", rotulo: "Carga" },
  { valor: "repeticoes", rotulo: "Repetições" },
  { valor: "volume", rotulo: "Volume" },
];

/** Quantas sessões o gráfico de barras desenha: as mais recentes. */
export const BARRAS_DO_GRAFICO = 6;

export type BarraDoGrafico = { data: string; valor: number; texto: string; unidade: "kg" | "reps" };

/**
 * As barras de um exercício numa métrica, da sessão mais antiga para a mais
 * recente (o tempo corre para a direita, como na curva do aluno).
 *
 * - **Carga:** a carga máxima da sessão. Sem carga (peso corporal), o maior
 *   número de repetições — "0 kg" diria que o aluno não levantou nada.
 * - **Repetições:** o maior número de repetições numa série daquele dia.
 * - **Volume:** carga × repetições somadas, o mesmo volume do histórico; no
 *   peso corporal, as repetições somadas.
 */
export function barrasDoExercicio(
  sessoes: SessaoDoExercicio[],
  metrica: MetricaDoGrafico,
): BarraDoGrafico[] {
  return sessoes
    .slice(0, BARRAS_DO_GRAFICO)
    .reverse()
    .map((sessao) => {
      const series = sessao.series;
      const comCarga = series.some((s) => s.carga !== null);
      const maxReps = Math.max(0, ...series.map((s) => s.reps ?? 0));
      let valor: number;
      let unidade: "kg" | "reps";
      if (metrica === "carga" && comCarga) {
        valor = Math.max(...series.map((s) => s.carga ?? 0));
        unidade = "kg";
      } else if (metrica === "volume") {
        valor = series.reduce((soma, s) => soma + (comCarga ? (s.carga ?? 0) : 1) * (s.reps ?? 0), 0);
        unidade = comCarga ? "kg" : "reps";
      } else {
        valor = maxReps;
        unidade = "reps";
      }
      return {
        data: dataCurta(sessao.concluidaEm),
        valor,
        texto: `${formatarNumero(valor)} ${unidade}`,
        unidade,
      };
    });
}
