"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type CampoDoPrograma = "aluno" | "nome" | "semanas" | "inicio";

export type EstadoDoPrograma = {
  erro?: string;
  errosPorCampo?: Partial<Record<CampoDoPrograma, string>>;
};

const esquema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Dê um nome ao programa.")
    .max(80, "Nome muito longo."),
  semanas: z
    .number({ error: "Informe a duração em semanas." })
    .int("Semanas em número inteiro.")
    .min(1, "No mínimo 1 semana.")
    .max(52, "No máximo 52 semanas."),
  // Dia de calendário, como a coluna `started_at`. Guardado como texto do
  // começo ao fim: converter para `Date` e de volta empurraria a data um dia
  // para trás no fuso do produto (`lib/domain/fuso.ts`).
  inicio: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de início.")
    .refine((valor) => !Number.isNaN(Date.parse(valor)), "Data de início inválida."),
});

const esquemaDeCriacao = esquema.extend({
  alunoId: z.string().uuid("Escolha um aluno."),
});

const esquemaDeEdicao = esquema.extend({
  programaId: z.string().uuid("Programa inválido."),
});

/**
 * Cria um programa e o deixa ativo, arquivando o anterior do mesmo aluno.
 *
 * A ordem é deliberada: o programa nasce **arquivado** e só depois a RPC
 * `ativar_macrotreino` faz a troca, numa transação só. Nascer ativo esbarraria
 * no índice parcial da 0011 (um ativo por aluno), e arquivar o antigo antes de
 * ter o novo pronto deixaria o aluno sem treino nenhum se a segunda escrita
 * falhasse. Assim, o pior caso é um programa criado e arquivado — visível na
 * lista e resolvido com um clique em "Ativar".
 */
export async function criarPrograma(
  _anterior: EstadoDoPrograma,
  formData: FormData,
): Promise<EstadoDoPrograma> {
  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const analise = esquemaDeCriacao.safeParse({
    alunoId: texto(formData, "alunoId"),
    nome: texto(formData, "nome"),
    semanas: numero(formData, "semanas"),
    inicio: texto(formData, "inicio"),
  });
  if (!analise.success) return comErros(analise.error);

  const dados = analise.data;

  // O RLS de `mesocycles` já exige ser o personal daquele aluno (0007); a
  // checagem aqui é para devolver mensagem em vez de estourar no insert.
  const { data: aluno } = await supabase
    .from("students")
    .select("id")
    .eq("id", dados.alunoId)
    .eq("trainer_id", trainer.id)
    .maybeSingle();

  if (!aluno) return { errosPorCampo: { aluno: "Esse aluno não é seu." } };

  const { data: criado, error } = await supabase
    .from("mesocycles")
    .insert({
      student_id: dados.alunoId,
      trainer_id: trainer.id,
      name: dados.nome,
      total_weeks: dados.semanas,
      started_at: dados.inicio,
      status: "arquivado",
    })
    .select("id")
    .single();

  if (error || !criado) {
    return { erro: "Não deu para criar o programa. Tente de novo." };
  }

  const { error: erroAtivacao } = await supabase.rpc("ativar_macrotreino", {
    p_mesocycle_id: criado.id,
  });

  if (erroAtivacao) {
    return {
      erro: "O programa foi criado, mas não deu para ativar. Ative ele na lista.",
    };
  }

  revalidatePath("/painel/macrotreinos");
  revalidatePath("/painel/treinos");
  redirect(`/painel/macrotreinos/${criado.id}?salvo=1`);
}

/** Renomeia, muda a duração ou a data de início. Não mexe no status. */
export async function salvarPrograma(
  _anterior: EstadoDoPrograma,
  formData: FormData,
): Promise<EstadoDoPrograma> {
  await requireTrainer();
  const supabase = await createClient();

  const analise = esquemaDeEdicao.safeParse({
    programaId: texto(formData, "programaId"),
    nome: texto(formData, "nome"),
    semanas: numero(formData, "semanas"),
    inicio: texto(formData, "inicio"),
  });
  if (!analise.success) return comErros(analise.error);

  const dados = analise.data;

  const { error, count } = await supabase
    .from("mesocycles")
    .update(
      { name: dados.nome, total_weeks: dados.semanas, started_at: dados.inicio },
      { count: "exact" },
    )
    .eq("id", dados.programaId);

  if (error) return { erro: "Não deu para salvar o programa. Tente de novo." };
  // Zero linhas significa que o RLS recusou: o programa é de outro personal.
  // Sem esta checagem, a tela diria "salvo" sobre uma escrita que não houve.
  if (count === 0) return { erro: "Programa não encontrado. Recarregue a página." };

  revalidatePath("/painel/macrotreinos");
  revalidatePath(`/painel/macrotreinos/${dados.programaId}`);
  revalidatePath("/painel/treinos");
  redirect(`/painel/macrotreinos/${dados.programaId}?salvo=1`);
}

/**
 * Arquiva o programa. Não apaga nada.
 *
 * O aluno deixa de ver os treinos deste programa na hora — é o que a
 * confirmação da tela avisa com todas as letras. Treinos, prescrição e
 * histórico continuam no banco: arquivar é mudar o status, e reativar devolve
 * tudo como estava.
 */
export async function arquivarPrograma(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await requireTrainer();
  const supabase = await createClient();

  // O RLS de `mesocycles` já exige ser o personal do aluno daquele programa.
  await supabase.from("mesocycles").update({ status: "arquivado" }).eq("id", id);

  revalidatePath("/painel/macrotreinos");
  revalidatePath("/painel/treinos");
  redirect("/painel/macrotreinos");
}

/** Volta um programa arquivado a ativo, arquivando o que estiver no lugar. */
export async function ativarPrograma(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await requireTrainer();
  const supabase = await createClient();

  // A troca inteira é uma transação só (`ativar_macrotreino`, migration 0012):
  // arquivar aqui e ativar ali deixaria o aluno sem programa se a segunda
  // escrita falhasse.
  await supabase.rpc("ativar_macrotreino", { p_mesocycle_id: id });

  revalidatePath("/painel/macrotreinos");
  revalidatePath("/painel/treinos");
  redirect("/painel/macrotreinos");
}

// --------------------------------------------------------------- ajuda -----

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

function numero(formData: FormData, campo: string): number | undefined {
  const bruto = texto(formData, campo);
  if (bruto === "") return undefined;
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : undefined;
}

function comErros(erro: z.ZodError): EstadoDoPrograma {
  const errosPorCampo: EstadoDoPrograma["errosPorCampo"] = {};

  for (const problema of erro.issues) {
    const campo = mapaDeCampos[String(problema.path[0])];
    if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
  }

  return { errosPorCampo };
}

const mapaDeCampos: Record<string, CampoDoPrograma | undefined> = {
  alunoId: "aluno",
  programaId: "aluno",
  nome: "nome",
  semanas: "semanas",
  inicio: "inicio",
};
