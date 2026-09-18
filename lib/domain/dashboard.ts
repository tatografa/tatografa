/**
 * Os três gráficos do dashboard do personal (doc 06 §2): crescimento da
 * carteira, atividade diária e as maiores progressões de carga.
 *
 * Funções puras, sem banco e sem React. Módulo neutro de propósito: os rótulos
 * e a geometria são usados pela página (servidor) e pelos componentes de
 * gráfico (cliente), e `lib/queries/` não pode ser importado por componente
 * cliente — foi assim que `PERIODOS`, `iniciaisDe` e `LIMITE_DAS_OBSERVACOES`
 * quebraram o build, cada um na sua vez.
 *
 * **Nenhum rótulo daqui passa por `new Date(texto)` sobre um dia de
 * calendário.** "2026-09-01" já é um dia; `new Date` o lê como meia-noite UTC,
 * que em São Paulo ainda é 31 de agosto — e o mês inteiro do gráfico andaria
 * para trás. Onde é preciso saber o dia da semana, a conta passa por
 * `diaLocalEmMs`, que monta o dia em UTC justamente para não ter fuso no meio.
 */

import { diaLocal, diaLocalEmMs, diaSomandoDias } from "./fuso";
import { formatarNumero } from "./historico";

/** Quantos meses o gráfico de crescimento mostra. */
export const MESES_DO_CRESCIMENTO = 12;

/** Quantos dias de calendário a barra de atividade cobre. */
export const DIAS_DA_ATIVIDADE = 30;

/**
 * A janela das progressões.
 *
 * Noventa dias, e não "tudo": um ganho de 2019 não é notícia de hoje, e a
 * lista existe para o personal saber o que elogiar **nesta semana**. É também
 * mais ou menos o tamanho de dois macrotreinos, então quase todo aluno ativo
 * tem duas sessões do mesmo exercício dentro dela.
 */
export const DIAS_DAS_PROGRESSOES = 90;

/** Quantas linhas o "top" mostra — o número está no título do doc 06. */
export const LIMITE_DAS_PROGRESSOES = 10;

/** Um ponto do crescimento: o tamanho da carteira ao fim daquele mês. */
export type PontoDoMes = { mes: string; total: number };

/** Um dia da barra de atividade. */
export type DiaDaAtividade = { dia: string; total: number };

/** Uma linha do top de progressões, como a RPC devolve. */
export type Progressao = {
  studentId: string;
  aluno: string;
  exercicio: string;
  cargaInicial: number;
  cargaFinal: number;
  sessoes: number;
};

/**
 * A janela [de, ate) da atividade, em dias de calendário do fuso do produto.
 *
 * `ate` é exclusivo e vale **amanhã**: o treino de hoje precisa aparecer, e um
 * fim inclusivo em "hoje" dependeria de a comparação do banco ser `<=`, que é
 * a diferença que ninguém lembra de conferir.
 */
export function janelaDaAtividade(
  dias = DIAS_DA_ATIVIDADE,
  quando: Date | string = new Date(),
): { de: string; ate: string } {
  const hoje = diaLocal(quando);
  return { de: diaSomandoDias(hoje, -(dias - 1)), ate: diaSomandoDias(hoje, 1) };
}

/** O primeiro dia da janela das progressões. */
export function desdeQuandoProgredir(
  dias = DIAS_DAS_PROGRESSOES,
  quando: Date | string = new Date(),
): string {
  return diaSomandoDias(diaLocal(quando), -dias);
}

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

const MESES_POR_EXTENSO = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const DIAS_DA_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "set" — o rótulo do eixo, que precisa caber embaixo de um ponto. */
export function rotuloDoMes(mes: string): string {
  return MESES[Number(mes.slice(5, 7)) - 1] ?? "";
}

/** "setembro de 2026" — o que o leitor de tela ouve. */
export function rotuloDoMesPorExtenso(mes: string): string {
  return `${MESES_POR_EXTENSO[Number(mes.slice(5, 7)) - 1] ?? ""} de ${mes.slice(0, 4)}`;
}

