"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { LIMITES_DO_ALERTA } from "@/lib/domain/atencao";
import { telefoneDoPersonal } from "@/lib/domain/telefone";
import { createClient } from "@/lib/supabase/server";

export type EstadoDasConfiguracoes = {
  erro?: string;
  errosPorCampo?: Partial<Record<"dias", string>>;
  campos?: { dias?: string };
  sucesso?: boolean;
};

/*
 * A mesma faixa que o `check` da migration 0014 aplica. Aqui a validação existe
 * para dar mensagem em português; lá ela existe porque um POST direto não passa
 * por formulário nenhum.
 */
const esquema = z.object({
  dias: z.coerce
    .number({ error: "Informe um número de dias." })
    .int("Use um número inteiro de dias.")
    .min(
      LIMITES_DO_ALERTA.minimo,
      `O mínimo é ${LIMITES_DO_ALERTA.minimo} dia.`,
    )
    .max(
      LIMITES_DO_ALERTA.maximo,
      `O máximo é ${LIMITES_DO_ALERTA.maximo} dias.`,
    ),
});

/**
 * Salva o limiar de inatividade do personal logado.
 *
 * Não recebe id de personal: o alvo é sempre `auth.uid()`. Aceitar um id do
 * formulário abriria a porta para editar o ajuste de outro personal — e o
 * `trainers_update` barraria, mas a porta não deveria existir.
 */
export async function salvarConfiguracoes(
  _anterior: EstadoDasConfiguracoes,
  dados: FormData,
): Promise<EstadoDasConfiguracoes> {
  const { trainer } = await requireTrainer();

  const bruto = { dias: String(dados.get("dias") ?? "") };
  const analise = esquema.safeParse(bruto);

  if (!analise.success) {
    const { fieldErrors } = z.flattenError(analise.error);
    return {
      campos: bruto,
      errosPorCampo: { dias: fieldErrors.dias?.[0] },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("trainers")
    .update({ dias_para_alerta: analise.data.dias })
    .eq("id", trainer.id);

  if (error) {
    return { campos: bruto, erro: "Não deu para salvar agora. Tente de novo." };
  }

  // O painel mostra o limiar na linha de ajuste e o usa para montar os alertas.
  revalidatePath("/painel");
  revalidatePath("/painel/configuracoes");

  return { sucesso: true };
}

export type EstadoDoContato = {
  erro?: string;
  errosPorCampo?: Partial<Record<"telefone", string>>;
  campos?: { telefone?: string };
  sucesso?: boolean;
};

/**
 * Salva o WhatsApp do personal.
 *
 * `trainers.phone` existe desde a migration 0001 e **ninguém escrevia nela**:
 * o doc 05 §11 pede um card no perfil do aluno com o botão que abre a conversa
 * direta, e sem este formulário esse botão nunca apareceria para ninguém. É a
 * outra metade da mesma costura.
 *
 * Vazio é resposta válida: o personal que não quer dar o número fica sem o
 * botão no app do aluno, e nada mais muda.
 *
 * Como em `salvarConfiguracoes`, não recebe id: o alvo é sempre `auth.uid()`.
 */
export async function salvarContato(
  _anterior: EstadoDoContato,
  dados: FormData,
): Promise<EstadoDoContato> {
  const { trainer } = await requireTrainer();

  const bruto = { telefone: String(dados.get("telefone") ?? "") };
  const analise = telefoneDoPersonal.safeParse(bruto.telefone);

  if (!analise.success) {
    return {
      campos: bruto,
      errosPorCampo: { telefone: analise.error.issues[0]?.message },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("trainers")
    .update({ phone: analise.data })
    .eq("id", trainer.id);

  if (error) {
    return { campos: bruto, erro: "Não deu para salvar agora. Tente de novo." };
  }

  // "layout" e não a página: o número aparece no app do aluno, que é outra
  // árvore de rotas — e foi um `revalidatePath` de escopo errado que fez o
  // Otávio não se ver no seletor de alunos em 13/09.
  revalidatePath("/painel", "layout");
  revalidatePath("/app", "layout");
  return { sucesso: true };
}
