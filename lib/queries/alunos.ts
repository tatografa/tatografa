import "server-only";

import { pareceUuid } from "@/lib/domain/id";
import { sequenciaDeDias } from "@/lib/domain/sequencia";
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
 * A última sessão sai de `ultima_sessao_por_aluno` (migration 0016), que devolve
 * **uma linha por aluno**, agregada no banco.
 *
 * Antes esta função varria todas as sessões concluídas da carteira ordenadas
 * por data e ficava com a primeira de cada aluno. Funcionava até o corte de
 * página silencioso do PostgREST — passando do teto, as sessões mais antigas
 * sumiam e o aluno que treinou há três meses voltava como "nunca treinou". No
 * M1 isso era um rótulo errado; com o M2-07 o mesmo dado virou alerta, e o
 * aluno que treina toda semana apareceria em "precisam de atenção" com o motivo
 * errado. Achado da revisão consolidada do M2.
 */
export async function listarAlunos(): Promise<AlunoDaLista[]> {
  const supabase = await createClient();

  const [alunos, sessoes] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, email, goal, status, created_at, onboarded_at")
      .order("created_at", { ascending: false }),
    supabase.rpc("ultima_sessao_por_aluno"),
  ]);

  if (alunos.error) throw alunos.error;
  // Erro não vira "ninguém treinou": a lista diria que a carteira inteira está
  // parada, e o painel abriria com todo mundo em "precisam de atenção".
  if (sessoes.error) throw sessoes.error;
  if (!alunos.data?.length) return [];

  const ultima = new Map(
    (sessoes.data ?? []).map((linha) => [linha.student_id, linha.finished_at]),
  );

  return alunos.data.map((aluno) => ({
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
  // Peso e altura entram porque o personal monta o treino a partir deles, e a
  // ficha era o único lugar onde ele iria procurar — e não mostrava nenhum dos
  // dois. Achado no teste de campo: o roteiro afirmava que o peso novo
  // aparecia aqui, e a tela nunca mostrou peso.
  | "weight_kg"
  | "height_cm"
  // Os cinco de 18/09. `birth_date` já existia no schema e nenhuma tela do
  // painel lia: a idade importa para montar treino e a ficha não dizia.
  | "birth_date"
  | "phone"
  | "city"
  | "state"
  | "biological_profile"
  | "weight_goal_kg"
>;

/** Os dois números do topo da ficha (doc 06 §4). */
export type ResumoDoAluno = { sessoesTotais: number; diasSeguidos: number };

/**
 * Quantas sessões o aluno já concluiu e há quantos dias seguidos ele treina.
 *
 * As duas contas são **agregadas no banco**: `head: true` para a contagem e
 * `dias_de_treino` (migration 0013) para os dias distintos. `listarHistorico`
 * não serve para nenhuma das duas — ela tem teto de 50 sessões, e o total
 * pararia em "50" para sempre no aluno que mais treina, que é justamente aquele
 * de quem o personal quer saber o número.
 *
 * A sequência sai de `sequenciaDeDias`, a **mesma** função que desenha o
 * "🔥 5 dias seguidos" na home do aluno. Duas contas para a mesma corrente
 * fariam o personal e o aluno verem números diferentes da mesma coisa.
 */
export async function resumoDoAluno(alunoId: string): Promise<ResumoDoAluno> {
  const supabase = await createClient();

  const [sessoes, dias] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("student_id", alunoId)
      .not("finished_at", "is", null),
    supabase.rpc("dias_de_treino", { p_student_id: alunoId }),
  ]);

  if (sessoes.error) throw sessoes.error;
  if (dias.error) throw dias.error;

  return {
    sessoesTotais: sessoes.count ?? 0,
    diasSeguidos: sequenciaDeDias((dias.data ?? []).map((linha) => linha.dia)),
  };
}

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
      "id, name, email, goal, experience_level, status, created_at, onboarded_at, weight_kg, height_cm, birth_date, phone, city, state, biological_profile, weight_goal_kg",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Quantos alunos o personal tem — o marcador ao lado de "Alunos" na sidebar.
 *
 * Contagem agregada no banco (`head: true`), não `listarAlunos().length`:
 * aquela função faz duas consultas e traz a carteira inteira com a data da
 * última sessão de cada um. Isto roda no **layout**, ou seja, em toda
 * navegação do painel — seria pagar a leitura mais cara do produto pela
 * informação mais barata dele. Mesmo raciocínio de
 * `contarReavaliacoesPendentes`.
 */
export async function contarAlunos(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}
