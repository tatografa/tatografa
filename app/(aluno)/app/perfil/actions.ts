"use server";

import { revalidatePath } from "next/cache";

import { requireStudent } from "@/lib/auth/session";
import { esquemaDoPerfil, type CampoDoPerfil } from "@/lib/domain/perfil";
import { createClient } from "@/lib/supabase/server";

export type EstadoDoPerfil = {
  erro?: string;
  errosPorCampo?: Partial<Record<CampoDoPerfil, string>>;
  sucesso?: boolean;
};

/**
 * O aluno corrige o próprio perfil.
 *
 * **Por que isto existe:** a política de privacidade promete, em "Seus
 * direitos", que "o perfil é editável" — e até aqui ele era só de leitura.
 * Corrigir dado errado sobre si é direito da LGPD, e uma tela que só mostra não
 * atende. O peso, além disso, muda com o tempo e é dele que o personal parte
 * para montar o treino.
 *
 * **O que NÃO entra:** `trainer_id` e `email`.
 *
 * O `trainer_id` porque `students_update` recusaria (0010) — trocar de personal
 * é decisão de quem convida. Nem sequer é enviado: mandar e ser recusado seria
 * um erro na cara do aluno por uma coisa que a tela nunca ofereceu.
 *
 * O e-mail porque ele é a identidade em `auth.users`, não um campo de perfil;
 * trocá-lo é um fluxo de confirmação do Supabase, não um update de linha. A
 * tela diz isso e dá o canal.
 */
export async function salvarPerfil(
  _anterior: EstadoDoPerfil,
  formData: FormData,
): Promise<EstadoDoPerfil> {
  const bruto = {
    nome: String(formData.get("nome") ?? ""),
    objetivo: String(formData.get("objetivo") ?? ""),
    nivel: String(formData.get("nivel") ?? ""),
    nascimento: String(formData.get("nascimento") ?? ""),
    peso: String(formData.get("peso") ?? ""),
    altura: String(formData.get("altura") ?? ""),
  };

  const analise = esquemaDoPerfil.safeParse(bruto);
  if (!analise.success) {
    const errosPorCampo: EstadoDoPerfil["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as CampoDoPerfil | undefined;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo };
  }

  const { nome, objetivo, nivel, nascimento, peso, altura } = analise.data;
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { error } = await supabase
    .from("students")
    .update({
      name: nome,
      goal: objetivo,
      experience_level: nivel,
      birth_date: nascimento,
      weight_kg: peso,
      height_cm: Math.round(altura),
    })
    .eq("id", student.id);

  if (error) {
    return { erro: "Não conseguimos salvar agora. Tente de novo." };
  }

  // `"layout"` e não a página solta: o nome do aluno aparece no cabeçalho da
  // home e o peso alimenta a tela do personal — a subárvore inteira envelheceu.
  revalidatePath("/app", "layout");
  return { sucesso: true };
}
