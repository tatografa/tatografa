import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Cliente para Server Components, Server Actions e Route Handlers.
 *
 * Um cliente novo por requisição — nunca reaproveite entre requisições, senão
 * a sessão de um usuário vaza para outro.
 *
 * Server Components não podem escrever cookie. Quando o `setAll` falha aqui é
 * porque a renderização já começou; o `proxy.ts` já renovou a sessão antes,
 * então engolir o erro é seguro.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado de um Server Component. O proxy cuida da renovação.
        }
      },
    },
  });
}
