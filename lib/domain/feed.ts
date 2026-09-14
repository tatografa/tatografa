/**
 * Regras do feed que a tela e o servidor dividem. Sem banco e sem React.
 *
 * `LIMITE_DA_LEGENDA` mora aqui, e não no arquivo de Server Actions, por uma
 * razão do Next e uma do projeto. A do Next: módulo `"use server"` só pode
 * exportar função assíncrona, e uma constante no meio **zera as exportações do
 * arquivo inteiro** — o erro não aponta para a constante, aponta para as ações
 * que sumiram. A do projeto: é a mesma regra dos dois lados (o `maxLength` do
 * campo e o `max` do zod), e duas cópias divergem na primeira vez que uma
 * mudar.
 *
 * O número é o mesmo da constraint de `posts.caption` e `post_comments.body`
 * (migration 0018). O banco é quem decide de verdade; isto existe para a
 * mensagem sair em português antes de a requisição partir.
 */
export const LIMITE_DA_LEGENDA = 500;

/**
 * Os recortes de período da tela Social do personal (doc 06).
 *
 * Mora aqui, e não em `lib/queries/social.ts`, porque o rótulo é **texto de
 * tela**: a lista de links do cabeçalho o renderiza, e um componente cliente
 * que importe do módulo de consulta arrasta o `server-only` junto — o build
 * quebra com "'server-only' cannot be imported from a Client Component".
 * Mesma regra do `LIMITE_DA_LEGENDA` acima.
 */
export type PeriodoDoSocial = "7" | "30" | "tudo";

export const PERIODOS: { valor: PeriodoDoSocial; rotulo: string }[] = [
  { valor: "7", rotulo: "7 dias" },
  { valor: "30", rotulo: "30 dias" },
  { valor: "tudo", rotulo: "Tudo" },
];
