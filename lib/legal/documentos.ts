/**
 * Termos de uso e política de privacidade, como dado.
 *
 * Ficam num módulo neutro — sem `"use client"` e sem `server-only` — porque
 * três lugares precisam deles: as páginas públicas (servidor), o rodapé
 * (servidor) e o formulário de onboarding (cliente, que precisa da **versão**
 * para mandar junto com o aceite). Texto aprovado em duas cópias sai de
 * sincronia na primeira revisão.
 *
 * ---
 *
 * **A versão é a data da última revisão do texto, e é ela que fica gravada no
 * aceite** (`term_acceptances.versao`). Mudou o texto de forma relevante,
 * muda a data — e os aceites antigos passam a valer para uma versão que não é
 * mais a vigente, que é exatamente o que se quer saber depois.
 *
 * Corrigir uma vírgula não é mudar a versão. Mudar o que se coleta, com quem
 * se compartilha ou por quanto tempo se guarda, é.
 */
export const VERSAO_DOS_DOCUMENTOS = "2026-09-14";

/**
 * O que mudou nesta versão, em uma frase, para o portão de re-aceite.
 *
 * Fica junto da versão porque é a mesma decisão: quem sobe a data escreve a
 * frase. Portão que diz "atualizamos os documentos" e mais nada faz o usuário
 * clicar sem ler, o que é o contrário de consentimento.
 */
export const O_QUE_MUDOU =
  "Agora o app tem um feed: dá para publicar foto e legenda do treino, escolhendo a cada post se aquilo fica só com o seu personal ou também com os outros alunos dele. Antes, nada seu era visível para outro aluno.";

/**
 * Quem responde pelo dado.
 *
 * **Isto é rascunho e precisa da confirmação do Otávio.** Na LGPD, controlador
 * é quem decide o que se faz com o dado. Aqui há dois, e a política diz isso:
 * quem opera o Reps Club decide sobre a plataforma; o personal decide sobre o
 * treino que prescreve e o histórico que lê do próprio aluno.
 *
 * Se o Reps Club virar empresa, trocar por razão social e CNPJ.
 */
export const OPERADOR = {
  nome: "Reps Club",
  /*
   * Endereço do produto, no domínio próprio (`repsclub.com.br`, na Hostinger).
   * Não é o e-mail pessoal do Otávio de propósito: página aberta com endereço
   * pessoal convida spam, e a política precisa de um canal que sobreviva a
   * quem opera o serviço mudar.
   *
   * **A caixa precisa existir de verdade antes do piloto** — é para cá que vêm
   * pedido de exclusão e de cópia de dados, com prazo de resposta escrito na
   * própria política.
   */
  contato: "contato@repsclub.com.br",
} as const;

export type Documento = {
  slug: "termos" | "privacidade";
  titulo: string;
  resumo: string;
  secoes: { titulo: string; paragrafos: string[] }[];
};
