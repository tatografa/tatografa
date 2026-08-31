import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Roda antes de cada requisição de página. Faz duas coisas:
 *
 * 1. Renova a sessão do Supabase (obrigatório — ver lib/supabase/proxy.ts).
 * 2. Desvia quem não está logado para o login, antes de renderizar qualquer
 *    coisa. É uma checagem *otimista*: a autorização de verdade acontece nos
 *    layouts, com `requireTrainer()` e `requireStudent()`, que confirmam a
 *    linha em `trainers` / `students`. Proxy não é lugar de decidir permissão —
 *    é lugar de evitar render à toa.
 *
 * `/convite/[token]` fica de fora de propósito: quem abre o link ainda não tem
 * conta. A validade do token é checada na página.
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

  if (pathname.startsWith("/app") && !user) {
    const acesso = new URL("/acesso", request.url);
    if (pathname !== "/app") acesso.searchParams.set("proximo", pathname + search);
    return NextResponse.redirect(acesso);
  }

  // Já logado não precisa ver as telas de entrada de novo. Para onde mandar
  // depende do papel, e o proxy não consulta o banco — `/painel` decide: se
  // for aluno, `requireTrainer()` desvia para `/app`.
  const telasDeEntrada = ["/entrar", "/cadastro", "/acesso"];
  if (user && telasDeEntrada.includes(pathname)) {
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
