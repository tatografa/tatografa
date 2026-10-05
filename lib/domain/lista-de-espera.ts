/**
 * A lista de espera da landing: a forma do envio e do retorno.
 *
 * Módulo neutro porque dois lados leem os mesmos tipos — o campo de "Entrar
 * na lista" (cliente) e a Server Action que grava.
 */

/**
 * De qual versão da landing o e-mail veio — o `check` de `lista_de_espera.perfil`
 * (migration 0043) tem os mesmos dois valores.
 */
export type PerfilDaLista = "personal" | "aluno";

/**
 * Por que o e-mail não entrou. **Código, não frase**: a landing fala três
 * idiomas (05/10), e a frase sai do texto do idioma da página
 * (`lib/landing/textos.ts`). A ação no servidor não sabe em que língua a pessoa
 * está lendo, e não precisa saber.
 */
export type ErroDaLista = "vazio" | "longo" | "invalido" | "falha";

/** O retorno de "Entrar na lista": só o e-mail, e o motivo do erro quando há. */
export type EstadoDaLista = {
  /** O e-mail que entrou, para a confirmação dizer para onde vamos escrever. */
  email?: string;
  erro?: ErroDaLista;
  /** O que foi digitado, de volta ao campo depois de um erro. */
  digitado?: string;
};
