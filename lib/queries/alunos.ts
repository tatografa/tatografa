import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type AlunoDaLista = Pick<
  Tables<"students">,
  "id" | "name" | "email" | "goal" | "status" | "created_at"
> & {
  ultima_sessao: string | null;
};

/**
 * Alunos do personal logado, com a data da última sessão concluída.
 *
 * A última sessão vem por uma query só, agrupada — não uma por aluno. Com 50
 * alunos o N+1 não doeria, mas o hábito é o que evita a dor depois.
 */
export async function listarAlunos(): Promise<AlunoDaLista[]> {
  const supabase = await createClient();

  const { data: alunos, error } = await supabase
    .from("students")
    .select("id, name, email, goal, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!alunos?.length) return [];

  const { data: sessoes } = await supabase
    .from("workout_sessions")
    .select("student_id, finished_at")
    .in(
      "student_id",
      alunos.map((a) => a.id),
    )
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false });

  const ultima = new Map<string, string>();
  for (const s of sessoes ?? []) {
    if (s.finished_at && !ultima.has(s.student_id)) {
      ultima.set(s.student_id, s.finished_at);
    }
  }

  return alunos.map((aluno) => ({
    ...aluno,
    ultima_sessao: ultima.get(aluno.id) ?? null,
  }));
}

export type ConvitePendente = Pick<
  Tables<"invites">,
  "id" | "name" | "email" | "token" | "expires_at" | "created_at"
>;

/** Convites ainda não aceitos, do mais recente para o mais antigo. */
export async function listarConvitesPendentes(): Promise<ConvitePendente[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invites")
    .select("id, name, email, token, expires_at, created_at")
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
