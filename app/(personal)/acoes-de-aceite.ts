"use server";

import { revalidatePath } from "next/cache";

import { requireTrainer } from "@/lib/auth/session";
import { registrarAceite } from "@/lib/legal/aceite";

import type { EstadoDoAceite } from "@/app/(aluno)/acoes-de-aceite";

const ERRO = "Não conseguimos registrar seu aceite agora. Tente de novo.";

/**
 * O aceite do **personal** (decisão do Otávio, 17/09).
 *
 * Arquivo próprio e não uma função a mais no do aluno: módulo `"use server"` é
 * fronteira de rede, e a autorização de cada lado mora no lado dele —
 * `requireTrainer()` aqui, `requireStudent()` lá. A escrita, essa sim, é uma só.
 */
export async function aceitarAtualizacaoDoPersonal(
  _anterior: EstadoDoAceite,
): Promise<EstadoDoAceite> {
  const { trainer } = await requireTrainer();
  if (!(await registrarAceite(trainer.id))) return { erro: ERRO };

  revalidatePath("/painel", "layout");
  return {};
}
