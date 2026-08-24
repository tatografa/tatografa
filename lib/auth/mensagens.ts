/**
 * O Supabase devolve erro em inglês. A interface é toda em português, então a
 * tradução acontece aqui, num lugar só.
 *
 * Cuidado deliberado no login: "e-mail não existe" e "senha errada" viram a
 * mesma frase. Distinguir os dois entrega ao atacante quais e-mails têm conta.
 */
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
];

export function traduzErro(mensagem: string | undefined | null): string {
  if (!mensagem) return "Não foi possível concluir. Tente de novo.";
  for (const [padrao, traducao] of TRADUCOES) {
    if (padrao.test(mensagem)) return traducao;
  }
  return "Não foi possível concluir. Tente de novo.";
}
