"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { LIMITES_DO_ALERTA } from "@/lib/domain/atencao";
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
