import {
  duracaoEmTexto,
  horaDaSessaoNaAgenda,
  rotuloDaSemana,
  rotuloDoDiaDaAgenda,
} from "@/lib/domain/agenda";
import { FUSO, diaLocal, diaLocalEmMs } from "@/lib/domain/fuso";
import {
  dataPorExtenso,
  duracaoCurta,
  formatarNumero,
  horaDaSessao,
  rotuloDoDia,
} from "@/lib/domain/historico";
import { langDe, type Idioma } from "@/lib/domain/idioma";
import {
  rotuloDoDiaComSemana,
  rotuloDoDiaCurto,
  rotuloDoMes,
  rotuloDoMesPorExtenso,
} from "@/lib/domain/dashboard";
import { dataCurta } from "@/lib/domain/progresso";

/**
 * Data, hora e número no idioma do app do aluno (etapa 2 da tradução, 05/10).
 *
 * **Em português, cada formato é a função que já existia** — o painel continua
 * usando aquelas, e duas implementações do mesmo "seg, 2 de set" divergiriam na
 * primeira mudança. Em inglês e espanhol o `Intl` faz o trabalho, sempre no fuso
 * do produto: o idioma muda a forma de escrever a data, não o dia em que o
 * treino aconteceu.
 *
 * A hora é "18h20" em português e "18:20" nos outros dois: o "h" é jeito
 * brasileiro de escrever hora, e o relógio de 24 horas é o que um app de
 * academia lê sem ambiguidade em qualquer dos três.
 */
export type Formatos = ReturnType<typeof formatos>;

const HOJE_ONTEM: Record<Idioma, { hoje: string; ontem: string }> = {
  pt: { hoje: "Hoje", ontem: "Ontem" },
  en: { hoje: "Today", ontem: "Yesterday" },
  es: { hoje: "Hoy", ontem: "Ayer" },
};

