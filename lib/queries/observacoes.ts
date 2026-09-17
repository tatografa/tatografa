import "server-only";

import { rotuloDoDia } from "@/lib/domain/historico";
import { LIMITE_DAS_OBSERVACOES } from "@/lib/domain/observacao";
import { pareceUuid } from "@/lib/domain/id";
import { createClient } from "@/lib/supabase/server";

/** Uma anotação do personal como a ficha mostra. */
export type Observacao = {
  id: string;
  texto: string;
  criadaEm: string;
  /** "Hoje", "Ontem" ou "seg, 2 de set" — formatado no fuso do produto. */
  rotuloDoDia: string;
  /** Nula enquanto ninguém editou. A tela só diz "editada" quando houve edição. */
  editadaEm: string | null;
};

/**
 * As anotações do personal sobre um aluno, da mais recente para a mais antiga.
 *
 * **Quem trava é o RLS, e ele trava de um jeito que esta função não consegue
 * afrouxar**: `trainer_notes_select` exige `trainer_id = auth.uid()` e
 * `private.trainer_of(student_id)`, e o aluno não tem policy de select nenhuma
 * (migration 0028). Chamar isto do app do aluno devolveria lista vazia, não a
 * anotação — mas nenhuma tela do aluno chama, e é no painel que ela é montada.
 *
 * O filtro por `student_id` está aqui mesmo com o RLS cobrindo, pelo mesmo
 * motivo das outras consultas: a query não deve depender só da policy para
 * saber de quem é o dado.
 *
 * O rótulo do dia é montado **no servidor**, com o fuso fixo do produto, pelo
 * mesmo motivo do histórico: formatar no cliente deixaria a data — que é o que
 * identifica a anotação — vazia até a hidratação.
 */
export async function listarObservacoes(
  alunoId: string,
): Promise<Observacao[]> {
  if (!pareceUuid(alunoId)) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainer_notes")
    .select("id, body, created_at, updated_at")
    .eq("student_id", alunoId)
    .order("created_at", { ascending: false })
    .limit(LIMITE_DAS_OBSERVACOES);

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    id: linha.id,
    texto: linha.body,
    criadaEm: linha.created_at,
    rotuloDoDia: rotuloDoDia(linha.created_at),
    editadaEm: linha.updated_at,
  }));
}
