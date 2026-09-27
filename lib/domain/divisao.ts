/**
 * Contas da tela "Divisão de treino". Funções puras, sem banco e sem React.
 *
 * Tudo aqui é leitura do que está na tela, não do banco: os totais mudam a
 * cada exercício que o personal acrescenta, antes de salvar.
 */

import { repeticoesDaSoma } from "./prescricao";

/**
 * Teto de treinos na divisão, como no protótipo ("1x" a "7x"). Não é regra do
 * banco — um programa antigo pode ter mais letras, e continua abrindo —, é o
 * limite do que a tela oferece criar: sete é um treino por dia da semana.
 */
export const MAXIMO_DE_DIAS = 7;

export type ItemDaSoma = {
  sets: number;
  reps: string;
  grupo: string;
};

export type ResumoDoDia = {
  exercicios: number;
  series: number;
  /** Faixa conta pelo meio ("8-12" vale 10); ver `repeticoesDaSoma`. */
  reps: number;
  /** Séries por grupo muscular, do maior para o menor. */
  porGrupo: { grupo: string; series: number }[];
};

export function resumoDoDia(itens: ItemDaSoma[]): ResumoDoDia {
  let series = 0;
  let reps = 0;
  const grupos = new Map<string, number>();

  for (const item of itens) {
    // Campo vazio ou pela metade enquanto o personal digita vale zero, não NaN.
    const sets = Number.isFinite(item.sets) && item.sets > 0 ? item.sets : 0;
    series += sets;
    reps += sets * repeticoesDaSoma(item.reps);
    grupos.set(item.grupo, (grupos.get(item.grupo) ?? 0) + sets);
  }

  return {
    exercicios: itens.length,
    series,
    reps: Math.round(reps),
    porGrupo: [...grupos.entries()]
      .map(([grupo, total]) => ({ grupo, series: total }))
      .filter((g) => g.series > 0)
      .sort((a, b) => b.series - a.series),
  };
}

/**
 * O volume da semana inteira: a soma dos dias.
 *
 * Vale como "semanal" porque a frequência da tela **é** o número de treinos
 * da divisão — com a rotação (decisão de 27/09), quem treina 4x por semana
 * passa pelos 4 treinos numa semana.
 */
export function volumeDaSemana(dias: ItemDaSoma[][]): { series: number; reps: number } {
  return dias.reduce(
    (total, itens) => {
      const dia = resumoDoDia(itens);
      return { series: total.series + dia.series, reps: total.reps + dia.reps };
    },
    { series: 0, reps: 0 },
  );
}

/** "Treino A · 3 exercícios" — o subtítulo do cartão, no lugar do dia fixo. */
export function subtituloDoDia(label: string, exercicios: number): string {
  const quantos =
    exercicios === 0
      ? "sem exercícios"
      : `${exercicios} ${exercicios === 1 ? "exercício" : "exercícios"}`;
  return `Treino ${label} · ${quantos}`;
}
