import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Renova a sessão no proxy e devolve o usuário junto da resposta.
 *
 * O cookie de sessão expira; sem uma renovação antes da renderização, o usuário
 * é deslogado no meio do uso. Como Server Components não escrevem cookie, esta
 * é a única camada que consegue gravar o token novo.
 *
 * Os cookies são escritos nos DOIS lados: no `request` para que o render desta
 * mesma requisição já enxergue a sessão nova, e no `response` para que o
 * navegador guarde.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl(),
    supabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          // Resposta que grava cookie de auth não pode ser cacheada por CDN.
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // Não troque por `getSession()`: só o `getUser()` valida o token no servidor.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
