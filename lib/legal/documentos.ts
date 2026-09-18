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
export const VERSAO_DOS_DOCUMENTOS = "2026-09-18";

/**
 * O que mudou nesta versão, em uma frase, para o portão de re-aceite.
 *
 * Fica junto da versão porque é a mesma decisão: quem sobe a data escreve a
 * frase. Portão que diz "atualizamos os documentos" e mais nada faz o usuário
 * clicar sem ler, o que é o contrário de consentimento.
 */
export const O_QUE_MUDOU = {
  aluno:
    "Seu perfil ganhou quatro campos opcionais: telefone, cidade, uma meta de peso e se você usa alguma terapia hormonal. Os quatro começam em branco e continuam em branco se você não quiser preencher — nada no app deixa de funcionar. A informação sobre terapia hormonal é dado de saúde: ela é só sua e do seu personal, quem escreve é você, e dá para voltar para “não informado” quando quiser. A política de privacidade explica cada um.",
  /*
   * A mesma mudança, lida do outro lado. Para o aluno é "guardam algo sobre
   * mim"; para o personal é "o que eu escrevo fica registrado, e ele pode
   * pedir". Descrever a dele com a frase do aluno faria o texto falar do
   * personal na terceira pessoa para o próprio personal.
   */
  personal:
    "A ficha do aluno passa a mostrar telefone, cidade, meta de peso e perfil biológico (natural, reposição ou hormonizado), quando ele preencher. Quem preenche é o aluno, não você: o banco recusa a sua escrita nos dois últimos, de propósito: perfil biológico é dado de saúde, e registrar sozinho uma suposição sobre o corpo de alguém é o tipo de coisa que não se desfaz. O aluno foi avisado no app de que você vê esses campos.",
} as const;

/**
 * O que **não** muda, por papel — a frase que o portão de re-aceite mostra
 * abaixo de `O_QUE_MUDOU`.
 *
 * São duas porque o medo é outro de cada lado: o aluno pensa no histórico que
 * levou meses para construir, o personal nos treinos que montou e na carteira.
 * Uma frase só falaria com um e soaria estranha para o outro — e uma frase que
 * soa estranha é uma frase que faz clicar sem ler.
 */
export const O_QUE_NAO_MUDA = {
  aluno:
    "Seu treino, seu histórico e seus recordes continuam exatamente como estavam. Para seguir usando o app, confirme que você leu o texto novo.",
  personal:
    "Seus alunos, seus treinos e tudo o que você montou continuam exatamente como estavam. Para seguir usando o painel, confirme que você leu o texto novo.",
} as const;

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
