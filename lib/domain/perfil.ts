import { z } from "zod";

import type { Idioma } from "./idioma";
import { telefoneOpcional, telefoneOpcionalCom } from "./telefone";

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

/*
 * As mensagens dos cinco campos do onboarding, nos três idiomas: o convite é
 * traduzido (etapa 1, 05/10) e estes campos aparecem na etapa 2 dele. O perfil
 * do aluno (`/app/perfil`) usa as mesmas regras em português até a etapa 2 da
 * tradução — por isso as constantes abaixo continuam existindo.
 */
const MENSAGENS: Record<
  Idioma,
  {
    objetivo: string;
    nivel: string;
    nascimentoVazio: string;
    nascimentoInvalido: string;
    pesoVazio: string;
    pesoInvalido: string;
    alturaVazia: string;
    alturaInvalida: string;
  }
> = {
  pt: {
    objetivo: "Escolha um objetivo.",
    nivel: "Escolha seu nível.",
    nascimentoVazio: "Informe sua data de nascimento.",
    nascimentoInvalido: "Data de nascimento inválida.",
    pesoVazio: "Informe seu peso.",
    pesoInvalido: "Peso inválido.",
    alturaVazia: "Informe sua altura.",
    alturaInvalida: "Altura inválida.",
  },
  en: {
    objetivo: "Choose a goal.",
    nivel: "Choose your level.",
    nascimentoVazio: "Enter your date of birth.",
    nascimentoInvalido: "Invalid date of birth.",
    pesoVazio: "Enter your weight.",
    pesoInvalido: "Invalid weight.",
    alturaVazia: "Enter your height.",
    alturaInvalida: "Invalid height.",
  },
  es: {
    objetivo: "Elige un objetivo.",
    nivel: "Elige tu nivel.",
    nascimentoVazio: "Escribe tu fecha de nacimiento.",
    nascimentoInvalido: "Fecha de nacimiento no válida.",
    pesoVazio: "Escribe tu peso.",
    pesoInvalido: "Peso no válido.",
    alturaVazia: "Escribe tu altura.",
    alturaInvalida: "Altura no válida.",
  },
};

/** Os cinco campos obrigatórios do aluno, com as mensagens no idioma pedido. */
export function camposObrigatoriosDoAluno(idioma: Idioma = "pt") {
  const m = MENSAGENS[idioma];
  return {
    objetivo: z.enum(["massa", "gordura", "condicionamento", "saude"], {
      error: m.objetivo,
    }),
    nivel: z.enum(["iniciante", "intermediario", "avancado"], { error: m.nivel }),
    nascimento: z
      .string()
      .min(1, m.nascimentoVazio)
      .refine((valor) => {
        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return false;
        const anos = (Date.now() - data.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return anos >= IDADE_MINIMA && anos <= IDADE_MAXIMA;
      }, m.nascimentoInvalido),
    /*
     * Os limites de peso e altura são os mesmos das constraints de `students`
     * (migration 0006). O banco é quem decide; isto existe para a mensagem sair
     * na língua da tela e no campo certo, antes de a requisição partir.
     */
    peso: z.coerce
      .number({ error: m.pesoVazio })
      .gt(0, m.pesoVazio)
      .lt(500, m.pesoInvalido),
    altura: z.coerce
      .number({ error: m.alturaVazia })
      .gt(0, m.alturaVazia)
      .lt(300, m.alturaInvalida),
  };
}

const EM_PORTUGUES = camposObrigatoriosDoAluno("pt");
export const objetivoDoAluno = EM_PORTUGUES.objetivo;
export const nivelDoAluno = EM_PORTUGUES.nivel;
export const nascimentoDoAluno = EM_PORTUGUES.nascimento;
export const pesoDoAluno = EM_PORTUGUES.peso;
export const alturaDoAluno = EM_PORTUGUES.altura;

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

/** As mensagens do perfil que não estão em `camposObrigatoriosDoAluno`. */
export type MensagensDoPerfil = {
  nome: string;
  nomeLongo: string;
  cidadeLonga: string;
  uf: string;
  opcao: string;
  meta: string;
  telefone: string;
};

/**
 * O mesmo esquema de `esquemaDoPerfil`, com as mensagens no idioma do app
 * (etapa 2 da tradução). As regras são as mesmas — só o texto do erro muda —,
 * e é por isso que o esquema em português continua sendo este, montado igual.
 */
export function esquemaDoPerfilNoIdioma(idioma: Idioma, m: MensagensDoPerfil) {
  const vazio = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
  return z.object({
    nome: z.string().trim().min(2, m.nome).max(80, m.nomeLongo),
    ...camposObrigatoriosDoAluno(idioma),
    telefone: telefoneOpcionalCom(m.telefone),
    cidade: z
      .preprocess(vazio, z.string().trim().min(1).max(80, m.cidadeLonga).nullable())
      .default(null),
    uf: z.preprocess(vazio, z.enum(UFS, { error: m.uf }).nullable()).default(null),
    perfilBiologico: z
      .preprocess(
        vazio,
        z.enum(["natural", "reposicao", "hormonizado"], { error: m.opcao }).nullable(),
      )
      .default(null),
    metaDePeso: z
      .preprocess(vazio, z.coerce.number({ error: m.meta }).gt(0, m.meta).lt(500, m.meta).nullable())
      .default(null),
  });
}

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
