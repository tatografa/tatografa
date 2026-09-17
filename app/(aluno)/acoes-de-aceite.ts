"use server";

import { revalidatePath } from "next/cache";

import { requireStudent } from "@/lib/auth/session";
import { registrarAceite } from "@/lib/legal/aceite";

export type EstadoDoAceite = { erro?: string };

const ERRO = "Não conseguimos registrar seu aceite agora. Tente de novo.";

/**
 * O aceite do **aluno**. A escrita é a mesma dos dois papéis
 * (`lib/legal/aceite.ts`); o que é daqui é a autorização.
 */
export async function aceitarAtualizacao(
  _anterior: EstadoDoAceite,
): Promise<EstadoDoAceite> {
  const { student } = await requireStudent();
  if (!(await registrarAceite(student.id))) return { erro: ERRO };

  // `"layout"`: o portão vive no layout do app do aluno, e é ele que precisa
  // ser refeito para a tela normal voltar.
  revalidatePath("/app", "layout");
  return {};
}