export function formatos(idioma: Idioma) {
  const locale = langDe(idioma);
  const pt = idioma === "pt";

  const numero = (valor: number) =>
    pt ? formatarNumero(valor) : valor.toLocaleString(locale, { maximumFractionDigits: 1 });

  /** "Hoje", "Ontem" ou "seg, 2 de set" — o rótulo de uma sessão. */
  const dia = (iso: string, agora: Date = new Date()) => {
    if (pt) return rotuloDoDia(iso, agora);
    const d = diaLocal(iso);
    if (d === diaLocal(agora.toISOString())) return HOJE_ONTEM[idioma].hoje;
    const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    if (d === diaLocal(ontem.toISOString())) return HOJE_ONTEM[idioma].ontem;
    return semPontoFinal(
      new Intl.DateTimeFormat(locale, {
        timeZone: FUSO,
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(new Date(iso)),
    );
  };

  const hora = (iso: string) => {
    if (pt) return horaDaSessao(iso);
    return new Intl.DateTimeFormat(locale, {
      timeZone: FUSO,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  };

  return {
    idioma,
    numero,
    /**
     * O número de um stepper de carga: "62,5" / "62.5", sem separador de
     * milhar e com até duas casas — o stepper anda de 2,5 em 2,5, mas a carga
     * da última vez pode ter vindo de 61,25.
     */
    decimal: (valor: number) =>
      valor.toLocaleString(locale, { maximumFractionDigits: 2, useGrouping: false }),
    /** "62,5 kg" / "62.5 kg". */
    carga: (kg: number) => `${numero(kg)} kg`,
    dia,
    /**
     * O mesmo rótulo no meio de uma frase: "começado hoje às…", "started
     * today at…". Em português tudo vai para minúscula ("seg, 2 de set" já é);
     * em inglês só "today"/"yesterday" — "Mon" continua com maiúscula.
     */
    diaNaFrase: (iso: string, agora: Date = new Date()) => {
      const rotulo = dia(iso, agora);
      const { hoje, ontem } = HOJE_ONTEM[idioma];
      return pt || rotulo === hoje || rotulo === ontem ? rotulo.toLowerCase() : rotulo;
    },
    hora,
    /** "segunda-feira, 2 de setembro de 2026" / "Monday, September 2, 2026". */
    dataPorExtenso: (iso: string) =>
      pt
        ? dataPorExtenso(iso)
        : new Intl.DateTimeFormat(locale, {
            timeZone: FUSO,
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(iso)),
    /** "27/08" / "08/27". */
    dataCurta: (iso: string) =>
      pt
        ? dataCurta(iso)
        : new Intl.DateTimeFormat(locale, { timeZone: FUSO, day: "2-digit", month: "2-digit" }).format(
            new Date(iso),
          ),
    /** Um dia de calendário ("2026-09-15"): "seg, 15 de set" / "Tue, Sep 15". */
    diaDaAgenda: (diaDoCalendario: string) =>
      pt
        ? rotuloDoDiaDaAgenda(diaDoCalendario)
        : semPontoFinal(
            new Intl.DateTimeFormat(locale, {
              timeZone: "UTC",
              weekday: "short",
              day: "numeric",
              month: "short",
            }).format(new Date(diaLocalEmMs(diaDoCalendario))),
          ),
    /** Um dia de calendário por extenso, sem dia da semana: "15 de setembro de 2026". */
    diaPorExtenso: (diaDoCalendario: string) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(diaLocalEmMs(diaDoCalendario))),
    /** "18h" / "18h30" em português; "18:00" / "18:30" nos outros. */
    horaDaAgenda: (iso: string) => (pt ? horaDaSessaoNaAgenda(iso) : hora(iso)),
    /**
     * Um mês no eixo: "set" / "Sep". Aceita "2026-09" e a data inteira
     * "2026-09-01" — o banco devolve o mês como `date` (`alunos_por_mes`), e
     * montar "2026-09-01-01" dava data inválida, que o `Intl` recusa com erro e
     * derrubava o dashboard em inglês e espanhol (05/10). O português nunca
     * sentiu porque `rotuloDoMes` só lê os caracteres do mês.
     */
    mesCurto: (mes: string) =>
      pt
        ? rotuloDoMes(mes)
        : semPontoFinal(
            new Intl.DateTimeFormat(locale, { timeZone: "UTC", month: "short" }).format(
              new Date(diaLocalEmMs(`${mes.slice(0, 7)}-01`)),
            ),
          ),
    /** O mês com o ano no eixo do gráfico: "nov/25", "Nov/25". */
    mesComAno: (mes: string) =>
      `${
        pt
          ? rotuloDoMes(mes)
          : semPontoFinal(
              new Intl.DateTimeFormat(locale, { timeZone: "UTC", month: "short" }).format(
                new Date(diaLocalEmMs(`${mes.slice(0, 7)}-01`)),
              ),
            )
      }/${mes.slice(2, 4)}`,
    /** "setembro de 2026" / "September 2026". Aceita os mesmos dois formatos. */
    mesPorExtenso: (mes: string) =>
      pt
        ? rotuloDoMesPorExtenso(mes)
        : new Intl.DateTimeFormat(locale, { timeZone: "UTC", month: "long", year: "numeric" }).format(
            new Date(diaLocalEmMs(`${mes.slice(0, 7)}-01`)),
          ),
    /** Um dia de calendário curto: "09/09" / "09/09" (es) / "9/9" (en). */
    diaCurto: (dia: string) =>
      pt
        ? rotuloDoDiaCurto(dia)
        : new Intl.DateTimeFormat(locale, { timeZone: "UTC", day: "2-digit", month: "2-digit" }).format(
            new Date(diaLocalEmMs(dia)),
          ),
    /** "qua, 09/09" / "Wed, 09/09". */
    diaComSemana: (dia: string) =>
      pt
        ? rotuloDoDiaComSemana(dia)
        : semPontoFinal(
            new Intl.DateTimeFormat(locale, {
              timeZone: "UTC",
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            }).format(new Date(diaLocalEmMs(dia))),
          ),
    /**
     * A semana da agenda: "14 a 20 de setembro" / "September 14 – 20" /
     * "14–20 de septiembre". Fora do português é o `formatRange` do `Intl`, que
     * já sabe juntar os dois meses quando a semana atravessa a virada.
     */
    semanaDaAgenda: (semana: { de: string; ate: string }) =>
      pt
        ? rotuloDaSemana(semana)
        : new Intl.DateTimeFormat(locale, { timeZone: "UTC", day: "numeric", month: "long" }).formatRange(
            new Date(diaLocalEmMs(semana.de)),
            new Date(diaLocalEmMs(semana.ate)),
          ),
    /**
     * Os sete dias da semana, de segunda a domingo, curtos e em maiúscula:
     * "SEG"… / "MON"… / "LUN"…. Saem do `Intl` nos três idiomas — 01/01/2024
     * foi uma segunda.
     */
    diasCurtosDaSemana: () =>
      Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short" })
          .format(new Date(Date.UTC(2024, 0, 1 + i)))
          .replace(/\./g, "")
          .toUpperCase(),
      ),
    /** Um dia de calendário com ano: "01/09/26" / "09/01/26" (en). */
    diaComAno: (dia: string) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).format(new Date(diaLocalEmMs(dia))),
    /** "48min", "1h05", "—" — igual nos três idiomas. */
    duracao: duracaoCurta,
    /** "45min", "1h", "1h30" — igual nos três idiomas. */
    duracaoEmMinutos: duracaoEmTexto,
  };
}

/** "sept." e "lun." viram "sept" e "lun": abreviatura com ponto pesa no rótulo. */
function semPontoFinal(texto: string): string {
  return texto.replace(/\.(?=,|\s|$)/g, "");
}
