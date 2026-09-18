import "server-only";

import {
  aderenciaDoAluno,
  aderenciaMedia,
  alunosQuePrecisamDeAtencao,
  diasSemTreinar,
  semanaDoCalendario,
  type Alerta,
} from "@/lib/domain/atencao";
import {
  desdeQuandoProgredir,
  janelaDaAtividade,
  LIMITE_DAS_PROGRESSOES,
  MESES_DO_CRESCIMENTO,
  type DiaDaAtividade,
  type PontoDoMes,
  type Progressao,
} from "@/lib/domain/dashboard";
import { contarFeitas, rotuloDoDia } from "@/lib/domain/historico";
import { volumeDaSessao } from "@/lib/domain/treino";
import { createClient } from "@/lib/supabase/server";

import { listarAlunos, type AlunoDaLista } from "./alunos";
import { seriesDasSessoes, type SerieComSessao } from "./historico";
import { listarProgramasPorAluno, type Macrotreino } from "./macrotreinos";
import { contarReavaliacoesPendentes } from "./reavaliacao";

/** Uma linha do bloco "precisam de atenção", já com o nome resolvido. */
export type AlunoEmAlerta = Alerta & { nome: string };

export type IndicadoresDoPainel = {
  alunosAtivos: number;
  /** Sessões concluídas por toda a carteira na semana de calendário. */
  treinosNaSemana: number;
  /** Média da carteira, 0 a 1. Nulo = ninguém com programa para medir. */
  aderenciaMedia: number | null;
  /** Liberadas e ainda não respondidas — a fila de `/painel/reavaliacoes`. */
  reavaliacoesPendentes: number;
};

/** Uma linha de "Atividade recente" (doc 06 §2). */
export type SessaoRecente = {
  id: string;
  aluno: { id: string; nome: string };
  /** Nulo se o personal apagou o treino depois — a sessão continua valendo. */
  treino: { label: string; name: string } | null;
  finished_at: string;
  /** "Hoje", "Ontem" ou "seg, 2 de set" — formatado no fuso do produto. */
  rotuloDoDia: string;
  duration_seconds: number | null;
  series_feitas: number;
  volume_kg: number;
};

export type ResumoDaCarteira = {
  alunos: AlunoDaLista[];
  alertas: AlunoEmAlerta[];
  indicadores: IndicadoresDoPainel;
  atividade: SessaoRecente[];
};

/** Quantas sessões o bloco de atividade recente mostra. */
export const LIMITE_DA_ATIVIDADE = 8;

/**
 * Tudo o que o dashboard do personal mostra, numa leitura só.
 *
 * Consultas em lote — alunos, programas, sessões da semana, pendentes e
 * atividade —, nunca uma por aluno. É o mesmo hábito de `listarAlunos`: com 50
 * alunos o N+1 não doeria, mas a dor chega junto com o crescimento e aí já está
 * espalhada.
 *
 * As contagens são agregadas **no banco** (`sessoes_na_semana`, migration 0015,
 * e o `workouts(count)` de `listarProgramasPorAluno`). Contar em memória aqui
 * esbarraria no corte de página silencioso do PostgREST — e o sintoma seria
 * uma aderência menor do que a real, na tela que o personal usa para decidir
 * com quem falar.
 *
 * `diasParaAlerta` vem da linha do personal (`trainers.dias_para_alerta`) e
 * não daqui: é ajuste dele, não constante do produto.
 */
export async function lerResumoDaCarteira(
  trainerId: string,
  diasParaAlerta: number,
): Promise<ResumoDaCarteira> {
  const semana = semanaDoCalendario();

  // Os alunos vêm antes do resto, e não junto, porque a atividade recente
  // precisa dos ids para filtrar por aluno em vez de confiar só no RLS.
  const alunos = await listarAlunos();

  const [programas, sessoesPorAluno, pendentes, atividade] = await Promise.all([
    listarProgramasPorAluno(),
    sessoesNaSemanaPorAluno(semana.de, semana.ate),
    contarReavaliacoesPendentes(trainerId),
    lerAtividadeRecente(alunos.map((aluno) => aluno.id)),
  ]);

  const nomes = new Map(alunos.map((aluno) => [aluno.id, aluno.name]));

  const alertas: AlunoEmAlerta[] = alunosQuePrecisamDeAtencao(
    alunos,
    diasParaAlerta,
  ).map((alerta) => ({
    ...alerta,
    // A fk garante que o aluno existe; o `??` é só para o tipo.
    nome: nomes.get(alerta.id) ?? "Aluno",
  }));

  const treinosPrescritos = new Map(
    programas.map((p) => [p.aluno.id, p.ativo?.total_treinos ?? 0]),
  );

  // Só quem está ativo entra na média: aluno convidado que nunca abriu o app e
  // aluno arquivado puxariam a aderência para baixo por não estarem treinando —
  // o que é verdade e não é problema do personal.
  const ativos = alunos.filter((aluno) => aluno.status === "ativo");

  return {
    alunos,
    alertas,
    atividade,
    indicadores: {
      alunosAtivos: ativos.length,
      treinosNaSemana: [...sessoesPorAluno.values()].reduce(
        (total, n) => total + n,
        0,
      ),
      aderenciaMedia: aderenciaMedia(
        ativos.map((aluno) =>
          aderenciaDoAluno(
            sessoesPorAluno.get(aluno.id) ?? 0,
            treinosPrescritos.get(aluno.id) ?? 0,
          ),
        ),
      ),
      reavaliacoesPendentes: pendentes,
    },
  };
}

