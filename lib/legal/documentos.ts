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
export const VERSAO_DOS_DOCUMENTOS = "2026-09-13";

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
   * **Marcador de propósito, e visível na página.** A política precisa de um
   * canal de contato, mas publicar o e-mail pessoal do Otávio numa página
   * aberta convida spam e é decisão dele, não do dev. O endereço do produto
   * sai junto com o domínio próprio, que é o M4-02.
   *
   * Aparece assim na tela para que a pendência não passe despercebida: é mais
   * fácil esquecer de trocar um endereço plausível do que um `[DEFINIR]`.
   */
  contato: "[DEFINIR: e-mail de contato do Reps Club]",
} as const;

export type Documento = {
  slug: "termos" | "privacidade";
  titulo: string;
  resumo: string;
  secoes: { titulo: string; paragrafos: string[] }[];
};
