/**
 * A sequência de dias treinados — o "🔥 5 dias seguidos" da home.
 *
 * Função pura, sem banco e sem React. É a conta mais fácil de errar do
 * milestone, e por isso mora sozinha: quem agrupa os dias é o banco
 * (`dias_de_treino`, migration 0013), quem conta a corrente é este arquivo.
 *
 * A virada de dia é sempre no fuso do produto (`./fuso`), nunca no do processo:
 * o servidor roda em UTC e às 21h no Brasil já é o dia seguinte lá — que é
 * exatamente o horário em que se treina. Com o fuso errado, um treino da
 * segunda à noite contaria como terça e a sequência de quem treina seg/qua/sex
 * apareceria maior do que é.
 */

import { diaLocal, diaSomandoDias } from "./fuso";

/**
 * Quantos dias seguidos, contando de hoje para trás.
 *
 * `dias` são dias de calendário ("2026-09-05"), sem repetição — duas sessões no
 * mesmo dia são um dia só, e é o `distinct` do banco que garante isso.
 *
 * **O dia de hoje é opcional na corrente.** Quem treinou ontem e ainda não
 * treinou hoje continua com a sequência viva: o dia não acabou, e zerar o
 * contador às 00h01 puniria alguém que ainda vai treinar. Quem não treinou nem
 * hoje nem ontem está em zero — aí o dia sem treino já passou inteiro.
 *
 * `agora` é parâmetro para a função continuar pura e para o teste não depender
 * do relógio da máquina.
 */
export function sequenciaDeDias(
  dias: Iterable<string>,
  agora: Date | string = new Date(),
): number {
  const treinados = new Set(dias);
  if (treinados.size === 0) return 0;

  const hoje = diaLocal(agora);
  const inicio = treinados.has(hoje) ? hoje : diaSomandoDias(hoje, -1);
  if (!treinados.has(inicio)) return 0;

  let total = 0;
  let cursor = inicio;
  // Termina quando falta um dia. O laço não passa do tamanho do conjunto,
  // porque cada volta consome um dia distinto que estava nele.
  while (treinados.has(cursor)) {
    total += 1;
    cursor = diaSomandoDias(cursor, -1);
  }

  return total;
}
