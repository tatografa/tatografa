import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

export type AlunoDoPrograma = Pick<Tables<"students">, "id" | "name">;

export type Macrotreino = {
  id: string;
  name: string;
  total_weeks: number;
  /** `mesocycles.started_at` — dia de calendário, "2026-09-01". */
  started_at: string;
  status: Enums<"mesocycle_status">;
  /** Quantos treinos (A/B/C…) o programa tem. */
  total_treinos: number;
};

export type ProgramasDoAluno = {
  aluno: AlunoDoPrograma;
  /** O programa que o aluno está seguindo. Nulo = ele está sem treino. */
  ativo: Macrotreino | null;
  /** Programas encerrados, do mais recente para o mais antigo. */
  arquivados: Macrotreino[];
};

export type MacrotreinoDoPersonal = Macrotreino & { aluno: AlunoDoPrograma };

/** Tamanho da página ao varrer `mesocycles`. */
const PAGINA_DE_PROGRAMAS = 1000;

type LinhaDePrograma = {
  id: string;
  name: string;
  total_weeks: number;
  started_at: string;
  status: Enums<"mesocycle_status">;
  student_id: string;
  workouts: { count: number }[];
};

/**
 * Todos os programas da carteira do personal, agrupados por aluno.
 *
 * Duas consultas fixas — alunos e programas —, nunca uma por aluno. O total de
 * treinos vem embutido como agregação do PostgREST (`workouts(count)`): é
 * contado no banco, não trazendo as linhas de `workouts` para contar aqui.
 *
 * O RLS de `mesocycles` já restringe à carteira; o filtro por `student_id`
 * está aqui porque a consulta não deve depender só da policy para saber de
 * quem é o dado.
 */
export async function listarProgramasPorAluno(): Promise<ProgramasDoAluno[]> {
  const supabase = await createClient();

  const { data: alunos, error: erroAlunos } = await supabase
    .from("students")
    .select("id, name")
    .order("name");

  if (erroAlunos) throw erroAlunos;
  if (!alunos?.length) return [];

  // Varredura paginada, como em `lib/queries/historico.ts`. Programa arquivado
  // se acumula para sempre, e o corte de página do PostgREST é silencioso: sem
  // isto, um personal com carteira grande perderia o programa **ativo** de
  // alguns alunos — e o painel usa `total_treinos` do ativo como denominador
  // da aderência, então a média sairia calculada sobre menos gente.
  const programas: LinhaDePrograma[] = [];

  for (let inicio = 0; ; inicio += PAGINA_DE_PROGRAMAS) {
    const { data, error: erroProgramas } = await supabase
      .from("mesocycles")
      .select("id, name, total_weeks, started_at, status, student_id, workouts(count)")
      .in(
        "student_id",
        alunos.map((aluno) => aluno.id),
      )
      .order("started_at", { ascending: false })
      .order("created_at", { ascending: false })
      .range(inicio, inicio + PAGINA_DE_PROGRAMAS - 1);

    if (erroProgramas) throw erroProgramas;
    const pagina = data ?? [];
    programas.push(...pagina);
    if (pagina.length < PAGINA_DE_PROGRAMAS) break;
  }

  const ativoPorAluno = new Map<string, Macrotreino>();
  const arquivadosPorAluno = new Map<string, Macrotreino[]>();

  for (const linha of programas) {
    const programa: Macrotreino = {
      id: linha.id,
      name: linha.name,
      total_weeks: linha.total_weeks,
      started_at: linha.started_at,
      status: linha.status,
      total_treinos: linha.workouts[0]?.count ?? 0,
    };

    // Um ativo por aluno é garantido pelo índice parcial da migration 0011;
    // o `if` aqui é só para não perder o mais recente caso o índice caia.
    if (programa.status === "ativo" && !ativoPorAluno.has(linha.student_id)) {
      ativoPorAluno.set(linha.student_id, programa);
      continue;
    }
    const lista = arquivadosPorAluno.get(linha.student_id) ?? [];
    lista.push(programa);
    arquivadosPorAluno.set(linha.student_id, lista);
  }

  return alunos.map((aluno) => ({
    aluno,
    ativo: ativoPorAluno.get(aluno.id) ?? null,
    arquivados: arquivadosPorAluno.get(aluno.id) ?? [],
  }));
}

/**
 * Um programa com o aluno dono dele.
 *
 * Devolve `null` tanto para id inexistente quanto para programa de outro
 * personal — mesma regra de `lerTreino`: os dois casos são "não existe" para
 * quem está olhando, e distinguir contaria a um estranho que aquele id existe.
 */
export async function lerMacrotreino(id: string): Promise<MacrotreinoDoPersonal | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("mesocycles")
    .select(
      "id, name, total_weeks, started_at, status, students!inner(id, name), workouts(count)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    total_weeks: data.total_weeks,
    started_at: data.started_at,
    status: data.status,
    total_treinos: data.workouts[0]?.count ?? 0,
    aluno: data.students,
  };
}

/**
 * O programa ativo de um aluno, para a ficha dele no painel.
 *
 * Um ativo por aluno é garantido pelo índice parcial da migration 0011; a
 * ordenação fica como rede, igual à da home do aluno. Nulo = o aluno está sem
 * treino, que é informação, não erro.
 */
export async function programaAtivoDoAluno(
  alunoId: string,
): Promise<Macrotreino | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mesocycles")
    .select("id, name, total_weeks, started_at, status, workouts(count)")
    .eq("student_id", alunoId)
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    total_weeks: data.total_weeks,
    started_at: data.started_at,
    status: data.status,
    total_treinos: data.workouts[0]?.count ?? 0,
  };
}
