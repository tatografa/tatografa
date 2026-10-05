import "server-only";

import { cookies } from "next/headers";

import { COOKIE_DO_IDIOMA, ehIdioma, type Idioma } from "@/lib/domain/idioma";

/**
 * O idioma desta requisição: o `?lang=` da página, se houver, senão o cookie
 * que o `proxy.ts` gravou, senão português.
 *
 * As Server Actions chamam sem argumento — não recebem a URL da página, e é por
 * isso que o cookie existe. A ordem é a mesma para os dois, então a mensagem de
 * erro sai na língua da tela que a mostrou.
 */
export async function idiomaAtual(daUrl?: string | null): Promise<Idioma> {
  if (ehIdioma(daUrl)) return daUrl;
  const doCookie = (await cookies()).get(COOKIE_DO_IDIOMA)?.value;
  return ehIdioma(doCookie) ? doCookie : "pt";
}
