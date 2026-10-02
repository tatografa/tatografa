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

/** O retorno de "Entrar na lista": só o e-mail, e a frase do erro quando há. */
export type EstadoDaLista = {
  /** O e-mail que entrou, para a confirmação dizer para onde vamos escrever. */
  email?: string;
  erro?: string;
  /** O que foi digitado, de volta ao campo depois de um erro. */
  digitado?: string;
};
