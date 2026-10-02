/**
 * O formulário de contato da landing (versão para alunos): as opções e a
 * forma do envio.
 *
 * Módulo neutro porque dois lados leem as mesmas listas — o formulário
 * (cliente) desenha as opções, e a Server Action as valida. Uma lista em cada
 * lado é como o formulário passa a oferecer uma opção que o banco recusa (o
 * `check` de `contatos_do_site`, migration 0040, tem os mesmos valores).
 */

export const OBJETIVOS_DO_CONTATO = [
  { valor: "perder_peso", rotulo: "Perder peso" },
  { valor: "ganhar_massa", rotulo: "Ganhar massa muscular" },
  { valor: "voltar_a_treinar", rotulo: "Voltar a treinar" },
  { valor: "personal_decide", rotulo: "Quero que o personal decida" },
] as const;

export type CampoDoContato =
  | "nome"
  | "email"
  | "telefone"
  | "temPersonal"
  | "objetivos";

export type EstadoDoContato = {
  enviado?: boolean;
  erro?: string;
  errosPorCampo?: Partial<Record<CampoDoContato, string>>;
  /**
   * O que foi digitado, de volta para o formulário. O React limpa o formulário
   * depois de cada envio, e sem isto um erro no telefone apagaria o nome e o
   * e-mail que estavam certos.
   */
  campos?: {
    nome: string;
    email: string;
    telefone: string;
    temPersonal: string;
    objetivos: string[];
  };
};

/** O retorno de "Entrar na lista": só o e-mail, e a frase do erro quando há. */
export type EstadoDaLista = {
  /** O e-mail que entrou, para a confirmação dizer para onde vamos escrever. */
  email?: string;
  erro?: string;
  /** O que foi digitado, de volta ao campo depois de um erro. */
  digitado?: string;
};
