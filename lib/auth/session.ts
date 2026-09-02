import { redirect } from "next/navigation";
import { cache } from "react";

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

/**
 * Exige uma sessão de aluno. Use no layout de `/app`.
 *
 * Devolve também o personal, porque quase toda tela do aluno mostra o nome
 * dele ("treinos da Ana", "Semana 3 de 8 · Ana").
 *
 * Memoizada por requisição com `cache()`: o layout autoriza e as páginas de
 * dentro dele precisam do mesmo aluno e do mesmo personal para o cabeçalho.
 * Sem isso seriam três idas ao Supabase por tela, todas com a mesma resposta.
 */
export const requireStudent = cache(async function requireStudent(): Promise<{
  student: Tables<"students">;
  personal: Pick<Tables<"trainers">, "id" | "name" | "phone" | "avatar_url">;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acesso");

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!student) {
    const { data: trainer } = await supabase
      .from("trainers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (trainer) redirect("/painel");
    redirect("/acesso?erro=sem-perfil");
  }

  // O RLS de `trainers` já libera o personal do aluno logado; não precisa de
  // filtro extra aqui.
  const { data: personal } = await supabase
    .from("trainers")
    .select("id, name, phone, avatar_url")
    .eq("id", student.trainer_id)
    .maybeSingle();

  // A fk garante que o personal existe; só o tipo do cliente admite nulo.
  if (!personal) redirect("/acesso?erro=sem-perfil");

  return { student, personal };
});
