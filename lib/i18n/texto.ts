/**
 * As duas ferramentas que os dicionários usam, num módulo neutro.
 *
 * Dicionário é **dado**, não função: ele atravessa do servidor para o
 * componente cliente, e função não atravessa essa fronteira. Por isso a frase
 * com nome ou número guarda `{chave}` e a tela troca na hora de desenhar.
 */

/** Troca `{chave}` pelo valor. */
export function preencher(frase: string, valores: Record<string, string | number>): string {
  return frase.replace(/\{(\w+)\}/g, (_, chave: string) => String(valores[chave] ?? ""));
}

/** "Antes {personal} depois" → ["Antes ", "depois"], para pôr o nome em `<strong>`. */
export function partesEmVolta(frase: string, marcador: string): [string, string] {
  const [antes, depois = ""] = frase.split(`{${marcador}}`);
  return [antes, depois];
}

/**
 * As duas formas de uma frase com contagem: "1 série" e "{n} séries".
 *
 * Duas formas bastam para os três idiomas do produto — português, inglês e
 * espanhol só separam o um do resto. Um idioma com três formas (russo,
 * polonês) pediria outra coisa, e esse dia ainda não chegou.
 */
export type Plural = { um: string; outros: string };

/** A frase certa para `n`, com `{n}` já trocado (pelo número formatado, se vier). */
export function plural(n: number, formas: Plural, nFormatado?: string): string {
  return preencher(n === 1 ? formas.um : formas.outros, { n: nFormatado ?? n });
}
