"use server";

import { revalidatePath } from "next/cache";

import { requireStudent } from "@/lib/auth/session";
import { VERSAO_DOS_DOCUMENTOS } from "@/lib/legal/documentos";
import { createClient } from "@/lib/supabase/server";

export type EstadoDoAceite = { erro?: string };

/**
 * Registra o aceite da versão vigente dos dois documentos.
 *
 * **A versão vem da constante do servidor, nunca do formulário.** O campo
 * escondido da tela diz qual texto estava na frente de quem aceitou — é
 * informação útil —, mas quem decide qual versão vale é quem serve o texto.
 * Mesma regra do onboarding.
 *
 * A data também não passa por aqui: o gatilho `private.carimba_aceite` carimba
 * com o relógio do banco. Sem isso, um POST direto gravaria uma data anterior à
 * mudança do texto e "provaria" aceite de algo que ainda não existia.
 *
 * `upsert` com `ignoreDuplicates` porque a chave única é
 * `(user_id, documento, versao)`: dois toques no mesmo botão não podem virar
 * erro na cara de quem já aceitou.
 */
export async function aceitarAtualizacao(
  _anterior: EstadoDoAceite,
): Promise<EstadoDoAceite> {
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { error } = await supabase.from("term_acceptances").upsert(
    ["termos", "privacidade"].map((documento) => ({
      user_id: student.id,
      documento,
      versao: VERSAO_DOS_DOCUMENTOS,
    })),
    { onConflict: "user_id,documento,versao", ignoreDuplicates: true },
  );

  if (error) {
    return { erro: "Não conseguimos registrar seu aceite agora. Tente de novo." };
  }

  // `"layout"`: o portão vive no layout do app do aluno, e é ele que precisa
  // ser refeito para a tela normal voltar.
  revalidatePath("/app", "layout");
  return {};
}
