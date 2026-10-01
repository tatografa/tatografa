/**
 * O formulário de contato da landing: as opções e a forma do envio.
 *
 * Módulo neutro porque dois lados leem as mesmas listas — o formulário
 * (cliente) desenha as opções, e a Server Action as valida. Uma lista em cada
 * lado é como o formulário passa a oferecer uma opção que o banco recusa (o
 * `check` de `contatos_do_site`, migration 0040, tem os mesmos valores).
 */

export type PerfilDoContato = "personal" | "aluno";

export const QUANTOS_ALUNOS = [
  { valor: "1-15", rotulo: "1 a 15 alunos" },
  { valor: "16-30", rotulo: "16 a 30 alunos" },
  { valor: "31-49", rotulo: "31 a 49 alunos" },
  { valor: "50+", rotulo: "50 alunos ou mais" },
] as const;

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
  | "quantosAlunos"
  | "plataformaAtual"
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
    quantosAlunos: string;
    plataformaAtual: string;
    temPersonal: string;
    objetivos: string[];
  };
};
