import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { supabasePublishableKey, supabaseUrl } from "./env";

/** Cliente para componentes com "use client". A sessão vive em cookie. */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());
}
