import { FUSO, diaLocal, diaLocalEmMs, diaSomandoDias } from "@/lib/domain/fuso";
import type { Enums } from "@/types/database";

/**
 * A agenda de sessões presenciais, na parte que não depende de banco.
 *
 * Tudo aqui conta dia e hora **no fuso do produto**, nunca no do processo: o
 * servidor roda em UTC e às 21h no Brasil já virou o dia seguinte — que é
 * justamente o horário em que se treina. Foi assim que o histórico rotulava a
 * sessão de ontem como de hoje (M1-06).
 */

export type Situacao = Enums<"appointment_status">;

/** Duração padrão de uma sessão. O campo aceita mudar; isto é o que ele abre. */
export const DURACAO_PADRAO = 60;

export const ROTULO_DA_SITUACAO: Record<Situacao, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  faltou: "Faltou",
  cancelada: "Cancelada",
};

/* ------------------------------------------------------------- a semana -- */

export type Semana = {
  /** Segunda-feira, como "2026-09-14". */
  de: string;
  /** Domingo da mesma semana. */
  ate: string;
};

/**
 * A semana de segunda a domingo que contém um dia.
 *
 * **Segunda, e não a data de início de nada.** Aqui é o oposto do macrotreino:
 * a semana da rotação sai do `started_at` do programa porque ela é uma janela
 * de sete dias corridos daquele aluno; a agenda é um calendário, e quem olha
 * espera a semana do calendário — "essa semana" para um personal começa na
 * segunda.
 */
export function semanaDe(quando: Date | string = new Date()): Semana {
  const dia = diaLocal(typeof quando === "string" ? quando : quando.toISOString());
  // `getUTCDay` sobre um instante montado com `Date.UTC` devolve o dia da
  // semana daquele dia de calendário, sem fuso no meio. Domingo é 0; a conta
  // abaixo transforma isso em "quantos dias desde a segunda".
  const diaDaSemana = new Date(diaLocalEmMs(dia)).getUTCDay();
  const desdeSegunda = (diaDaSemana + 6) % 7;
  const de = diaSomandoDias(dia, -desdeSegunda);
  return { de, ate: diaSomandoDias(de, 6) };
}

/** A semana vizinha, para os botões de navegar. */
export function semanaVizinha(semana: Semana, passos: number): Semana {
  return semanaDe(diaSomandoDias(semana.de, passos * 7));
}

/**
 * A faixa de instantes que a consulta pede ao banco para cobrir a semana.
 *
 * Meia-noite de segunda **no fuso do produto** até meia-noite da segunda
 * seguinte. Usar o dia solto (`"2026-09-14"`) como limite mandaria meia-noite
 * UTC, que em São Paulo ainda é 21h de domingo — e a consulta traria a sessão
 * de domingo à noite como se fosse da semana que vem.
 */
export function faixaDaSemana(semana: Semana): { de: string; ate: string } {
  return {
    de: inicioDoDiaEmUtc(semana.de),
    ate: inicioDoDiaEmUtc(diaSomandoDias(semana.ate, 1)),
  };
}

/**
 * Meia-noite de um dia de calendário no fuso do produto, em ISO.
 *
 * O deslocamento do Brasil já foi -02 no horário de verão e é -03 sem ele, e
 * ele pode voltar. Em vez de fixar "-03:00", a função **mede** o deslocamento
 * daquele dia perguntando ao `Intl` — assim a conta continua certa se a regra
 * mudar de novo.
 */
export function inicioDoDiaEmUtc(dia: string): string {
  const meiaNoiteComoUtc = diaLocalEmMs(dia);
  // Quanto o fuso estava atrás do UTC naquele instante. Duas leituras porque a
  // virada do horário de verão acontece dentro do dia: a segunda usa o palpite
  // da primeira e assenta.
  let deslocamento = deslocamentoEmMs(new Date(meiaNoiteComoUtc));
  deslocamento = deslocamentoEmMs(new Date(meiaNoiteComoUtc + deslocamento));
  return new Date(meiaNoiteComoUtc + deslocamento).toISOString();
}

function deslocamentoEmMs(instante: Date): number {
  const comoSeFosseUtc = new Date(
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: FUSO,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(instante)
      .replace(" ", "T") + "Z",
  );
  return instante.getTime() - comoSeFosseUtc.getTime();
}

/** Os sete dias da semana, para a tela desenhar as colunas mesmo vazias. */
export function diasDaSemana(semana: Semana): string[] {
  return Array.from({ length: 7 }, (_, i) => diaSomandoDias(semana.de, i));
}

/* ---------------------------------------------------------- os conflitos -- */

