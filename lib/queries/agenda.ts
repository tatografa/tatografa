import "server-only";

import {
  faixaDaSemana,
  minutoDoDiaDoInstante,
  type Semana,
  type Situacao,
} from "@/lib/domain/agenda";
import { diaLocal } from "@/lib/domain/fuso";
import { createClient } from "@/lib/supabase/server";

const CAMPOS = "id, student_id, trainer_id, starts_at, duration_minutes, status, notes";

export type SessaoAgendada = {
  id: string;
  alunoId: string;
  alunoNome: string;
  inicio: string;
  duracaoMin: number;
  situacao: Situacao;
  observacao: string | null;
  /** O dia de calendário no fuso do produto — é por ele que a tela agrupa. */
  dia: string;
  /**
   * Minutos desde a meia-noite daquele dia, no relógio de quem treina.
   *
   * Vai pronto para o cliente porque é ele que avisa de conflito enquanto o
   * personal digita — e `new Date("…T18:00")` no navegador usa o fuso **do
   * navegador**, que não é necessariamente o do produto.
   */
  minutoDoDia: number;
};

/**
 * A semana da agenda do personal (doc 06 §7).
 *
 * Duas consultas fixas — sessões e nomes — e o agrupamento em memória. Uma
 * consulta de nome por sessão seria N+1 numa tela que cresce com a carteira.
 *
 * A faixa vem de `faixaDaSemana`, que converte o dia de calendário em instante
 * **no fuso do produto**: filtrar por `"2026-09-14"` solto mandaria meia-noite
 * UTC ao banco, que em São Paulo ainda é 21h de domingo — e a sessão de domingo
 * à noite apareceria na semana errada.
 */
export async function lerSemanaDaAgenda(
  trainerId: string,
  semana: Semana,
): Promise<SessaoAgendada[]> {
  const supabase = await createClient();
  const faixa = faixaDaSemana(semana);

  const { data, error } = await supabase
    .from("appointments")
    .select(CAMPOS)
    .eq("trainer_id", trainerId)
    .gte("starts_at", faixa.de)
    .lt("starts_at", faixa.ate)
    .order("starts_at");

  if (error) throw error;
  return comNomes(data ?? []);
}

/**
 * As sessões passadas que continuam "agendada" — a presença que ninguém marcou.
 *
 * Consulta própria, e não a semana filtrada: a que ficou para trás costuma ser
 * de **outra** semana, e é justamente a que some da tela sem esta busca. Sem
 * ela, o personal só reencontraria a falta navegando para trás no calendário,
 * que é o que ninguém faz.
 */
export async function lerSessoesSemMarcacao(
  trainerId: string,
  agora: Date = new Date(),
): Promise<SessaoAgendada[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(CAMPOS)
    .eq("trainer_id", trainerId)
    .eq("status", "agendada")
    // Meia hora de folga: a sessão que começou agora não é uma falta.
    .lt("starts_at", new Date(agora.getTime() - 30 * 60_000).toISOString())
    .order("starts_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  return comNomes(data ?? []);
}

/**
 * A próxima sessão de um aluno, para a home dele.
 *
 * Sem `trainer_id` no filtro: quem chama é o app do aluno, e o RLS já devolve
 * a ele só as próprias sessões. Cancelada não conta — é o sentido de cancelar.
 */
export async function proximaSessaoDoAluno(
  alunoId: string,
  agora: Date = new Date(),
): Promise<SessaoAgendada | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(CAMPOS)
    .eq("student_id", alunoId)
    .in("status", ["agendada"])
    .gte("starts_at", agora.toISOString())
    .order("starts_at")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [sessao] = await comNomes([data]);
  return sessao ?? null;
}

/** As sessões de um aluno, para a ficha dele no painel. */
export async function lerSessoesDoAluno(
  trainerId: string,
  alunoId: string,
): Promise<SessaoAgendada[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(CAMPOS)
    .eq("trainer_id", trainerId)
    .eq("student_id", alunoId)
    .order("starts_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return comNomes(data ?? []);
}

/* ----------------------------------------------------------- interno ----- */

type Linha = {
  id: string;
  student_id: string;
  starts_at: string;
  duration_minutes: number;
  status: Situacao;
  notes: string | null;
};

async function comNomes(linhas: Linha[]): Promise<SessaoAgendada[]> {
  if (!linhas.length) return [];

  const supabase = await createClient();
  const { data: alunos, error } = await supabase
    .from("students")
    .select("id, name")
    .in("id", [...new Set(linhas.map((l) => l.student_id))]);

  if (error) throw error;
  const nomePor = new Map((alunos ?? []).map((a) => [a.id, a.name]));

  return linhas.map((l) => ({
    id: l.id,
    alunoId: l.student_id,
    // O aluno lendo a própria sessão enxerga a própria linha em `students`;
    // o personal enxerga a carteira. Os dois casos caem aqui.
    alunoNome: nomePor.get(l.student_id) ?? "Aluno",
    inicio: l.starts_at,
    duracaoMin: l.duration_minutes,
    situacao: l.status,
    observacao: l.notes,
    dia: diaLocal(l.starts_at),
    minutoDoDia: minutoDoDiaDoInstante(l.starts_at),
  }));
}