/** "18/09". */
export function rotuloDoDiaCurto(dia: string): string {
  return `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
}

/** "qui, 18/09" — o nome acessível de cada barra. */
export function rotuloDoDiaComSemana(dia: string): string {
  // `diaLocalEmMs` monta o dia em UTC de propósito: `getUTCDay` sobre ele dá o
  // dia da semana do calendário, sem o fuso do aparelho no meio.
  const semana = DIAS_DA_SEMANA[new Date(diaLocalEmMs(dia)).getUTCDay()] ?? "";
  return `${semana}, ${rotuloDoDiaCurto(dia)}`;
}

/** É sábado ou domingo? O fim de semana ganha um tom mais claro no eixo. */
export function ehFimDeSemana(dia: string): boolean {
  const semana = new Date(diaLocalEmMs(dia)).getUTCDay();
  return semana === 0 || semana === 6;
}

export type LinhaDoCrescimento = {
  pontos: { x: number; y: number; ponto: PontoDoMes }[];
  caminho: string;
  /** O caminho fechado até a base, para a área sob a linha. */
  area: string;
  maximo: number;
};

/**
 * A geometria da linha de crescimento.
 *
 * **A base é zero, sempre** — ao contrário do gráfico de carga do aluno, que
 * escala entre o mínimo e o máximo. Lá a pergunta é "mudou?", e cortar o eixo
 * é o que torna a mudança visível; aqui a pergunta é "quantos alunos eu tenho?",
 * e um eixo cortado transformaria 12 para 13 numa escalada. Contagem se desenha
 * a partir do zero.
 */
export function linhaDoCrescimento(
  pontos: PontoDoMes[],
  largura: number,
  altura: number,
  folga = 8,
): LinhaDoCrescimento | null {
  if (!pontos.length) return null;

  const maximo = Math.max(...pontos.map((p) => p.total));
  const topo = folga;
  const base = altura - folga;
  // Carteira vazia (ou de um aluno só) não tem escala: a linha encosta na base
  // em vez de dividir por zero, e "tudo no chão" é a leitura certa.
  const escala = maximo === 0 ? 0 : (base - topo) / maximo;

  const desenhados = pontos.map((ponto, indice) => ({
    x:
      pontos.length === 1
        ? largura / 2
        : (indice / (pontos.length - 1)) * largura,
    y: base - ponto.total * escala,
    ponto,
  }));

  const caminho = desenhados
    .map((p, i) => `${i === 0 ? "M" : "L"}${arredondar(p.x)},${arredondar(p.y)}`)
    .join(" ");

  const area = `${caminho} L${arredondar(desenhados[desenhados.length - 1].x)},${base} L${arredondar(desenhados[0].x)},${base} Z`;

  return { pontos: desenhados, caminho, area, maximo };
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * O crescimento em palavras, para o `aria-label` do SVG.
 *
 * Sem isto o gráfico é um retângulo mudo para quem usa leitor de tela — e é a
 * mesma regra de `tendenciaEmPalavras`, no gráfico do aluno.
 */
export function crescimentoEmPalavras(pontos: PontoDoMes[]): string {
  if (!pontos.length) return "Sem histórico de alunos.";

  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const variacao = ultimo.total - primeiro.total;
  const agora = `${ultimo.total} ${ultimo.total === 1 ? "aluno" : "alunos"} em ${rotuloDoMesPorExtenso(ultimo.mes)}`;

  if (variacao === 0) {
    return `${agora}, o mesmo de ${rotuloDoMesPorExtenso(primeiro.mes)}.`;
  }
  const verbo = variacao > 0 ? "a mais" : "a menos";
  return `${agora}: ${Math.abs(variacao)} ${verbo} que em ${rotuloDoMesPorExtenso(primeiro.mes)}.`;
}

/** Quantos treinos e em quantos dias — o resumo que fica acima das barras. */
export function resumoDaAtividade(dias: DiaDaAtividade[]): {
  total: number;
  diasComTreino: number;
  melhorDia: DiaDaAtividade | null;
} {
  const total = dias.reduce((soma, d) => soma + d.total, 0);
  const diasComTreino = dias.filter((d) => d.total > 0).length;
  const melhorDia = dias.reduce<DiaDaAtividade | null>(
    (melhor, d) => (d.total > 0 && (!melhor || d.total > melhor.total) ? d : melhor),
    null,
  );
  return { total, diasComTreino, melhorDia };
}

/**
 * O ganho percentual de uma progressão.
 *
 * A RPC já recusa carga inicial zero, então a divisão é segura; a guarda existe
 * porque esta função também é chamada pelos testes e por qualquer tela futura,
 * e uma divisão por zero aqui viraria "Infinity%" na cara do personal.
 */
export function ganhoPercentual(inicial: number, final: number): number {
  if (inicial <= 0) return 0;
  return ((final - inicial) / inicial) * 100;
}

/** "+21%" — sempre com sinal, porque o número sozinho não diz a direção. */
export function formatarGanho(pct: number): string {
  return `+${formatarNumero(Math.round(pct * 10) / 10)}%`;
}

/** "25 → 30 kg", com uma unidade só: repetir "kg" dos dois lados é ruído. */
export function faixaDeCarga(inicial: number, final: number): string {
  return `${formatarNumero(inicial)} → ${formatarNumero(final)} kg`;
}