/** Uma linha da tabela de `/painel/alunos` (doc 06 §3). */
export type AlunoNaTabela = AlunoDaLista & {
  /** O programa que ele está seguindo. Nulo = está sem treino. */
  programa: Macrotreino | null;
  /** Aderência da semana, 0 a 1. Nula = sem programa com treino para medir. */
  aderencia: number | null;
  /**
   * Dias de calendário desde a última sessão. Nulo = nunca treinou, que não é
   * "há 0 dias" nem um número grande qualquer — é outra coisa, e a coluna diz
   * outra coisa.
   *
   * Contado **aqui**, e não na tabela: `diasSemTreinar` conta no fuso do
   * produto, e a tabela é componente cliente. No navegador a mesma conta usaria
   * o fuso do aparelho e o relógio dele, o que daria um número diferente do que
   * o bloco "precisam de atenção" mostra na tela ao lado — e ainda arriscaria
   * divergir entre o render do servidor e o da hidratação, virando "Ontem" no
   * primeiro quadro e "Há 2 dias" no seguinte.
   */
  dias_sem_treinar: number | null;
};

/**
 * A carteira inteira como a tabela de alunos mostra.
 *
 * As mesmas três leituras em lote do dashboard, com o resultado **por aluno**
 * em vez de agregado. A aderência sai de `aderenciaDoAluno`, a mesma função
 * que alimenta a média do topo: duas contas diferentes para o mesmo número
 * fariam a tabela discordar do indicador, e ninguém saberia qual acreditar.
 *
 * Busca e filtro por status não estão aqui: eles são `filtrarAlunos`
 * (`lib/domain/carteira.ts`), aplicados na tela. O motivo está no doc daquele
 * módulo — a lista já veio inteira, e uma ida ao banco por tecla digitada
 * seria trabalho para reduzir o que já está na memória.
 */
export async function lerAlunosDaCarteira(): Promise<AlunoNaTabela[]> {
  const semana = semanaDoCalendario();

  const [alunos, programas, sessoesPorAluno] = await Promise.all([
    listarAlunos(),
    listarProgramasPorAluno(),
    sessoesNaSemanaPorAluno(semana.de, semana.ate),
  ]);

  const programaPor = new Map(programas.map((p) => [p.aluno.id, p.ativo]));

  return alunos.map((aluno) => {
    const programa = programaPor.get(aluno.id) ?? null;
    return {
      ...aluno,
      programa,
      aderencia: aderenciaDoAluno(
        sessoesPorAluno.get(aluno.id) ?? 0,
        programa?.total_treinos ?? 0,
      ),
      dias_sem_treinar: diasSemTreinar(aluno.ultima_sessao),
    };
  });
}

/**
 * As últimas sessões concluídas da carteira — "Atividade recente" do doc 06 §2.
 *
 * Quatro consultas fixas — sessões, alunos, treinos e séries —, nunca uma por
 * sessão.
 *
 * Recebe os ids em vez de varrer a tabela: o RLS de `workout_sessions` já
 * restringe à carteira, mas a consulta não deve depender só da policy para
 * saber de quem é o dado — é a mesma precaução de `listarHistorico`, e nesta
 * tela ela pesa mais, porque aqui a leitura atravessa a carteira inteira e não
 * um aluno só. Sem o filtro, uma policy afrouxada num `alter` futuro viraria
 * silenciosamente "as últimas sessões do banco" no painel de todo mundo.
 *
 * Sessão em andamento fica de fora (`finished_at is null`): listá-la mostraria
 * o treino de agora como concluído, com duração vazia. Mesma regra de
 * `listarHistorico`.
 *
 * O rótulo do dia é montado **no servidor**, com o fuso fixo do produto, pelo
 * mesmo motivo do histórico do aluno: formatar no cliente deixaria a data — que
 * é o que identifica a linha — vazia até a hidratação.
 */
