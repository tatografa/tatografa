import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Roda antes de cada requisição de página. Faz duas coisas:
 *
 * 1. Renova a sessão do Supabase (obrigatório — ver lib/supabase/proxy.ts).
 * 2. Desvia quem não está logado para o login, antes de renderizar qualquer
 *    coisa. É uma checagem *otimista*: a autorização de verdade acontece em
 *    app/(personal)/painel/layout.tsx, que confirma a linha em `trainers`.
 *    Proxy não é lugar de decidir permissão — é lugar de evitar render à toa.
 *
 * Fase 1: acrescentar `/app/*` (área do aluno) aqui, desviando para `/acesso`.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/painel") && !user) {
    const login = new URL("/entrar", request.url);
    // Volta para onde o usuário queria ir depois de entrar.
    if (pathname !== "/painel") login.searchParams.set("proximo", pathname + search);
    return NextResponse.redirect(login);
  }

  // Já logado não precisa ver o login de novo.
  if (user && (pathname === "/entrar" || pathname === "/cadastro")) {
    return NextResponse.redirect(new URL("/painel", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Tudo, menos arquivos estáticos e imagens — o proxy faz uma chamada de
     * rede por requisição, e não faz sentido pagá-la por um .svg.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
