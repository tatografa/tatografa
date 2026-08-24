import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Ponto de chegada dos links enviados por e-mail: confirmação de conta e
 * recuperação de senha.
 *
 * O Supabase manda `token_hash` + `type` (fluxo de OTP por e-mail) ou `code`
 * (fluxo PKCE), dependendo da configuração do projeto. Tratamos os dois: o link
 * que chega na caixa de entrada do personal não pode depender disso.
 *
 * Trocar o token por sessão precisa acontecer num Route Handler porque só aqui
 * dá para gravar o cookie de sessão.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const codigo = searchParams.get("code");
  const proximo = destinoSeguro(searchParams.get("proximo"));

  const supabase = await createClient();

  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({
      type: tipo,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(proximo, origin));
  } else if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(proximo, origin));
  }

  return NextResponse.redirect(new URL("/entrar?erro=link-invalido", origin));
}

/** Só caminho interno — um `proximo` externo viraria redirecionador aberto. */
function destinoSeguro(valor: string | null): string {
  return valor && valor.startsWith("/") && !valor.startsWith("//")
    ? valor
    : "/painel";
}
