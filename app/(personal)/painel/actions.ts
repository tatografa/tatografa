"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { getSiteOrigin } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

export type EstadoConvite = {
  erro?: string;
  errosPorCampo?: Partial<Record<"nome" | "email", string>>;
  campos?: { nome?: string; email?: string };
  /** Link pronto para o personal copiar e mandar pelo WhatsApp. */
  link?: string;
  nomeConvidado?: string;
};

const esquemaConvite = z.object({
  nome: z.string().trim().min(2, "Informe o nome do aluno."),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail do aluno.")
    .email("E-mail inválido.")
    .transform((valor) => valor.toLowerCase()),
});

/**
 * 24 bytes em hex = 192 bits de entropia, 48 caracteres seguros em URL.
 * O convite é a única barreira entre um estranho e a carteira de um personal;
 * token curto aqui seria a falha mais cara do sistema.
 */
function novoToken(): string {
  return randomBytes(24).toString("hex");
}

export async function convidarAluno(
  _anterior: EstadoConvite,
  formData: FormData,
): Promise<EstadoConvite> {
  const bruto = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  const campos = bruto;

  const analise = esquemaConvite.safeParse(bruto);
  if (!analise.success) {
    const errosPorCampo: EstadoConvite["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as "nome" | "email" | undefined;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo, campos };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  // Já é aluno deste personal? Convidar de novo criaria um convite que o
  // gatilho recusaria lá na frente, com uma mensagem pior.
  const { data: jaAluno } = await supabase
    .from("students")
    .select("id")
    .eq("trainer_id", trainer.id)
    .eq("email", analise.data.email)
    .maybeSingle();

  if (jaAluno) {
    return {
      erro: "Esse e-mail já é de um aluno seu.",
      campos,
    };
  }

  // Convite pendente para o mesmo e-mail: devolve o link existente em vez de
  // criar outro. Dois links válidos para a mesma pessoa só geram confusão.
  const { data: pendente } = await supabase
    .from("invites")
    .select("token, name")
    .eq("trainer_id", trainer.id)
    .eq("email", analise.data.email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (pendente) {
    return {
      link: await montarLink(pendente.token),
      nomeConvidado: pendente.name,
    };
  }

  const token = novoToken();
  const { error } = await supabase.from("invites").insert({
    trainer_id: trainer.id,
    name: analise.data.nome,
    email: analise.data.email,
    token,
  });

  if (error) {
    return { erro: "Não deu para criar o convite. Tente de novo.", campos };
  }

  revalidatePath("/painel");
  return { link: await montarLink(token), nomeConvidado: analise.data.nome };
}

async function montarLink(token: string): Promise<string> {
  return `${await getSiteOrigin()}/convite/${token}`;
}

/** Cancela um convite pendente. O link para de funcionar na hora. */
export async function cancelarConvite(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await requireTrainer();
  const supabase = await createClient();

  // O RLS de `invites` já restringe ao personal dono; o filtro por id basta.
  await supabase.from("invites").delete().eq("id", id);

  revalidatePath("/painel");
}
