"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Encerra a sessão. Serve aos dois lados: painel e, na fase 1, app do aluno. */
export async function sair(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
