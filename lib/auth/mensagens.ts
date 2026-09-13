/**
 * O Supabase devolve erro em inglês. A interface é toda em português, então a
 * tradução acontece aqui, num lugar só.
 *
 * Cuidado deliberado no login: "e-mail não existe" e "senha errada" viram a
 * mesma frase. Distinguir os dois entrega ao atacante quais e-mails têm conta.
 */

/**
 * Falha de **envio**, que é nossa — não resposta sobre quem tem conta.
 *
 * A distinção importa porque `/recuperar` e `/acesso` calam quase todo erro de
 * propósito: responder diferente para e-mail com e sem conta entregaria ao
 * atacante quais endereços existem. Só que isso vinha calando também o que não
 * tem nada a ver com o usuário.
 *
 * O caso concreto: sem SMTP próprio, o Supabase **só entrega para endereços da
 * equipe do projeto** e recusa todo o resto com `Email address not authorized`.
 * A tela dizia "link enviado" e nada chegava — para todo aluno de verdade.
 *
 * Mostrar isto não vaza nada: a recusa acontece para qualquer endereço fora da
 * equipe, tenha ele conta ou não.
 */
export const FALHA_DE_ENVIO_DE_EMAIL =
  /not authorized|error sending|failed to send|smtp|email provider|unexpected failure/i;

const TRADUCOES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail antes de entrar. Veja a caixa de entrada."],
  [/user already registered|already been registered/i, "Já existe uma conta com esse e-mail."],
  [/password should be at least/i, "A senha precisa de pelo menos 8 caracteres."],
  [/for security purposes|only request this after|rate limit/i, "Muitas tentativas seguidas. Espere um minuto e tente de novo."],
  [/new password should be different/i, "A nova senha precisa ser diferente da anterior."],
  [/(token|link).*(expired|invalid)|invalid.*(token|link)/i, "Esse link expirou ou já foi usado. Peça outro."],
  [/unable to validate email|invalid email/i, "E-mail inválido."],
  [/signups? not allowed|disabled/i, "O cadastro está desativado no momento."],
  /*
    Padrão estreito de propósito, mais estreito que `FALHA_DE_ENVIO_DE_EMAIL`:
    esta lista traduz erro de **toda** a autenticação, e um 500 genérico no
    login não pode virar "não conseguimos enviar o e-mail".
  */
  [
    /not authorized|error sending|failed to send|smtp|email provider/i,
    "Não conseguimos enviar o e-mail agora. O problema é nosso, não seu — tente de novo em alguns minutos ou peça ajuda ao seu personal.",
  ],
];

export function traduzErro(mensagem: string | undefined | null): string {
  if (!mensagem) return "Não foi possível concluir. Tente de novo.";
  for (const [padrao, traducao] of TRADUCOES) {
    if (padrao.test(mensagem)) return traducao;
  }
  return "Não foi possível concluir. Tente de novo.";
}
