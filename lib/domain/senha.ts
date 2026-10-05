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
 * **E é a mesma regra do Supabase** (decisão do Otávio, 05/10): o painel está
 * em "Lowercase, uppercase letters, digits and symbols", e por isso a senha
 * fraca também não passa num POST direto à API. As duas precisam andar juntas:
 * se a daqui for mais frouxa, a senha passa na tela e volta recusada pelo
 * servidor; se for mais dura, a tela recusa o que o banco aceitaria. Mudou lá,
 * muda aqui — e o inverso. A proteção contra senha vazada, que é outra coisa,
 * exige o plano Pro.
 */

import type { Idioma } from "@/lib/domain/idioma";

export const SENHA_MINIMA = 8;

/*
 * Os símbolos que o Supabase aceita, copiados da lista dele. Não é "qualquer
 * coisa que não seja letra nem número": "é", "ç" e o espaço não contam lá, e
 * contar aqui faria a tela aprovar uma senha que o servidor recusa.
 */
const SIMBOLOS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

/**
 * As exigências, na ordem em que a tela as lista. A verificação é uma só; o
 * texto muda com o idioma das telas de entrada (etapa 1 da tradução, 05/10).
 * Português é o padrão de quem não passa idioma.
 */
const VERIFICACOES = [
  { chave: "tamanho", ok: (senha: string) => senha.length >= SENHA_MINIMA },
  { chave: "minuscula", ok: (senha: string) => /[a-z]/.test(senha) },
  { chave: "maiuscula", ok: (senha: string) => /[A-Z]/.test(senha) },
  { chave: "numero", ok: (senha: string) => /[0-9]/.test(senha) },
  {
    chave: "simbolo",
    ok: (senha: string) => [...senha].some((c) => SIMBOLOS.includes(c)),
  },
] as const;

type ChaveDaRegra = (typeof VERIFICACOES)[number]["chave"];

const TEXTOS: Record<
  Idioma,
  { regras: Record<ChaveDaRegra, { texto: string; erro: string }>; dica: string }
> = {
  pt: {
    regras: {
      tamanho: {
        texto: `Pelo menos ${SENHA_MINIMA} caracteres`,
        erro: `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`,
      },
      minuscula: {
        texto: "Uma letra minúscula",
        erro: "A senha precisa de pelo menos uma letra minúscula.",
      },
      maiuscula: {
        texto: "Uma letra maiúscula",
        erro: "A senha precisa de pelo menos uma letra maiúscula.",
      },
      numero: { texto: "Um número", erro: "A senha precisa de pelo menos um número." },
      simbolo: {
        texto: "Um símbolo, como ! @ # $ %",
        erro: "A senha precisa de pelo menos um símbolo, como ! @ # $ %.",
      },
    },
    dica: `Mínimo de ${SENHA_MINIMA} caracteres, com letra minúscula, letra maiúscula, número e símbolo (como ! @ # $ %).`,
  },
  en: {
    regras: {
      tamanho: {
        texto: `At least ${SENHA_MINIMA} characters`,
        erro: `Your password needs at least ${SENHA_MINIMA} characters.`,
      },
      minuscula: {
        texto: "A lowercase letter",
        erro: "Your password needs at least one lowercase letter.",
      },
      maiuscula: {
        texto: "An uppercase letter",
        erro: "Your password needs at least one uppercase letter.",
      },
      numero: { texto: "A number", erro: "Your password needs at least one number." },
      simbolo: {
        texto: "A symbol, like ! @ # $ %",
        erro: "Your password needs at least one symbol, like ! @ # $ %.",
      },
    },
    dica: `At least ${SENHA_MINIMA} characters, with a lowercase letter, an uppercase letter, a number and a symbol (like ! @ # $ %).`,
  },
  es: {
    regras: {
      tamanho: {
        texto: `Al menos ${SENHA_MINIMA} caracteres`,
        erro: `La contraseña necesita al menos ${SENHA_MINIMA} caracteres.`,
      },
      minuscula: {
        texto: "Una letra minúscula",
        erro: "La contraseña necesita al menos una letra minúscula.",
      },
      maiuscula: {
        texto: "Una letra mayúscula",
        erro: "La contraseña necesita al menos una letra mayúscula.",
      },
      numero: { texto: "Un número", erro: "La contraseña necesita al menos un número." },
      simbolo: {
        texto: "Un símbolo, como ! @ # $ %",
        erro: "La contraseña necesita al menos un símbolo, como ! @ # $ %.",
      },
    },
    dica: `Mínimo ${SENHA_MINIMA} caracteres, con minúscula, mayúscula, número y símbolo (como ! @ # $ %).`,
  },
};

/** As exigências com o texto no idioma pedido, na ordem da tela. */
export function regrasDaSenha(idioma: Idioma = "pt") {
  return VERIFICACOES.map((v) => ({ ...TEXTOS[idioma].regras[v.chave], ok: v.ok }));
}

/**
 * A primeira regra que a senha não cumpre, ou nulo se cumpre todas.
 *
 * Uma por vez, e na ordem da lista: três erros de uma vez num campo só viram
 * um parágrafo que ninguém lê.
 */
export function erroDaSenha(senha: string, idioma: Idioma = "pt"): string | null {
  return regrasDaSenha(idioma).find((regra) => !regra.ok(senha))?.erro ?? null;
}

/** O texto de apoio do campo, para os formulários não escreverem cada um o seu. */
export function dicaDaSenha(idioma: Idioma = "pt"): string {
  return TEXTOS[idioma].dica;
}

