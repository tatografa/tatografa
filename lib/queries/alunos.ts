import "server-only";

import { pareceUuid } from "@/lib/domain/id";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type AlunoDaLista = Pick<
  Tables<"students">,
  "id" | "name" | "email" | "goal" | "status" | "created_at" | "onboarded_at"
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
    .select("id, name, email, goal, status, created_at, onboarded_at")
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

/**
 * Sem `token`: o link copiável é montado na Server Action que cria o convite, e
 * nenhuma tela desta lista mostra o token. Credencial que não se exibe também
 * não se trafega — ela viajaria no payload do componente de servidor à toa.
 */
export type ConvitePendente = Pick<
  Tables<"invites">,
  "id" | "name" | "email" | "expires_at" | "created_at"
>;

/** Convites ainda não aceitos, do mais recente para o mais antigo. */
export async function listarConvitesPendentes(): Promise<ConvitePendente[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invites")
    .select("id, name, email, expires_at, created_at")
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** O aluno como a ficha do painel mostra. */
export type AlunoDaFicha = Pick<
  Tables<"students">,
  | "id"
  | "name"
  | "email"
  | "goal"
  | "experience_level"
  | "status"
  | "created_at"
  | "onboarded_at"
>;

/**
 * Um aluno da carteira do personal.
 *
 * Devolve `null` tanto para id inexistente quanto para aluno de outro personal
 * — mesma regra de `lerTreino` e `lerMacrotreino`: os dois casos são "não
 * existe" para quem está olhando, e distinguir contaria a um estranho que
 * aquele id existe. Quem barra é o RLS de `students`; a página vira 404.
 */
export async function lerAluno(id: string): Promise<AlunoDaFicha | null> {
  if (!pareceUuid(id)) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      "id, name, email, goal, experience_level, status, created_at, onboarded_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
