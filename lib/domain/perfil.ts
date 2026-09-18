import { z } from "zod";

import { telefoneOpcional } from "./telefone";

/**
 * As regras dos campos do perfil do aluno, num lugar só.
 *
 * Os mesmos cinco campos são preenchidos no onboarding (`/convite/[token]`) e
 * editados depois em `/app/perfil`. Duas cópias do mesmo `z.object` divergem na
 * primeira vez que uma mudar — e a que ficaria para trás é justamente a da
 * edição, que é usada menos vezes.
 *
 * Módulo neutro de propósito: zod puro, sem banco e sem React, então tanto a
 * Server Action do onboarding quanto a do perfil importam daqui.
 */

/** Idade aceita. Menor de 12 é erro de digitação; acima de 100 também. */
const IDADE_MINIMA = 12;
const IDADE_MAXIMA = 100;

export const nomeDoAluno = z
  .string()
  .trim()
  .min(2, "Informe seu nome.")
  .max(80, "O nome pode ter até 80 caracteres.");

export const objetivoDoAluno = z.enum(
  ["massa", "gordura", "condicionamento", "saude"],
  { error: "Escolha um objetivo." },
);

export const nivelDoAluno = z.enum(
  ["iniciante", "intermediario", "avancado"],
  { error: "Escolha seu nível." },
);

export const nascimentoDoAluno = z
  .string()
  .min(1, "Informe sua data de nascimento.")
  .refine((valor) => {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return false;
    const anos = (Date.now() - data.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return anos >= IDADE_MINIMA && anos <= IDADE_MAXIMA;
  }, "Data de nascimento inválida.");

/*
 * Os limites de peso e altura são os mesmos das constraints de `students`
 * (migration 0006). O banco é quem decide; isto existe para a mensagem sair em
 * português e no campo certo, antes de a requisição partir.
 */
export const pesoDoAluno = z.coerce
  .number({ error: "Informe seu peso." })
  .gt(0, "Informe seu peso.")
  .lt(500, "Peso inválido.");

export const alturaDoAluno = z.coerce
  .number({ error: "Informe sua altura." })
  .gt(0, "Informe sua altura.")
  .lt(300, "Altura inválida.");

/**
 * As 27 unidades da federação, que são também o `check` da coluna.
 *
 * Lista e não texto livre porque "SP", "sp" e "São Paulo" viram três valores
 * para o mesmo estado, e quem for agrupar por UF um dia vai achar que tem três.
 */
export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

/*
 * Os quatro campos opcionais (decisão do Otávio, 18/09).
 *
 * Todos aceitam vazio e **viram `null`**, não string vazia: "não informado" é a
 * ausência do dado, e uma coluna com `''` faria a tela precisar testar as duas
 * coisas para dizer a mesma frase. É a mesma razão de o enum
 * `biological_profile` não ter um valor `nao_informado`.
 */

const vazioVirouNulo = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const cidadeDoAluno = z
  .preprocess(vazioVirouNulo, z.string().trim().min(1).max(80, "A cidade pode ter até 80 caracteres.").nullable())
  .default(null);

export const ufDoAluno = z
  .preprocess(vazioVirouNulo, z.enum(UFS, { error: "Escolha um estado da lista." }).nullable())
  .default(null);

/**
 * Terapia hormonal. **Dado de saúde sensível pela LGPD** — a política de
 * privacidade declara, e por isso é opcional de verdade: em branco é um
 * estado válido e permanente, não um campo pela metade.
 */
export const perfilBiologicoDoAluno = z
  .preprocess(vazioVirouNulo, z.enum(["natural", "reposicao", "hormonizado"], {
    error: "Escolha uma das opções.",
  }).nullable())
  .default(null);

/** Os mesmos limites do peso atual: é a mesma grandeza. */
export const metaDePesoDoAluno = z
  .preprocess(
    vazioVirouNulo,
    z.coerce.number({ error: "Meta inválida." }).gt(0, "Meta inválida.").lt(500, "Meta inválida.").nullable(),
  )
  .default(null);

/** Os campos que o aluno edita depois — sem senha, sem termos, sem e-mail. */
export const esquemaDoPerfil = z.object({
  nome: nomeDoAluno,
  objetivo: objetivoDoAluno,
  nivel: nivelDoAluno,
  nascimento: nascimentoDoAluno,
  peso: pesoDoAluno,
  altura: alturaDoAluno,
  telefone: telefoneOpcional,
  cidade: cidadeDoAluno,
  uf: ufDoAluno,
  perfilBiologico: perfilBiologicoDoAluno,
  metaDePeso: metaDePesoDoAluno,
});

export type CampoDoPerfil = keyof z.infer<typeof esquemaDoPerfil>;

/**
 * A idade em anos completos, a partir da data de nascimento.
 *
 * `birth_date` é coluna `date` — dia de calendário, sem hora —, então as duas
 * pontas são comparadas como dia, nunca como instante: `new Date("1990-03-12")`
 * é meia-noite UTC, e a diferença em milissegundos dividida por 365,25 erra por
 * um ano no dia do aniversário de quem nasceu em dezembro.
 */
export function idadeEmAnos(nascimento: string | null, hoje: string): number | null {
  if (!nascimento) return null;

  const [anoN, mesN, diaN] = nascimento.slice(0, 10).split("-").map(Number);
  const [anoH, mesH, diaH] = hoje.slice(0, 10).split("-").map(Number);
  if (!anoN || !anoH) return null;

  let idade = anoH - anoN;
  // Ainda não fez aniversário este ano.
  if (mesH < mesN || (mesH === mesN && diaH < diaN)) idade -= 1;
  return idade >= 0 && idade < 150 ? idade : null;
}

/** O que a barra da meta de peso desenha. */
export type MetaDePeso = {
  inicial: number;
  atual: number;
  meta: number;
  /** 0 a 1. Quanto do caminho entre o inicial e a meta já foi andado. */
  progresso: number;
  /** Quantos quilos faltam, em módulo. Zero quando chegou ou passou. */
  faltam: number;
  /** Ganhar ou perder — a barra não muda, a frase muda. */
  direcao: "ganhar" | "perder";
};

/**
 * A meta de peso como a ficha mostra.
 *
 * **O progresso é medido do peso inicial até a meta, e não do zero.** "75 de
 * 70 kg" não é 107% de nada: o que importa é quanto do caminho combinado já
 * foi andado, e o caminho começa onde a pessoa estava.
 *
 * Quem anda para o lado errado fica em 0, não em negativo — a barra vazia já
 * diz isso, e uma barra negativa não existe. Quem passou da meta fica em 1: a
 * barra cheia é a resposta certa para "chegou".
 *
 * **Não pinta de verde nem de vermelho**, pela mesma razão da variação da
 * medida na reavaliação (15/09): perder dois quilos é vitória para um objetivo
 * e prejuízo para outro, e só o personal sabe qual foi o combinado.
 */
export function metaDePeso(
  inicial: number | null,
  atual: number | null,
  meta: number | null,
): MetaDePeso | null {
  if (inicial === null || atual === null || meta === null) return null;

  const total = meta - inicial;
  const andado = atual - inicial;
  // Peso inicial igual à meta: não há caminho, e quem já está lá está em 100%.
  const progresso =
    total === 0 ? 1 : Math.min(1, Math.max(0, andado / total));

  return {
    inicial,
    atual,
    meta,
    progresso,
    faltam: Math.abs(meta - atual),
    direcao: total >= 0 ? "ganhar" : "perder",
  };
}
