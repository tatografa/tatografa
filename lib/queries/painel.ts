import "server-only";

import {
  aderenciaDoAluno,
  aderenciaMedia,
  alunosQuePrecisamDeAtencao,
  semanaDoCalendario,
  type Alerta,
} from "@/lib/domain/atencao";
import { createClient } from "@/lib/supabase/server";

import { listarAlunos, type AlunoDaLista } from "./alunos";
import { listarProgramasPorAluno } from "./macrotreinos";

/** Uma linha do bloco "precisam de atenção", já com o nome resolvido. */
export type AlunoEmAlerta = Alerta & { nome: string };

export type IndicadoresDoPainel = {
  alunosAtivos: number;
  /** Sessões concluídas por toda a carteira na semana de calendário. */
  treinosNaSemana: number;
  /** Média da carteira, 0 a 1. Nulo = ninguém com programa para medir. */
  aderenciaMedia: number | null;
};

export type ResumoDaCarteira = {
  alunos: AlunoDaLista[];
  alertas: AlunoEmAlerta[];
  indicadores: IndicadoresDoPainel;
};

/**
 * Tudo o que o dashboard do personal mostra, numa leitura só.
 *
 * Três consultas em lote — alunos, programas e sessões da semana —, nunca uma
 * por aluno. É o mesmo hábito de `listarAlunos`: com 50 alunos o N+1 não doeria,
 * mas a dor chega junto com o crescimento e aí já está espalhada.
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
  diasParaAlerta: number,
): Promise<ResumoDaCarteira> {
  const supabase = await createClient();
  const semana = semanaDoCalendario();

  const [alunos, programas, sessoes] = await Promise.all([
    listarAlunos(),
    listarProgramasPorAluno(),
    supabase.rpc("sessoes_na_semana", { p_de: semana.de, p_ate: semana.ate }),
  ]);

  if (sessoes.error) throw sessoes.error;

  const nomes = new Map(alunos.map((aluno) => [aluno.id, aluno.name]));

  const alertas: AlunoEmAlerta[] = alunosQuePrecisamDeAtencao(
    alunos,
    diasParaAlerta,
  ).map((alerta) => ({
    ...alerta,
    // A fk garante que o aluno existe; o `??` é só para o tipo.
    nome: nomes.get(alerta.id) ?? "Aluno",
  }));

  const sessoesPorAluno = new Map(
    (sessoes.data ?? []).map((linha) => [linha.student_id, linha.total]),
  );

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
    },
  };
}
