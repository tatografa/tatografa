import "server-only";

import { rotuloDoDia } from "@/lib/domain/historico";
import {
  COLUNA_DA_FOTO,
  REGIOES,
  ROTULO_DA_REGIAO,
  SLOTS,
  compara,
  type Comparacao,
  type Regiao,
  type Slot,
} from "@/lib/domain/reavaliacao";
import { createClient } from "@/lib/supabase/server";

/** Validade da URL assinada da foto. Mesma escala do feed. */
const MINUTOS_DA_URL = 60;

/** Quantas reavaliações a tela do personal carrega. */
export const LIMITE_DA_CARTEIRA = 60;

const CAMPOS =
  "id, student_id, trainer_id, released_at, submitted_at, weight_kg, body_fat_pct, notes, photo_front_path, photo_side_path, photo_back_path";

export type Reavaliacao = {
  id: string;
  alunoId: string;
  liberadaEm: string;
  rotuloDaLiberacao: string;
  enviadaEm: string | null;
  rotuloDoEnvio: string | null;
  peso: number | null;
  gordura: number | null;
  observacao: string | null;
  medidas: Partial<Record<Regiao, number>>;
  /** Nulo quando não há foto naquele ângulo, ou quando a URL não foi pedida. */
  fotos: Record<Slot, string | null>;
};

/** As fotos são caras de assinar; só quem vai mostrá-las pede. */
type Opcoes = { comFotos?: boolean };

/* ----------------------------------------------------------- o aluno ----- */

export type ReavaliacaoDoAluno = {
  /** A que está esperando resposta. Nula quando o personal não liberou nada. */
  aberta: Reavaliacao | null;
  /** As respondidas, da mais recente para a mais antiga. */
  enviadas: Reavaliacao[];
};

/**
 * O que a tela `/app/reavaliacao` mostra.
 *
 * Duas consultas fixas — reavaliações e medidas de todas elas — e o
 * agrupamento em memória. Uma consulta de medidas por reavaliação seria N+1
 * numa tela que cresce a cada ciclo.
 *
 * O filtro por `student_id` está aqui mesmo com o RLS cobrindo: a consulta não
 * deve depender só da policy para saber de quem é o dado.
 */
export async function lerReavaliacoesDoAluno(
  alunoId: string,
  opcoes: Opcoes = {},
): Promise<ReavaliacaoDoAluno> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(CAMPOS)
    .eq("student_id", alunoId)
    .order("released_at", { ascending: false });

  if (error) throw error;

  const linhas = data ?? [];
  const montadas = await monta(linhas, opcoes);

  return {
    aberta: montadas.find((r) => r.enviadaEm === null) ?? null,
    enviadas: montadas.filter((r) => r.enviadaEm !== null),
  };
}

/**
 * Existe reavaliação esperando resposta?
 *
 * Consulta própria, e não `lerReavaliacoesDoAluno` filtrada: a home abre na
 * academia, com internet ruim, e só precisa de um booleano para decidir se
 * mostra o card. Trazer o histórico inteiro com as medidas de todo ciclo para
 * responder "sim" seria caro na tela que menos pode ser lenta.
 */
export async function temReavaliacaoAberta(alunoId: string): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("assessments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", alunoId)
    .is("submitted_at", null);

  if (error) throw error;
  return (count ?? 0) > 0;
}

/* -------------------------------------------------------- o personal ----- */

export type ReavaliacaoNaCarteira = Reavaliacao & {
  aluno: { id: string; nome: string };
  pendente: boolean;
};

/**
 * A fila de trabalho do personal (doc 06 §9).
 *
 * Pendentes primeiro, e dentro de cada grupo a mais recente no topo: a lista
 * serve para ele saber **de quem ainda está esperando**, que é a pergunta que o
 * traz aqui. A ordenação é feita em memória porque "pendente" é
 * `submitted_at is null`, e ordenar por isso no Postgres com `nulls first`
 * depende de uma direção que muda junto com a da data.
 */
export async function lerReavaliacoesDaCarteira(
  trainerId: string,
  opcoes: Opcoes = {},
): Promise<ReavaliacaoNaCarteira[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(CAMPOS)
    .eq("trainer_id", trainerId)
    .order("released_at", { ascending: false })
    .limit(LIMITE_DA_CARTEIRA);

  if (error) throw error;

  const linhas = data ?? [];
  if (!linhas.length) return [];

  // `students_select` já devolve ao personal a carteira inteira, então aqui é
  // consulta direta — ao contrário do feed do aluno, que precisa da RPC estreita.
  const { data: alunos, error: erroAlunos } = await supabase
    .from("students")
    .select("id, name")
    .in("id", [...new Set(linhas.map((l) => l.student_id))]);

  if (erroAlunos) throw erroAlunos;

  const nomePor = new Map((alunos ?? []).map((a) => [a.id, a.name]));
  const montadas = await monta(linhas, opcoes);

  return montadas
    .map((r) => ({
      ...r,
      aluno: { id: r.alunoId, nome: nomePor.get(r.alunoId) ?? "Aluno" },
      pendente: r.enviadaEm === null,
    }))
    .sort((a, b) => {
      if (a.pendente !== b.pendente) return a.pendente ? -1 : 1;
      return b.liberadaEm.localeCompare(a.liberadaEm);
    });
}

