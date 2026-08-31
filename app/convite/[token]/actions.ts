"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { traduzErro } from "@/lib/auth/mensagens";
import { createClient } from "@/lib/supabase/server";

export type EstadoOnboarding = {
  erro?: string;
  errosPorCampo?: Partial<
    Record<
      "senha" | "termos" | "objetivo" | "nascimento" | "peso" | "altura" | "nivel",
      string
    >
  >;
  sucesso?: "confirme-email";
};

const SENHA_MINIMA = 8;

/**
 * As duas etapas chegam juntas num submit só.
 *
 * Separar em dois envios exigiria sessão entre eles, e com confirmação de
 * e-mail ligada o `signUp` não devolve sessão — o aluno ficaria preso entre as
 * etapas. Juntando, o gatilho grava a linha de `students` completa de uma vez.
 */
const esquema = z.object({
  senha: z
    .string()
    .min(SENHA_MINIMA, `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`)
    .regex(/[a-zA-Z]/, "A senha precisa de pelo menos uma letra.")
    .regex(/[0-9]/, "A senha precisa de pelo menos um número."),
  termos: z.literal("on", {
    error: "É preciso aceitar os termos para continuar.",
  }),
  objetivo: z.enum(["massa", "gordura", "condicionamento", "saude"], {
    error: "Escolha um objetivo.",
  }),
  nivel: z.enum(["iniciante", "intermediario", "avancado"], {
    error: "Escolha seu nível.",
  }),
  nascimento: z
    .string()
    .min(1, "Informe sua data de nascimento.")
    .refine((valor) => {
      const data = new Date(valor);
      if (Number.isNaN(data.getTime())) return false;
      const anos =
        (Date.now() - data.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return anos >= 12 && anos <= 100;
    }, "Data de nascimento inválida."),
  peso: z.coerce
    .number({ error: "Informe seu peso." })
    .gt(0, "Informe seu peso.")
    .lt(500, "Peso inválido."),
  altura: z.coerce
    .number({ error: "Informe sua altura." })
    .gt(0, "Informe sua altura.")
    .lt(300, "Altura inválida."),
});

export async function criarAcesso(
  _anterior: EstadoOnboarding,
  formData: FormData,
): Promise<EstadoOnboarding> {
  const bruto = {
    senha: String(formData.get("senha") ?? ""),
    termos: String(formData.get("termos") ?? ""),
    objetivo: String(formData.get("objetivo") ?? ""),
    nivel: String(formData.get("nivel") ?? ""),
    nascimento: String(formData.get("nascimento") ?? ""),
    peso: String(formData.get("peso") ?? ""),
    altura: String(formData.get("altura") ?? ""),
  };

  const token = String(formData.get("token") ?? "");
  const nome = String(formData.get("nome") ?? "");

  const analise = esquema.safeParse(bruto);
  if (!analise.success) {
    const errosPorCampo: EstadoOnboarding["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as keyof NonNullable<
        EstadoOnboarding["errosPorCampo"]
      >;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo };
  }

  const supabase = await createClient();

  // O e-mail vem do convite, nunca do formulário: o campo na tela é só leitura
  // e o gatilho confere de novo no banco.
  const { data: convite } = await supabase.rpc("convite_por_token", {
    p_token: token,
  });
  const valido = convite?.[0];

  if (!valido) {
    return { erro: "Esse convite não vale mais. Peça um novo ao seu personal." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: valido.email,
    password: analise.data.senha,
    options: {
      data: {
        role: "aluno",
        invite_token: token,
        name: nome || valido.nome,
        goal: analise.data.objetivo,
        experience_level: analise.data.nivel,
        birth_date: analise.data.nascimento,
        weight_kg: String(analise.data.peso),
        height_cm: String(Math.round(analise.data.altura)),
      },
    },
  });

  if (error) {
    // O gatilho recusa convite inválido levantando exceção; o GoTrue devolve
    // isso como erro de banco, sem texto útil para o aluno.
    if (/convite_invalido|convite_email_divergente|database/i.test(error.message)) {
      return {
        erro: "Esse convite não vale mais. Peça um novo ao seu personal.",
      };
    }
    return { erro: traduzErro(error.message) };
  }

  if (data.session) redirect("/convite/pronto");

  return { sucesso: "confirme-email" };
}
