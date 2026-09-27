"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type CampoDoPrograma = "aluno" | "nome" | "semanas" | "inicio" | "objetivo";

export type EstadoDoPrograma = {
  salvo?: boolean;
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

const OBJETIVOS = [
  "hipertrofia",
  "forca",
  "resistencia",
  "emagrecimento",
  "condicionamento",
] as const;

// Vazio é "não informado" e vira nulo (0037): não existe um sexto valor
// "outro" para o banco guardar uma afirmação onde só há silêncio.
const esquemaDoObjetivo = z
  .union([z.enum(OBJETIVOS, { error: "Objetivo inválido." }), z.literal("")])
  .transform((valor) => (valor === "" ? null : valor));

const esquemaDeCriacao = esquema.extend({
  alunoId: z.string().uuid("Escolha um aluno."),
  objetivo: esquemaDoObjetivo,
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
    objetivo: texto(formData, "objetivo"),
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
      goal: dados.objetivo,
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
      erro: "O programa foi criado, mas não deu para ativar. Ative ele no painel de macrociclos.",
    };
  }

  revalidatePath("/painel/treinos");
  redirect(enderecoDoPrograma(dados.alunoId, criado.id));
}

/**
 * Renomeia, muda a duração ou a data de início. Não mexe no status.
 *
 * Não redireciona: o formulário mora no painel lateral da divisão de treino,
 * ao lado dos cartões, e um redirect levaria embora o que o personal estiver
 * editando neles.
 */
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

  revalidatePath("/painel/treinos");
  return { salvo: true };
}

/**
 * Muda o objetivo do programa. Chamado direto do seletor, sem botão de salvar:
 * é um valor só, e um "Salvar" para uma escolha de lista é um clique a mais que
 * ninguém lembra de dar.
 */
export async function salvarObjetivo(
  programaId: string,
  objetivo: string,
): Promise<{ ok: boolean }> {
  const analise = z
    .object({ programaId: z.string().uuid(), objetivo: esquemaDoObjetivo })
    .safeParse({ programaId, objetivo });
  if (!analise.success) return { ok: false };

  await requireTrainer();
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("mesocycles")
    .update({ goal: analise.data.objetivo }, { count: "exact" })
    .eq("id", analise.data.programaId);

  // Zero linhas é o RLS recusando: o programa é de outro personal.
  if (error || count === 0) return { ok: false };

  revalidatePath("/painel/treinos");
  return { ok: true };
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
  const { data } = await supabase
    .from("mesocycles")
    .update({ status: "arquivado" })
    .eq("id", id)
    .select("student_id")
    .maybeSingle();

  revalidatePath("/painel/treinos");
  // Fica no mesmo programa, agora arquivado: o personal acabou de mexer nele,
  // e voltar ao ativo de outro jeito esconderia o resultado do clique.
  redirect(data ? enderecoDoPrograma(data.student_id, id) : "/painel/treinos");
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

  const { data } = await supabase
    .from("mesocycles")
    .select("student_id")
    .eq("id", id)
    .maybeSingle();

  revalidatePath("/painel/treinos");
  redirect(data ? enderecoDoPrograma(data.student_id, id) : "/painel/treinos");
}

/** O endereço de um programa na divisão de treino. */
function enderecoDoPrograma(alunoId: string, programaId: string): string {
  return `/painel/treinos?aluno=${alunoId}&programa=${programaId}`;
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

export type EstadoDaCopia = {
  erro?: string;
  errosPorCampo?: { aluno?: string; nome?: string };
};

const esquemaDeCopia = z.object({
  programaId: z.string().uuid("Programa inválido."),
  alunoId: z.string().uuid("Escolha para quem copiar."),
  nome: z
    .string()
    .trim()
    .min(2, "Dê um nome ao programa novo.")
    .max(80, "Nome muito longo."),
});

/**
 * Copia um programa inteiro para um aluno — o mesmo ou outro.
 *
 * É o "duplicar macrotreino" e o "atribuir a um ou vários alunos" do doc 06 §5,
 * que são a mesma operação: dar um programa a outro aluno é copiá-lo para ele.
 * Um aluno por vez, e não uma lista de caixinhas: cada cópia nasce arquivada e
 * quase sempre leva um ajuste antes de ativar, então "vários de uma vez" só
 * pareceria mais rápido — a segunda metade do trabalho continuaria uma a uma.
 *
 * Quem copia é a RPC `duplicar_macrotreino` (migration 0029), numa transação:
 * 1 programa + N treinos + M linhas de prescrição em passos soltos deixariam,
 * numa falha no meio, um programa que existe, abre e está pela metade.
 *
 * **Não confere se o aluno é da carteira**, de propósito: a RPC roda com o RLS
 * de quem chamou, e `mesocycles_write` já exige `trainer_id = auth.uid()` **e**
 * `private.trainer_of(student_id)`. Repetir a regra aqui seria a segunda cópia
 * que sai de sincronia.
 */
export async function duplicarPrograma(
  _anterior: EstadoDaCopia,
  formData: FormData,
): Promise<EstadoDaCopia> {
  const analise = esquemaDeCopia.safeParse({
    programaId: String(formData.get("programaId") ?? ""),
    alunoId: String(formData.get("alunoId") ?? ""),
    nome: String(formData.get("nome") ?? ""),
  });

  if (!analise.success) {
    const errosPorCampo: EstadoDaCopia["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = String(problema.path[0]);
      if (campo === "alunoId" && !errosPorCampo.aluno) {
        errosPorCampo.aluno = problema.message;
      }
      if (campo === "nome" && !errosPorCampo.nome) {
        errosPorCampo.nome = problema.message;
      }
      if (campo === "programaId" && !errosPorCampo.aluno) {
        errosPorCampo.aluno = problema.message;
      }
    }
    return { errosPorCampo };
  }

  await requireTrainer();
  const supabase = await createClient();

  const { data: copia, error } = await supabase.rpc("duplicar_macrotreino", {
    p_mesocycle_id: analise.data.programaId,
    p_student_id: analise.data.alunoId,
    p_name: analise.data.nome,
  });

  if (error) {
    // `P0002` é o `no_data_found` que a RPC levanta quando o RLS escondeu o
    // programa — id inexistente e programa de outro personal dão o mesmo, de
    // propósito. `42501` é a policy recusando a cópia para quem não é aluno
    // desta carteira. Os dois viram a mesma frase: a tela do personal está
    // velha, não há o que ele conserte sabendo a diferença.
    if (error.code === "P0002" || error.code === "42501") {
      return { erro: "Esse programa ou esse aluno não está mais disponível." };
    }
    return { erro: "Não conseguimos copiar agora. Tente de novo." };
  }

  revalidatePath("/painel/treinos");
  // Abre a cópia: ela nasce arquivada e "quase sempre leva um ajuste antes de
  // ativar" (17/09) — o próximo passo do personal é justamente nela.
  redirect(enderecoDoPrograma(analise.data.alunoId, copia));
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
  objetivo: "objetivo",
};
