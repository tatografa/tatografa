import type { Idioma } from "@/lib/domain/idioma";

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

type Frase = Record<Idioma, string>;

const TRADUCOES: Array<[RegExp, Frase]> = [
  [
    /invalid login credentials/i,
    {
      pt: "E-mail ou senha incorretos.",
      en: "Wrong email or password.",
      es: "Correo o contraseña incorrectos.",
    },
  ],
  [
    /email not confirmed/i,
    {
      pt: "Confirme seu e-mail antes de entrar. Veja a caixa de entrada.",
      en: "Confirm your email before signing in. Check your inbox.",
      es: "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada.",
    },
  ],
  [
    /user already registered|already been registered/i,
    {
      pt: "Já existe uma conta com esse e-mail.",
      en: "There's already an account with this email.",
      es: "Ya existe una cuenta con ese correo.",
    },
  ],
  [
    /password should be at least/i,
    {
      pt: "A senha precisa de pelo menos 8 caracteres.",
      en: "Your password needs at least 8 characters.",
      es: "La contraseña necesita al menos 8 caracteres.",
    },
  ],
  /*
    O Supabase tem a própria regra de composição (Authentication → Email →
    Password requirements), e ela pode ser mais dura que a de
    `lib/domain/senha.ts`. Quando é, a senha passa na tela e volta recusada
    daqui — e sem esta linha a pessoa lia "Não foi possível concluir", sem saber
    que o problema era a senha (achado no print do painel, 02/10).
  */
  [
    /password should contain|weak.?password/i,
    {
      pt: "Essa senha é fraca demais. Use letra minúscula, letra maiúscula, número e símbolo (como ! @ # $ %).",
      en: "That password is too weak. Use a lowercase letter, an uppercase letter, a number and a symbol (like ! @ # $ %).",
      es: "Esa contraseña es demasiado débil. Usa minúscula, mayúscula, número y símbolo (como ! @ # $ %).",
    },
  ],
  [
    /for security purposes|only request this after|rate limit/i,
    {
      pt: "Muitas tentativas seguidas. Espere um minuto e tente de novo.",
      en: "Too many attempts in a row. Wait a minute and try again.",
      es: "Demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo.",
    },
  ],
  [
    /new password should be different/i,
    {
      pt: "A nova senha precisa ser diferente da anterior.",
      en: "Your new password must be different from the old one.",
      es: "La nueva contraseña debe ser distinta de la anterior.",
    },
  ],
  [
    /(token|link).*(expired|invalid)|invalid.*(token|link)/i,
    {
      pt: "Esse link expirou ou já foi usado. Peça outro.",
      en: "This link has expired or was already used. Ask for a new one.",
      es: "Este enlace venció o ya se usó. Pide otro.",
    },
  ],
  [
    /unable to validate email|invalid email/i,
    { pt: "E-mail inválido.", en: "Invalid email.", es: "Correo no válido." },
  ],
  [
    /signups? not allowed|disabled/i,
    {
      pt: "O cadastro está desativado no momento.",
      en: "Sign-ups are turned off right now.",
      es: "El registro está desactivado en este momento.",
    },
  ],
  /*
    Estreito de propósito: esta lista traduz erro de **toda** a autenticação, e
    um 500 no login não pode virar "não conseguimos enviar o e-mail". Quem
    decide o que aparece nas telas de link é `falhaDeEnvioVisivel`; aqui é só a
    frase quando o erro é reconhecidamente de envio.

    A frase é neutra de papel: ela aparece no cadastro do personal e na
    recuperação de senha dos dois, e "peça ajuda ao seu personal" mandava o
    próprio personal pedir ajuda a si mesmo (teste do Otávio, 02/10).
  */
  [
    /not authorized|error sending|failed to send|smtp|email provider|5\.7\.\d|\b535\b/i,
    {
      pt: "Não conseguimos enviar o e-mail agora. O problema é nosso, não seu — tente de novo em alguns minutos.",
      en: "We couldn't send the email right now. The problem is on our side, not yours — try again in a few minutes.",
      es: "No pudimos enviar el correo ahora. El problema es nuestro, no tuyo — inténtalo de nuevo en unos minutos.",
    },
  ],
];

const GENERICO: Frase = {
  pt: "Não foi possível concluir. Tente de novo.",
  en: "Something went wrong. Please try again.",
  es: "No se pudo completar. Inténtalo de nuevo.",
};

/**
 * O erro do Supabase na língua da tela. Português é o padrão: o painel e o app
 * ainda só falam português (etapas 2 e 3 da tradução).
 */
export function traduzErro(
  mensagem: string | undefined | null,
  idioma: Idioma = "pt",
): string {
  if (!mensagem) return GENERICO[idioma];
  for (const [padrao, traducao] of TRADUCOES) {
    if (padrao.test(mensagem)) return traducao[idioma];
  }
  return GENERICO[idioma];
}
