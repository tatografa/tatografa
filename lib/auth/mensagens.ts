/**
 * O Supabase devolve erro em inglês. A interface é toda em português, então a
 * tradução acontece aqui, num lugar só.
 *
 * Cuidado deliberado no login: "e-mail não existe" e "senha errada" viram a
 * mesma frase. Distinguir os dois entrega ao atacante quais e-mails têm conta.
 */

/**
 * A resposta do provedor revela **se aquele e-mail tem conta**?
 *
 * Só essas ficam caladas em `/recuperar` e `/acesso`: responder diferente para
 * endereço com e sem conta entrega ao atacante quais e-mails existem.
 *
 * **É lista de silêncio, não lista de exibição** — e a diferença custou um
 * teste de campo. Antes era o contrário: só um punhado de frases conhecidas
 * aparecia, e tudo o mais virava "link enviado". Quando o SMTP passou a
 * recusar com `535 authentication failed`, essa frase não estava na lista, e a
 * tela voltou a mentir exatamente como antes da correção.
 *
 * Invertido, o silêncio é a exceção: qualquer erro que não seja um destes é
 * problema nosso e aparece. E inverter não vaza nada, porque nenhum outro erro
 * depende de quem é o destinatário — SMTP recusado, limite estourado e 500
 * acontecem igual para endereço com e sem conta.
 */
const RESPOSTA_SOBRE_O_DESTINATARIO =
  /signups? not allowed|user not found|user is unauthorized/i;

/**
 * O erro do envio de link deve aparecer para quem pediu?
 */
export function falhaDeEnvioVisivel(mensagem: string | undefined | null): boolean {
  if (!mensagem) return true;
  return !RESPOSTA_SOBRE_O_DESTINATARIO.test(mensagem);
}

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
    Estreito de propósito: esta lista traduz erro de **toda** a autenticação, e
    um 500 no login não pode virar "não conseguimos enviar o e-mail". Quem
    decide o que aparece nas telas de link é `falhaDeEnvioVisivel`; aqui é só a
    frase em português quando o erro é reconhecidamente de envio.
  */
  [
    /not authorized|error sending|failed to send|smtp|email provider|5\.7\.\d|\b535\b/i,
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
