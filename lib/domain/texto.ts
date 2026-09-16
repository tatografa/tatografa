/**
 * Comparação de texto digitado por gente.
 *
 * Módulo neutro e minúsculo de propósito: a busca do catálogo de exercícios
 * roda no servidor (`lib/queries/exercicios.ts`) e no cliente
 * (`tela-de-exercicios.tsx`), e a busca da tabela de alunos só no cliente. Uma
 * cópia por chamador divergiria na primeira palavra acentuada, e o sintoma
 * seria um filtro que acha no servidor e não acha na tela.
 */

/**
 * Texto sem acento e em minúsculas, para comparar o que o personal digitou.
 *
 * Ele digita "triceps" e espera achar "Tríceps testa"; digita "jose" e espera
 * achar "José". Comparar sem normalizar transformaria o acento num filtro
 * invisível.
 */
export function normalizarParaBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
