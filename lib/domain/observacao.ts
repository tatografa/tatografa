/**
 * A regra da anotação do personal, compartilhada entre a Server Action e o
 * formulário.
 *
 * Módulo neutro porque o limite aparece nos dois lados: o `maxLength` do campo
 * e o contador que a tela mostra vivem no componente cliente, e a validação que
 * decide se grava vive no `"use server"`. Duas cópias de "2000" divergem na
 * primeira vez que alguém mexe num dos lados — e o sintoma seria um texto que
 * o campo aceita digitar e o servidor recusa salvar, sem o personal entender.
 *
 * O número é o mesmo do `check` da migration 0028. São três lugares, e este é
 * o único que os outros dois do TypeScript leem.
 */
export const LIMITE_DA_OBSERVACAO = 2000;

/** Quando o contador de caracteres aparece: só perto do teto, não o tempo todo. */
export const AVISO_DA_OBSERVACAO = LIMITE_DA_OBSERVACAO - 200;

/**
 * Quantas anotações a ficha carrega.
 *
 * Teto e não paginação: a ficha é uma tela de leitura corrida, e o personal que
 * anota toda semana leva um ano para chegar aqui. Quando o teto é atingido a
 * tela avisa — corte silencioso faria ele achar que perdeu anotação, que é o
 * mesmo defeito que `LIMITE_DO_HISTORICO` evita.
 *
 * **Mora aqui e não em `lib/queries/observacoes.ts`, embora seja o `limit()`
 * daquela consulta.** A tela que avisa "mostrando as 50 mais recentes" é
 * componente cliente, e importar valor de módulo `server-only` derruba o build
 * com `'server-only' cannot be imported from a Client Component`. É o mesmo
 * erro que `PERIODOS` cometeu em `lib/queries/social.ts` — e nem o typecheck
 * nem o lint o pegam: só o build.
 */
export const LIMITE_DAS_OBSERVACOES = 50;
