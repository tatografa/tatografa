/**
 * A regra de senha do produto — **uma só, para os três caminhos**.
 *
 * Havia três regras diferentes, e a mais fraca era a que valia. O cadastro do
 * aluno (`/convite`) exigia 8 caracteres, uma letra e um número; o cadastro do
 * personal (`/cadastro`) e a **troca de senha** (`/recuperar/nova-senha`)
 * exigiam só o comprimento. Quem tinha senha forte podia trocá-la por
 * "12345678" pela tela de verdade: num conjunto de caminhos que levam ao mesmo
 * lugar, a força real é a do mais frouxo.
 *
 * O `SENHA_MINIMA = 8` também existia em duas cópias, uma em cada arquivo de
 * ação — e o comentário do onboarding já dizia, sobre os campos do perfil, que
 * "duas cópias divergiriam". Divergiram; só não era o perfil.
 *
 * Módulo neutro porque os dois lados precisam: a validação que decide se grava
 * (`"use server"`) e o medidor de força que o formulário desenha enquanto o
 * usuário digita (`"use client"`).
 *
 * **O que isto não resolve:** a mesma senha fraca continua passando num POST
 * direto à API do Supabase, que não conhece estas regras. Fechar aquilo é
 * configuração no painel do Supabase (Authentication → Sign In / Providers →
 * Email), registrada em `docs/plan/divida-tecnica.md` — e a proteção contra
 * senha vazada, que é outra coisa, exige o plano Pro.
 */

export const SENHA_MINIMA = 8;

/** As exigências, na ordem em que a tela as lista. */
export const REGRAS_DA_SENHA = [
  {
    texto: `Pelo menos ${SENHA_MINIMA} caracteres`,
    erro: `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`,
    ok: (senha: string) => senha.length >= SENHA_MINIMA,
  },
  {
    texto: "Pelo menos uma letra",
    erro: "A senha precisa de pelo menos uma letra.",
    ok: (senha: string) => /[a-zA-Z]/.test(senha),
  },
  {
    texto: "Pelo menos um número",
    erro: "A senha precisa de pelo menos um número.",
    ok: (senha: string) => /[0-9]/.test(senha),
  },
] as const;

/**
 * A primeira regra que a senha não cumpre, ou nulo se cumpre todas.
 *
 * Uma por vez, e na ordem da lista: três erros de uma vez num campo só viram
 * um parágrafo que ninguém lê.
 */
export function erroDaSenha(senha: string): string | null {
  return REGRAS_DA_SENHA.find((regra) => !regra.ok(senha))?.erro ?? null;
}

/** O texto de apoio do campo, para os formulários não escreverem cada um o seu. */
export const DICA_DA_SENHA = `Mínimo de ${SENHA_MINIMA} caracteres, com uma letra e um número.`;