/** O mínimo que a checagem de conflito precisa saber sobre uma sessão. */
export type SessaoNoHorario = {
  id: string;
  /** Dia de calendário no fuso do produto, "2026-09-15". */
  dia: string;
  /** Minutos desde a meia-noite daquele dia, no relógio de quem treina. */
  minutoDoDia: number;
  duracaoMin: number;
  situacao: Situacao;
};

/**
 * As sessões que se sobrepõem a uma nova.
 *
 * **A tela avisa; o banco não impede.** Duas sessões no mesmo horário podem ser
 * erro de digitação ou dois alunos treinando juntos, e só o personal sabe qual
 * — uma constraint de exclusão recusaria o atendimento em dupla, que é comum,
 * para evitar um engano que ele enxerga na hora.
 *
 * A comparação é em **relógio local**, e não em instante: quem chama é um
 * componente cliente, e `new Date("2026-09-15T18:00")` no navegador usa o fuso
 * **do navegador**. Com o personal viajando, ou com o relógio do computador em
 * outro fuso, o aviso apareceria deslocado. Dia mais minuto do dia não têm esse
 * problema — os dois lados já vêm convertidos pelo servidor.
 *
 * Cancelada não conflita com nada: o horário dela está livre, é esse o sentido
 * de cancelar.
 */
export function conflitos(
  nova: { dia: string; minutoDoDia: number; duracaoMin: number },
  existentes: SessaoNoHorario[],
  ignorando?: string,
): SessaoNoHorario[] {
  const fim = nova.minutoDoDia + nova.duracaoMin;

  return existentes.filter((s) => {
    if (s.id === ignorando || s.situacao === "cancelada") return false;
    if (s.dia !== nova.dia) return false;
    // Encostar não é sobrepor: das 17h às 18h e das 18h às 19h convivem.
    return nova.minutoDoDia < s.minutoDoDia + s.duracaoMin && s.minutoDoDia < fim;
  });
}

/** "18:30" → 1110. O formato é o que o `<input type="time">` devolve. */
export function minutoDoDia(hora: string): number | null {
  const casa = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora);
  if (!casa) return null;
  return Number(casa[1]) * 60 + Number(casa[2]);
}

/** O minuto do dia de um instante, no fuso do produto. */
export function minutoDoDiaDoInstante(iso: string): number {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  const [h, m] = texto.split(":").map(Number);
  return h * 60 + m;
}

/* ----------------------------------------------------------- formatação -- */

/** "seg, 15 de set" — o rótulo da coluna do dia. */
export function rotuloDoDiaDaAgenda(dia: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  })
    .format(new Date(diaLocalEmMs(dia)))
    .replace(/\.$/, "")
    .replace(/\./g, "");
}

/** "14 a 20 de setembro" — o cabeçalho da semana. */
export function rotuloDaSemana({ de, ate }: Semana): string {
  const inicio = new Date(diaLocalEmMs(de));
  const fim = new Date(diaLocalEmMs(ate));

  const mesDe = mes(inicio);
  const mesAte = mes(fim);
  const diaDe = inicio.getUTCDate();
  const diaAte = fim.getUTCDate();

  // Semana que atravessa o mês precisa dos dois nomes, senão "29 a 4 de
  // outubro" diz que a semana começou num 29 de outubro que não existe nela.
  if (mesDe !== mesAte) return `${diaDe} de ${mesDe} a ${diaAte} de ${mesAte}`;
  return `${diaDe} a ${diaAte} de ${mesDe}`;
}

function mes(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    month: "long",
  }).format(data);
}

/** "18h" ou "18h30" — sem os zeros que não dizem nada. */
export function horaDaSessaoNaAgenda(iso: string): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  const [hora, minuto] = texto.split(":");
  return minuto === "00" ? `${hora}h` : `${hora}h${minuto}`;
}

/** "1h", "45min", "1h30" — como um personal fala de duração. */
export function duracaoEmTexto(minutos: number): string {
  if (minutos < 60) return `${minutos}min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h${resto}`;
}

/**
 * A sessão já passou e continua "agendada"?
 *
 * É a fila de trabalho da tela: sessão passada sem marcação é presença que
 * ninguém registrou, e a aderência que o painel mostra depende dela.
 */
export function esperandoMarcacao(
  sessao: { starts_at: string; duration_minutes: number; status: Situacao },
  agora: Date = new Date(),
): boolean {
  if (sessao.status !== "agendada") return false;
  const fim = new Date(sessao.starts_at).getTime() + sessao.duration_minutes * 60_000;
  return fim < agora.getTime();
}
