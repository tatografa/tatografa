"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { LIMITE_DA_OBSERVACAO } from "@/lib/domain/observacao";
import { createClient } from "@/lib/supabase/server";

export type EstadoDaObservacao = {
  erro?: string;
  errosPorCampo?: { texto?: string };
  ok?: boolean;
};

const texto = z
  .string()
  .trim()
  .min(1, "Escreva alguma coisa antes de salvar.")
  .max(
    LIMITE_DA_OBSERVACAO,
    `A anotação passa de ${LIMITE_DA_OBSERVACAO} caracteres.`,
  );

const aoCriar = z.object({ alunoId: z.string().uuid(), texto });
const aoEditar = z.object({ id: z.string().uuid(), texto });

/**
 * Anota alguma coisa sobre o aluno.
 *
 * **Não confere se o aluno é da carteira**, de propósito: `trainer_notes_insert`
 * já exige `trainer_id = auth.uid()` **e** `private.trainer_of(student_id)`
 * (migration 0028), e repetir a regra aqui seria a segunda cópia que sai de
 * sincronia. O que a ação trata é o erro que o banco devolve.
 *
 * `revalidatePath` da ficha, e só dela: a anotação não aparece em nenhuma outra
 * tela — nem no painel, nem na tabela de alunos, e muito menos no app do aluno.
 */
export async function criarObservacao(
  _anterior: EstadoDaObservacao,
  formData: FormData,
): Promise<EstadoDaObservacao> {
  const analise = aoCriar.safeParse({
    alunoId: String(formData.get("alunoId") ?? ""),
    texto: String(formData.get("texto") ?? ""),
  });

  if (!analise.success) {
    return { errosPorCampo: { texto: analise.error.issues[0]?.message } };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error } = await supabase.from("trainer_notes").insert({
    trainer_id: trainer.id,
    student_id: analise.data.alunoId,
    body: analise.data.texto,
  });

  if (error) return { erro: "Não conseguimos salvar agora. Tente de novo." };

  revalidatePath(`/painel/alunos/${analise.data.alunoId}`);
  return { ok: true };
}

/**
 * Corrige uma anotação já escrita.
 *
 * Editar é permitido aqui, ao contrário da sessão concluída e da reavaliação
 * enviada: lá o registro fechado é o histórico de que **outra pessoa** depende,
 * e reescrever mudaria o que ela já leu. Aqui ninguém mais lê, e um erro de
 * digitação numa anotação sobre lesão é pior do que a possibilidade de editá-la.
 *
 * `updated_at` é gravado pela ação e não por gatilho porque é a única escrita
 * que existe nesta tabela: um gatilho seria uma segunda regra para cobrir um
 * caminho só.
 */
export async function editarObservacao(
  _anterior: EstadoDaObservacao,
  formData: FormData,
): Promise<EstadoDaObservacao> {
  const analise = aoEditar.safeParse({
    id: String(formData.get("id") ?? ""),
    texto: String(formData.get("texto") ?? ""),
  });

  if (!analise.success) {
    return { errosPorCampo: { texto: analise.error.issues[0]?.message } };
  }

  const alunoId = String(formData.get("alunoId") ?? "");

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  // `trainer_id` no filtro além do `id`: o RLS já recusaria, mas uma consulta
  // que não diz de quem é o dado depende só da policy para acertar.
  const { error, count } = await supabase
    .from("trainer_notes")
    .update(
      { body: analise.data.texto, updated_at: new Date().toISOString() },
      { count: "exact" },
    )
    .eq("id", analise.data.id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: "Não conseguimos salvar agora. Tente de novo." };

  // Update recusado pelo `using` do RLS não dá erro: afeta zero linhas em
  // silêncio. Sem esta conferência, a tela diria "salvo" para uma anotação que
  // continuou como estava.
  if (count === 0) return { erro: "Essa anotação não existe mais." };

  revalidatePath(`/painel/alunos/${alunoId}`);
  return { ok: true };
}

export type EstadoDaExclusao = { erro?: string };

/**
 * Apaga uma anotação.
 *
 * Permitido, ao contrário de sessão e reavaliação, pelo motivo registrado na
 * migration 0028: a anotação é do personal sobre o próprio trabalho, ninguém
 * mais a lê e nenhum número do produto sai dela. Travar o delete só o obrigaria
 * a esvaziar o texto para fingir que sumiu.
 */
export async function apagarObservacao(
  _anterior: EstadoDaExclusao,
  formData: FormData,
): Promise<EstadoDaExclusao> {
  const id = String(formData.get("id") ?? "");
  const alunoId = String(formData.get("alunoId") ?? "");
  if (!z.string().uuid().safeParse(id).success) {
    return { erro: "Anotação inválida." };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error } = await supabase
    .from("trainer_notes")
    .delete()
    .eq("id", id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: "Não conseguimos apagar agora. Tente de novo." };

  revalidatePath(`/painel/alunos/${alunoId}`);
  return {};
}
