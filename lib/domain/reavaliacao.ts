import { z } from "zod";

import { Constants, type Enums } from "@/types/database";

/**
 * A reavaliação física, na parte que não depende de banco nem de React.
 *
 * Módulo neutro de propósito: a página do aluno (servidor), o formulário
 * (cliente), a Server Action e a tela do personal leem daqui. Rótulo de região
 * duplicado entre cliente e servidor é como "Braço" vira "Braços" num lugar só.
 */

export type Regiao = Enums<"body_region">;

/**
 * As regiões, na ordem em que a tela pede — que é a ordem do enum no banco.
 *
 * Sai de `Constants`, gerado por `supabase gen types`, e não de uma lista
 * escrita à mão: acrescentar uma região é mexer no enum, e a tela acompanha
 * sozinha em vez de ficar uma região atrás.
 */
export const REGIOES = Constants.public.Enums.body_region;

export const ROTULO_DA_REGIAO: Record<Regiao, string> = {
  braco: "Braço",
  peito: "Peito",
  cintura: "Cintura",
  quadril: "Quadril",
  coxa: "Coxa",
};

/** Onde a fita passa. O aluno mede sozinho; sem isto, mede cada vez num lugar. */
export const ONDE_MEDIR: Record<Regiao, string> = {
  braco: "No meio do braço, contraído",
  peito: "Na linha dos mamilos, sem encher o peito",
  cintura: "Na altura do umbigo, sem prender a barriga",
  quadril: "Na parte mais larga do quadril",
  coxa: "No meio da coxa, em pé",
};

/** As três fotos do doc 05 §12, na ordem em que são tiradas. */
export const SLOTS = ["frente", "lado", "costas"] as const;
export type Slot = (typeof SLOTS)[number];

export const ROTULO_DO_SLOT: Record<Slot, string> = {
  frente: "De frente",
  lado: "De lado",
  costas: "De costas",
};

/** A coluna de `assessments` que guarda cada foto. */
export const COLUNA_DA_FOTO = {
  frente: "photo_front_path",
  lado: "photo_side_path",
  costas: "photo_back_path",
} as const satisfies Record<Slot, string>;

/* -------------------------------------------------------- comparação ----- */

export type Comparacao = {
  rotulo: string;
  unidade: string;
  anterior: number | null;
  atual: number | null;
  /** `atual - anterior`, ou nulo quando falta um dos dois. */
  variacao: number | null;
};

/**
 * Monta a linha "anterior → atual, com variação" de uma medida.
 *
 * **Não diz se a variação é boa.** Dois centímetros a menos na cintura é vitória
 * para quem quer perder gordura e prejuízo para quem quer ganhar massa; dois a
 * mais no braço, o contrário. Só o personal sabe o que foi combinado, e pintar o
 * número de verde ou vermelho seria o app dando um parecer que não é dele. A
 * tela mostra a seta e o número; o julgamento vai no comentário do personal.
 */
export function compara(
  rotulo: string,
  unidade: string,
  anterior: number | null | undefined,
  atual: number | null | undefined,
): Comparacao {
  const a = anterior ?? null;
  const b = atual ?? null;
  return {
    rotulo,
    unidade,
    anterior: a,
    atual: b,
    variacao: a !== null && b !== null ? arredonda(b - a) : null,
  };
}

/** Uma casa decimal. Sem isto, `84.5 - 84.4` vira `0.09999999999999432`. */
function arredonda(n: number): number {
  return Math.round(n * 10) / 10;
}

/** "+1,5" / "−0,8" / "0". O sinal é o menos tipográfico, que alinha com o mais. */
export function formatarVariacao(n: number): string {
  if (n === 0) return "0";
  const valor = formatarMedida(Math.abs(n));
  return `${n > 0 ? "+" : "−"}${valor}`;
}

/** Número com vírgula e sem casa decimal à toa: `84`, `84,5`. */
export function formatarMedida(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
}

/* --------------------------------------------------------- validação ----- */

/*
 * Os limites são os mesmos das constraints das tabelas (migration 0023). O banco
 * é quem decide; isto existe para a mensagem sair em português, no campo certo,
 * antes de a requisição partir.
 */

/** Campo numérico opcional: vazio vira nulo, texto vira erro. */
function opcional(minimo: number, maximo: number, invalido: string) {
  return z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || !Number.isNaN(Number(v.replace(",", "."))), invalido)
    .transform((v) => (v === null ? null : Number(v.replace(",", "."))))
    .refine((n) => n === null || (n > minimo && n < maximo), invalido);
}

export const esquemaDaReavaliacao = z.object({
  peso: opcional(0, 500, "Peso inválido."),
  gordura: opcional(0, 70, "Percentual de gordura inválido."),
  observacao: z
    .string()
    .trim()
    .max(1000, "A observação pode ter até 1000 caracteres."),
});

export const LIMITE_DA_OBSERVACAO = 1000;

/** Uma medida de região, com o mesmo tratamento de vírgula e vazio. */
export const medidaDaRegiao = opcional(0, 300, "Medida inválida.");