export async function lerAtividadeRecente(
  alunoIds: string[],
): Promise<SessaoRecente[]> {
  if (!alunoIds.length) return [];

  const supabase = await createClient();

  const { data: sessoes, error } = await supabase
    .from("workout_sessions")
    .select("id, student_id, workout_id, finished_at, duration_seconds")
    .in("student_id", alunoIds)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(LIMITE_DA_ATIVIDADE);

  if (error) throw error;
  if (!sessoes?.length) return [];

  const [alunos, treinos, series] = await Promise.all([
    supabase
      .from("students")
      .select("id, name")
      .in("id", [...new Set(sessoes.map((s) => s.student_id))]),
    supabase
      .from("workouts")
      .select("id, label, name")
      .in("id", [...new Set(sessoes.map((s) => s.workout_id))]),
    seriesDasSessoes(sessoes.map((s) => s.id)),
  ]);

  if (alunos.error) throw alunos.error;
  if (treinos.error) throw treinos.error;

  const nomePor = new Map((alunos.data ?? []).map((a) => [a.id, a.name]));
  const treinoPor = new Map((treinos.data ?? []).map((t) => [t.id, t]));

  const seriesPorSessao = new Map<string, SerieComSessao[]>();
  for (const serie of series) {
    const lista = seriesPorSessao.get(serie.session_id) ?? [];
    lista.push(serie);
    seriesPorSessao.set(serie.session_id, lista);
  }

  return sessoes.flatMap((sessao) => {
    // O tipo do cliente admite nulo em `finished_at`; o filtro já garantiu que
    // não é. Descartar em vez de mentir uma data mantém o contrato do tipo.
    if (!sessao.finished_at) return [];
    const daSessao = seriesPorSessao.get(sessao.id) ?? [];
    const treino = treinoPor.get(sessao.workout_id);

    return [
      {
        id: sessao.id,
        aluno: {
          id: sessao.student_id,
          nome: nomePor.get(sessao.student_id) ?? "Aluno",
        },
        treino: treino ? { label: treino.label, name: treino.name } : null,
        finished_at: sessao.finished_at,
        rotuloDoDia: rotuloDoDia(sessao.finished_at),
        duration_seconds: sessao.duration_seconds,
        series_feitas: contarFeitas(daSessao),
        volume_kg: volumeDaSessao(daSessao),
      },
    ];
  });
}

/** Sessões concluídas por aluno na janela, agregadas no banco (migration 0015). */
async function sessoesNaSemanaPorAluno(
  de: string,
  ate: string,
): Promise<Map<string, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("sessoes_na_semana", {
    p_de: de,
    p_ate: ate,
  });

  if (error) throw error;
  return new Map((data ?? []).map((linha) => [linha.student_id, linha.total]));
}

/** O que os três gráficos do dashboard consomem (doc 06 §2). */
export type GraficosDoPainel = {
  crescimento: PontoDoMes[];
  atividade: DiaDaAtividade[];
  progressoes: Progressao[];
};

/**
 * Os três gráficos, em três agregações feitas **no banco** (migration 0033).
 *
 * Nenhuma delas volta linha a linha: a atividade de 30 dias e, principalmente,
 * as progressões — que varrem `session_sets` da carteira inteira — trariam
 * milhares de registros para o servidor descartar depois de somar. Pior que o
 * peso é o corte de página silencioso do PostgREST, que faria a barra desenhar
 * menos treino do que aconteceu sem nenhum erro aparecer.
 *
 * As três funções não recebem id de personal. Quem define "a carteira" é o RLS
 * — elas são `security invoker` —, pelo mesmo motivo de `sessoes_na_semana`:
 * um id vindo do cliente seria uma segunda fonte de verdade sobre de quem é o
 * dado, e as duas discordariam algum dia.
 */
export async function lerGraficosDoPainel(): Promise<GraficosDoPainel> {
  const supabase = await createClient();
  const janela = janelaDaAtividade();

  const [crescimento, atividade, progressoes] = await Promise.all([
    supabase.rpc("alunos_por_mes", { p_meses: MESES_DO_CRESCIMENTO }),
    supabase.rpc("sessoes_por_dia", { p_de: janela.de, p_ate: janela.ate }),
    supabase.rpc("progressoes_da_carteira", {
      p_desde: desdeQuandoProgredir(),
      p_limite: LIMITE_DAS_PROGRESSOES,
    }),
  ]);

  if (crescimento.error) throw crescimento.error;
  if (atividade.error) throw atividade.error;
  if (progressoes.error) throw progressoes.error;

  return {
    crescimento: (crescimento.data ?? []).map((linha) => ({
      mes: linha.mes,
      total: Number(linha.total),
    })),
    atividade: (atividade.data ?? []).map((linha) => ({
      dia: linha.dia,
      total: Number(linha.total),
    })),
    progressoes: (progressoes.data ?? []).map((linha) => ({
      studentId: linha.student_id,
      aluno: linha.aluno,
      exercicio: linha.exercicio,
      cargaInicial: Number(linha.carga_inicial),
      cargaFinal: Number(linha.carga_final),
      sessoes: Number(linha.sessoes),
    })),
  };
}
