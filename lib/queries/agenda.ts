import "server-only";

import {
  faixaDaSemana,
  taxaDeComparecimento,
  minutoDoDiaDoInstante,
  type Semana,
  type Situacao,
} from "@/lib/domain/agenda";
import { diaLocal, diaSomandoDias } from "@/lib/domain/fuso";
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
  return lerAgendaEntre(trainerId, semana.de, semana.ate);
}

/**
 * As sessões entre dois dias de calendário, inclusive — a semana ou a grade
 * do mês. Mesma conversão de fuso de `faixaDaSemana`.
 */
export async function lerAgendaEntre(
  trainerId: string,
  deDia: string,
  ateDia: string,
): Promise<SessaoAgendada[]> {
  const supabase = await createClient();
  const faixa = faixaDaSemana({ de: deDia, ate: ateDia });

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

export type IndicadoresDaAgenda = {
  /** Sessões agendadas a partir de agora, nos próximos sete dias. */
  proximos7Dias: number;
  /** Realizadas no mês corrente. */
  realizadasNoMes: number;
  /** Realizadas sobre realizadas + faltas, no mês corrente. Nulo = nada marcado. */
  comparecimento: number | null;
};

/**
 * Os números do topo da agenda, numa consulta só: do primeiro dia do mês até
 * daqui a sete dias cobre as duas perguntas ("o que vem" e "como foi o mês").
 * A conta é em memória, sobre dia de calendário no fuso do produto.
 */
export async function lerIndicadoresDaAgenda(
  trainerId: string,
  hoje: string,
  agora: Date = new Date(),
): Promise<IndicadoresDaAgenda> {
  const supabase = await createClient();
  const inicioDoMes = `${hoje.slice(0, 7)}-01`;
  const faixa = faixaDaSemana({ de: inicioDoMes, ate: diaSomandoDias(hoje, 7) });

  const { data, error } = await supabase
    .from("appointments")
    .select("starts_at, status")
    .eq("trainer_id", trainerId)
    .gte("starts_at", faixa.de)
    .lt("starts_at", faixa.ate);

  if (error) throw error;
  const linhas = data ?? [];
  const limite = agora.getTime() + 7 * 24 * 60 * 60_000;

  const doMes = linhas.filter((l) => diaLocal(l.starts_at).slice(0, 7) === hoje.slice(0, 7));
  return {
    proximos7Dias: linhas.filter((l) => {
      const t = new Date(l.starts_at).getTime();
      return l.status === "agendada" && t >= agora.getTime() && t < limite;
    }).length,
    realizadasNoMes: doMes.filter((l) => l.status === "realizada").length,
    comparecimento: taxaDeComparecimento(doMes.map((l) => l.status)),
  };
}

/**
 * A próxima sessão agendada da carteira inteira — o cartão "Próxima sessão" da
 * agenda. Consulta própria porque ela pode estar fora da semana ou do mês que
 * a tela mostra.
 */
export async function proximaSessaoDoPersonal(
  trainerId: string,
  agora: Date = new Date(),
): Promise<SessaoAgendada | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(CAMPOS)
    .eq("trainer_id", trainerId)
    .eq("status", "agendada")
    .gte("starts_at", agora.toISOString())
    .order("starts_at")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const [sessao] = await comNomes([data]);
  return sessao ?? null;
}
