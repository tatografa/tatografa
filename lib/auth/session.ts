import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/**
 * Exige uma sessão de personal. Use no layout de `/painel`.
 *
 * Esta é a autorização de verdade — o proxy só evita render desnecessário.
 * A checagem é a existência da linha em `trainers`, não um campo de metadado:
 * metadado de usuário é editável pelo próprio usuário, linha de tabela não.
 */
export async function requireTrainer(): Promise<{
  trainer: Tables<"trainers">;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (trainer) return { trainer };

  // Papel errado vai para a área certa, não para uma tela de erro (doc 02).
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (student) redirect("/app");

  redirect("/entrar?erro=sem-perfil");
}
