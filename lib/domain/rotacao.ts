/**
 * A rotação do macrotreino: qual treino o aluno faz agora.
 *
 * Funções puras, sem banco e sem React — a regra que decide o que aparece na
 * home tem que ser testável sem subir nada.
 *
 * A regra do doc 05, em uma frase: **o próximo da rotação, por `position`, que
 * ainda não foi feito nesta semana do programa**. Se todos já foram, recomeça
 * do primeiro.
 */

import { diaLocalEmMs, diaSomandoDias } from "./fuso";

const UM_DIA = 24 * 60 * 60 * 1000;

/** Janela de dias de calendário: `de` inclusivo, `ate` exclusivo. */
export type JanelaDeDias = { de: string; ate: string };

/**
 * A semana do programa em que uma data cai, contada a partir de `started_at`.
 *
 * Diferente de `semanaAtual` (em `treino.ts`) por não ter teto: aquela existe
 * para o rótulo da tela, e "Semana 9 de 8" não é rótulo. Esta existe para
 * recortar a janela da rotação, e travar no total faria a janela parar de andar
 * quando o programa passa do prazo — o aluno que continua treinando na semana
 * 9 veria o treino A sugerido para sempre, porque a janela congelada da semana
 * 8 nunca teria sessão nova dentro dela.
 *
 * Pode ser 0 ou negativa quando o programa começa no futuro, e isso é correto:
 * nada foi feito nele ainda.
 */
export function semanaCorridaDoPrograma(
  inicio: Date | string,
  quando: Date | string = new Date(),
): number {
  const dias = Math.floor((diaLocalEmMs(quando) - diaLocalEmMs(inicio)) / UM_DIA);
  return Math.floor(dias / 7) + 1;
}

/**
 * A janela da semana do programa que contém `quando`.
 *
 * A fronteira é o `started_at`, não a segunda-feira do calendário: um programa
 * que começou numa quarta tem a semana 1 de quarta a terça. Decisão do PM — o
 * número que a tela mostra ("Semana 3 de 8") e a rotação saem da mesma conta,
 * então nunca discordam. Alinhar com a segunda-feira daria uma primeira semana
 * de dois dias, e a rotação zeraria no meio dela.
 *
 * Os dois lados são dias de calendário no fuso do produto, e é assim que a
 * função `treinos_feitos_na_semana` compara no banco: comparar instantes em
 * UTC jogaria a sessão das 21h para o dia seguinte, que é o horário em que
 * mais se treina.
 */
export function janelaDaSemana(
  inicio: Date | string,
  quando: Date | string = new Date(),
): JanelaDeDias {
  const semana = semanaCorridaDoPrograma(inicio, quando);
  const de = diaSomandoDias(inicio, (semana - 1) * 7);
  return { de, ate: diaSomandoDias(de, 7) };
}

/** O mínimo que a rotação precisa saber sobre um treino. */
export type TreinoNaRotacao = {
  id: string;
  /** Ordem dentro do programa. A lista já chega ordenada por ela. */
  position: number;
  total_exercicios: number;
};

/**
 * O treino sugerido: o primeiro da ordem que ainda não foi feito na janela.
 *
 * Casos que a regra resolve, e que valem como especificação:
 *
 * - A/B/C com A e B feitos → sugere C.
 * - Todos feitos → sugere A de novo. A semana não "acaba"; o aluno que treina
 *   seis vezes numa semana de três treinos roda a fila duas vezes.
 * - A feito duas vezes e mais nada → sugere B. Feito é sim ou não; repetir o
 *   mesmo treino não avança nem atrasa a fila.
 * - Treino sem exercício prescrito é pulado, aqui e na hora de recomeçar:
 *   mandar o aluno abrir uma tela de execução vazia é pior que sugerir o
 *   seguinte. Se nenhum treino tem exercício, não há sugestão.
 *
 * `treinos` precisa chegar ordenado por `position` — é o índice confiável do
 * handoff da prescrição, e reordenar aqui por outro critério mudaria a rotação
 * que o personal montou.
 */
export function proximoDaRotacao<T extends TreinoNaRotacao>(
  treinos: readonly T[],
  feitosNaSemana: ReadonlySet<string>,
): T | null {
  const elegiveis = treinos.filter((treino) => treino.total_exercicios > 0);
  if (elegiveis.length === 0) return null;

  return elegiveis.find((treino) => !feitosNaSemana.has(treino.id)) ?? elegiveis[0];
}
