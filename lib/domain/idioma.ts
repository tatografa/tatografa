/**
 * Os idiomas da landing (pedido do Otávio, 05/10): português, inglês e espanhol.
 *
 * Só a landing é traduzida. O produto — painel, app, login, termos e política —
 * continua em português, e é por isso que o idioma vai na URL (`?lang=en`) e
 * não num cookie: ele vale para a página que o link abre, e um link em inglês
 * colado numa conversa abre em inglês. O padrão é português, sem parâmetro.
 */

export type Idioma = "pt" | "en" | "es";

export const IDIOMAS: { valor: Idioma; sigla: string; nome: string; lang: string }[] = [
  { valor: "pt", sigla: "PT", nome: "Português", lang: "pt-BR" },
  { valor: "en", sigla: "EN", nome: "English", lang: "en" },
  { valor: "es", sigla: "ES", nome: "Español", lang: "es" },
];

/** O idioma pedido na URL; qualquer outra coisa cai no português. */
export function idiomaDe(valor: string | undefined): Idioma {
  return valor === "en" || valor === "es" ? valor : "pt";
}

export type PerfilDaLanding = "personal" | "aluno";

/**
 * O endereço da landing com perfil e idioma. Um lugar só para montar os dois
 * parâmetros: o seletor de perfil não pode perder o idioma, nem o de idioma o
 * perfil.
 */
export function enderecoDaLanding(perfil: PerfilDaLanding, idioma: Idioma): string {
  const busca = new URLSearchParams();
  if (perfil === "aluno") busca.set("para", "alunos");
  if (idioma !== "pt") busca.set("lang", idioma);
  const texto = busca.toString();
  return texto ? `/?${texto}` : "/";
}
