/**
 * Os idiomas da landing (pedido do Otávio, 05/10): português, inglês e espanhol.
 *
 * **Duas fontes, nesta ordem** (etapa 1 da tradução, 05/10): o `?lang=` da URL,
 * que é o que torna um link em inglês colado numa conversa um link em inglês, e
 * o cookie `reps_idioma`, que o `proxy.ts` grava sempre que a URL traz um
 * idioma. O cookie é o que leva a escolha por onde a URL não vai: do login ao
 * cadastro, ao link de recuperação que chega por e-mail, e à Server Action, que
 * não recebe a URL da página. Sem nenhum dos dois, português.
 *
 * Traduzido em três etapas, todas em 05/10: landing, telas de entrada, convite
 * do aluno, termos e política (etapa 1); o app do aluno, com a escolha no
 * Perfil (etapa 2); e o painel do personal, com a escolha em Configurações
 * (etapa 3). O que não se traduz é o que alguém escreveu — nome de treino,
 * observação, nome de exercício — e os e-mails do Supabase.
 */

export type Idioma = "pt" | "en" | "es";

export const IDIOMAS: { valor: Idioma; sigla: string; nome: string; lang: string }[] = [
  { valor: "pt", sigla: "PT", nome: "Português", lang: "pt-BR" },
  { valor: "en", sigla: "EN", nome: "English", lang: "en" },
  { valor: "es", sigla: "ES", nome: "Español", lang: "es" },
];

export const COOKIE_DO_IDIOMA = "reps_idioma";

/** Um ano, como o consentimento de cookies: é preferência, não sessão. */
export const VALIDADE_DO_IDIOMA = 60 * 60 * 24 * 365;

export function ehIdioma(valor: string | undefined | null): valor is Idioma {
  return valor === "pt" || valor === "en" || valor === "es";
}

/** O idioma pedido; qualquer outra coisa cai no português. */
export function idiomaDe(valor: string | undefined | null): Idioma {
  return ehIdioma(valor) ? valor : "pt";
}

/** O `lang` do HTML para o idioma: é o que o leitor de tela usa para pronunciar. */
export function langDe(idioma: Idioma): string {
  return IDIOMAS.find((i) => i.valor === idioma)?.lang ?? "pt-BR";
}

export type PerfilDaLanding = "personal" | "aluno";

/**
 * O endereço da landing com o perfil. O idioma não vai junto: ele já está no
 * cookie, e um `?lang=` em todo link só serviria para a URL mentir quando a
 * pessoa trocasse de idioma numa outra aba.
 */
export function enderecoDaLanding(perfil: PerfilDaLanding): string {
  return perfil === "aluno" ? "/?para=alunos" : "/";
}

/**
 * O endereço atual com outro idioma: é o que o seletor PT · EN · ES monta. O
 * `lang` vai explícito, inclusive o `pt` — é ele que sobrescreve o cookie.
 */
export function comIdioma(caminho: string, busca: string, idioma: Idioma): string {
  const parametros = new URLSearchParams(busca);
  parametros.set("lang", idioma);
  return `${caminho}?${parametros.toString()}`;
}
