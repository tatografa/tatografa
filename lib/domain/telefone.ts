import { z } from "zod";

/**
 * Telefone e o link de WhatsApp que sai dele — dos dois lados do produto.
 *
 * Módulo neutro: a Server Action das configurações valida com o mesmo esquema
 * que a tela do aluno usa para montar o link. Duas leituras diferentes do que é
 * "um número válido" produziriam um link que abre no vazio.
 *
 * O esquema chamava-se `telefoneDoPersonal` enquanto só o personal tinha
 * número. Com o telefone do aluno (18/09) a regra passou a servir aos dois, e o
 * nome antigo empurraria a segunda tela a escrever a sua própria cópia — que é
 * exatamente como as iniciais do nome viraram quatro.
 */

/** Só os dígitos. É o que o WhatsApp aceita na URL. */
function digitos(bruto: string): string {
  return bruto.replace(/\D/g, "");
}

/**
 * O número no formato que o `wa.me` espera: dígitos, com código do país.
 *
 * Dez ou onze dígitos é número brasileiro escrito do jeito que se escreve aqui
 * — "(11) 99999-9999" —, e ganha o 55 na frente. Doze ou treze começando com 55
 * já vem completo. Qualquer outro tamanho é tratado como número internacional
 * já com código: o produto é brasileiro, mas recusar o resto seria inventar uma
 * regra que o WhatsApp não tem.
 */
export function paraWhatsApp(bruto: string | null): string | null {
  const numero = digitos(bruto ?? "");
  if (numero.length < 10 || numero.length > 15) return null;
  if (numero.length <= 11) return `55${numero}`;
  return numero;
}

/** `https://wa.me/5511999999999`, ou nulo quando não há número utilizável. */
export function linkDoWhatsApp(bruto: string | null): string | null {
  const numero = paraWhatsApp(bruto);
  return numero ? `https://wa.me/${numero}` : null;
}

/**
 * "(11) 99999-9999" — o jeito que um brasileiro lê o próprio número.
 *
 * Só formata o que reconhece. Número de outro país volta como veio: inventar
 * parênteses num formato desconhecido atrapalha quem sabe ler o dele.
 */
export function formatarTelefone(bruto: string | null): string {
  const numero = digitos(bruto ?? "");
  if (numero.length === 11) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
  }
  if (numero.length === 10) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
  }
  return bruto ?? "";
}

/**
 * O campo, para quem digita.
 *
 * Aceita vazio — telefone é opcional dos dois lados. O personal que não quiser
 * dar o dele não aparece com o botão no app do aluno; o aluno que não quiser
 * dar o dele vira uma ficha sem botão de WhatsApp. O que não se aceita é um
 * número que não dá em lugar nenhum.
 */
export const telefoneOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine(
    (v) => v === null || paraWhatsApp(v) !== null,
    "Informe um número com DDD, como (11) 99999-9999.",
  )
  // Guardado só com dígitos, e **sem o 55 do Brasil**. Dois motivos: o mesmo
  // número digitado com e sem código do país vira a mesma linha no banco, e a
  // leitura consegue formatar como "(11) 99999-9999" — com treze dígitos ela
  // desiste e o personal vê um bloco de números nas próprias configurações
  // para sempre. O 55 volta em `paraWhatsApp`, que é quem monta o link.
  .transform((v) => (v === null ? null : semCodigoDoBrasil(digitos(v))));

/**
 * Tira o 55 da frente quando o que sobra é um número brasileiro inteiro.
 *
 * Doze ou treze dígitos começando com 55 é Brasil — 55 é o código do país, e
 * nenhum outro país o usa. Abaixo disso o 55 inicial seria o DDD de Caxias do
 * Sul, e cortá-lo destruiria o número.
 */
function semCodigoDoBrasil(numero: string): string {
  const brasileiro = numero.length === 12 || numero.length === 13;
  return brasileiro && numero.startsWith("55") ? numero.slice(2) : numero;
}
