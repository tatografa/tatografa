/**
 * O consentimento de cookies da landing (pedido do Otávio, 05/10).
 *
 * Módulo neutro porque dois lados vão ler a mesma escolha: o aviso (cliente),
 * que grava, e — no dia em que entrar uma ferramenta de medição de uso — quem
 * decidir se ela carrega, que pode ser o servidor lendo o cookie. Duas cópias
 * do nome do cookie seriam o jeito de a ferramenta carregar para quem recusou.
 *
 * **Hoje não há cookie opcional nenhum.** O site só usa os essenciais (a sessão
 * do Supabase e a preferência da barra do painel), que não pedem consentimento.
 * O aviso existe para a escolha estar registrada **antes** de a primeira
 * ferramenta opcional entrar — e ela só pode entrar se respeitar `aceitouMedicao`.
 */

export const COOKIE_DO_CONSENTIMENTO = "reps_cookies";

/** Um ano: perguntar de novo a cada visita é o que faz a pessoa clicar sem ler. */
export const VALIDADE_DO_CONSENTIMENTO = 60 * 60 * 24 * 365;

export type Consentimento = "aceito" | "recusado";

/** A escolha gravada no texto de `document.cookie`, ou nula se não houve. */
export function consentimentoDe(cookies: string): Consentimento | null {
  for (const parte of cookies.split(";")) {
    const [nome, valor] = parte.trim().split("=");
    if (nome === COOKIE_DO_CONSENTIMENTO && (valor === "aceito" || valor === "recusado")) {
      return valor;
    }
  }
  return null;
}

/** Só "aceito" libera cookie opcional; sem escolha, vale como recusa. */
export function aceitouMedicao(consentimento: Consentimento | null): boolean {
  return consentimento === "aceito";
}