/**
 * As reavaliações de um aluno, do ponto de vista do personal.
 *
 * Mesma consulta da tela do aluno, sem o filtro por `auth.uid()`: o RLS já
 * devolve ao personal as linhas dos alunos dele, e o filtro por `student_id` é
 * o que garante que a rota `/painel/reavaliacoes/<id>` mostra o aluno da URL e
 * não outro da carteira. Rota aninhada: o id do pai é afirmação da URL.
 */
export async function lerReavaliacoesDeUmAluno(
  trainerId: string,
  alunoId: string,
  opcoes: Opcoes = {},
): Promise<Reavaliacao[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(CAMPOS)
    .eq("trainer_id", trainerId)
    .eq("student_id", alunoId)
    .order("released_at", { ascending: false });

  if (error) throw error;
  return monta(data ?? [], opcoes);
}

/* ---------------------------------------------------------- comparar ----- */

/**
 * A comparação "anterior → atual" de duas reavaliações (doc 05 §12).
 *
 * `anterior` nula é o caso da primeira: a tela mostra os valores sem seta, e a
 * linha continua existindo — esconder a medida porque não há com o que comparar
 * apagaria justamente o dado que vai servir de base na próxima.
 */
export function comparar(atual: Reavaliacao, anterior: Reavaliacao | null): Comparacao[] {
  return [
    compara("Peso", "kg", anterior?.peso, atual.peso),
    compara("Gordura", "%", anterior?.gordura, atual.gordura),
    ...REGIOES.map((r) =>
      compara(ROTULO_DA_REGIAO[r], "cm", anterior?.medidas[r], atual.medidas[r]),
    ),
  ];
}

/* ----------------------------------------------------------- interno ----- */

type Linha = {
  id: string;
  student_id: string;
  released_at: string;
  submitted_at: string | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  notes: string | null;
  photo_front_path: string | null;
  photo_side_path: string | null;
  photo_back_path: string | null;
};

async function monta(linhas: Linha[], { comFotos }: Opcoes): Promise<Reavaliacao[]> {
  if (!linhas.length) return [];

  const supabase = await createClient();
  const ids = linhas.map((l) => l.id);

  const caminhos = comFotos
    ? linhas.flatMap((l) =>
        SLOTS.map((s) => l[COLUNA_DA_FOTO[s]]).filter((c) => c !== null),
      )
    : [];

  const [medidas, urls] = await Promise.all([
    supabase
      .from("student_measurements")
      .select("assessment_id, region, value_cm")
      .in("assessment_id", ids),
    caminhos.length
      ? supabase.storage
          .from("reavaliacoes")
          .createSignedUrls(caminhos, MINUTOS_DA_URL * 60)
      : Promise.resolve({ data: [] as { path: string | null; signedUrl: string }[] }),
  ]);

  if (medidas.error) throw medidas.error;

  const porReavaliacao = new Map<string, Partial<Record<Regiao, number>>>();
  for (const m of medidas.data ?? []) {
    const atual = porReavaliacao.get(m.assessment_id) ?? {};
    atual[m.region] = m.value_cm;
    porReavaliacao.set(m.assessment_id, atual);
  }

  const urlPor = new Map(
    (urls.data ?? []).filter((u) => u.path).map((u) => [u.path as string, u.signedUrl]),
  );

  return linhas.map((l) => ({
    id: l.id,
    alunoId: l.student_id,
    liberadaEm: l.released_at,
    rotuloDaLiberacao: rotuloDoDia(l.released_at),
    enviadaEm: l.submitted_at,
    rotuloDoEnvio: l.submitted_at ? rotuloDoDia(l.submitted_at) : null,
    peso: l.weight_kg,
    gordura: l.body_fat_pct,
    observacao: l.notes,
    medidas: porReavaliacao.get(l.id) ?? {},
    fotos: Object.fromEntries(
      SLOTS.map((s) => {
        const caminho = l[COLUNA_DA_FOTO[s]];
        return [s, caminho ? (urlPor.get(caminho) ?? null) : null];
      }),
    ) as Record<Slot, string | null>,
  }));
}
