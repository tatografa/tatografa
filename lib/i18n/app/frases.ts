import {
  sessoesComCarga,
  type ExercicioDoProgresso,
  type SerieNaSessao,
  type SessaoDoExercicio,
} from "@/lib/domain/progresso";
import type { UltimaVez } from "@/lib/domain/recordes";
import type { Formatos } from "@/lib/i18n/formatos";
import { plural, preencher } from "@/lib/i18n/texto";

import type { TextosDaExecucao } from "./execucao";
import type { TextosDoHistorico } from "./historico";

/*
 * Frases montadas a partir do dicionário, num módulo à parte dele: os
 * componentes cliente importam estas funções, e importar o arquivo do
 * dicionário poria as três línguas no JavaScript do aparelho — o texto do
 * idioma escolhido já chega pelo provedor.
 */

/**
 * O RIR em palavras, no idioma do app — a mesma regra de `rirEmPalavras`
 * (`lib/domain/prescricao.ts`), que o painel continua usando em português.
 * "RIR 0-2" é a língua de quem prescreve; quem lê está entre uma série e outra.
 */
export function rirNoIdioma(rir: string, t: TextosDaExecucao["rir"]): string {
  if (rir === "0") return t.falha;
  if (rir === "1") return t.um;
  if (rir.startsWith("0-")) return preencher(t.falhaOuAte, { n: rir.slice(2) });
  const [de, ate] = rir.split("-");
  return ate ? preencher(t.faixa, { de, ate }) : preencher(t.numero, { n: de });
}

/**
 * "60 kg × 10", ou "12 reps" no peso corporal — `textoDaUltimaVez`
 * (`lib/domain/recordes.ts`) com o número no formato do idioma do app. Nulo
 * quando não há nada honesto a dizer, e a tela não desenha a pílula.
 */
export function textoDaUltimaVezNoIdioma(ultima: UltimaVez, f: Formatos): string | null {
  if (ultima.carga === null) {
    return ultima.reps === null ? null : `${ultima.reps} reps`;
  }
  const carga = f.carga(ultima.carga);
  return ultima.reps === null ? carga : `${carga} × ${ultima.reps}`;
}

/**
 * A tendência do gráfico em palavras, para o `<title>` do SVG — a mesma conta
 * de `tendenciaEmPalavras` (`lib/domain/progresso.ts`), com a frase do idioma.
 * Um gráfico sem isto é um retângulo mudo para quem usa leitor de tela.
 */
export function tendenciaNoIdioma(
  nome: string,
  sessoes: SessaoDoExercicio[],
  t: TextosDoHistorico["progresso"],
  f: Formatos,
): string {
  const comCarga = sessoesComCarga(sessoes);
  if (comCarga.length === 0) return preencher(t.tendencia.semCarga, { nome });

  const primeiro = comCarga[0].cargaMaxima;
  const ultimo = comCarga[comCarga.length - 1].cargaMaxima;
  const quantos = comCarga.length;
  if (quantos === 1) return preencher(t.tendencia.um, { nome, carga: f.carga(ultimo) });

  const treinos = plural(quantos, t.treinos);
  const variacao = ultimo - primeiro;
  if (variacao === 0) {
    return preencher(t.tendencia.igual, { nome, carga: f.carga(ultimo), treinos });
  }
  return preencher(variacao > 0 ? t.tendencia.alta : t.tendencia.queda, {
    nome,
    de: f.carga(primeiro),
    ate: f.carga(ultimo),
    treinos,
    diferenca: f.carga(Math.abs(variacao)),
  });
}

/** O último registro do exercício, como a linha fechada do acordeão mostra. */
export function ultimoRegistroNoIdioma(exercicio: ExercicioDoProgresso, f: Formatos): string {
  const ultima = exercicio.sessoes[0];
  if (!ultima) return "—";
  if (ultima.cargaMaxima === null) {
    const reps = Math.max(...ultima.series.map((s) => s.reps ?? 0));
    return reps > 0 ? `${reps} reps` : "—";
  }
  return f.carga(ultima.cargaMaxima);
}

/** Uma série em texto: "60 kg × 10", ou "9 reps" no peso corporal. */
export function textoDaSerieNoIdioma(serie: SerieNaSessao, f: Formatos): string {
  if (serie.carga === null) return serie.reps === null ? "—" : `${serie.reps} reps`;
  const carga = f.carga(serie.carga);
  return serie.reps === null ? carga : `${carga} × ${serie.reps}`;
}
