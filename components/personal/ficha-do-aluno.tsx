import Link from "next/link";

import { EvolucaoDoAluno } from "@/components/personal/evolucao-do-aluno";
import { Badge, Card } from "@/components/ui";
import {
  duracaoCurta,
  formatarNumero,
  rotuloDoDia,
} from "@/lib/domain/historico";
import { semanaAtual } from "@/lib/domain/treino";
import type { AlunoDaFicha } from "@/lib/queries/alunos";
import type { SessaoDoHistorico } from "@/lib/queries/historico";
import { LIMITE_DO_HISTORICO } from "@/lib/queries/historico";
import type { Macrotreino } from "@/lib/queries/macrotreinos";
import type { ExercicioComProgresso } from "@/lib/queries/progresso";
import { NIVEL, OBJETIVO, STATUS_DO_ALUNO } from "@/lib/rotulos";

export type FichaDoAlunoProps = {
  aluno: AlunoDaFicha;
  programa: Macrotreino | null;
  sessoes: SessaoDoHistorico[];
  exercicios: ExercicioComProgresso[];
};

/**
 * A ficha do aluno no painel (doc 06). Sem nenhum acesso a banco, como as
 * outras telas — é o que permite conferir no navegador com props fixas.
 *
 * Densidade é bem-vinda aqui: o personal está sentado no computador, querendo
 * ver tudo de uma vez. É o oposto do app do aluno.
 */
export function FichaDoAluno({
  aluno,
  programa,
  sessoes,
  exercicios,
}: FichaDoAlunoProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link
          href="/painel"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Alunos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
              {aluno.name}
            </h1>
            <p className="text-[13.5px] text-ink-3">
              {[
                aluno.goal ? OBJETIVO[aluno.goal] : null,
                aluno.experience_level ? NIVEL[aluno.experience_level] : null,
                aluno.email,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Badge tone={aluno.status === "ativo" ? "sucesso" : "neutro"}>
            {STATUS_DO_ALUNO[aluno.status]}
          </Badge>
        </div>
      </header>

      <ProgramaAtivo programa={programa} nome={aluno.name} />

      <section className="space-y-3">
        <h2 className="eyebrow text-ink-4">Evolução por exercício</h2>
        <Card size="lg">
          <EvolucaoDoAluno exercicios={exercicios} />
        </Card>
      </section>

      <Historico sessoes={sessoes} alunoId={aluno.id} nome={aluno.name} />
    </div>
  );
}

/**
 * Nada de "dele"/"dela" nos textos: `students` não tem campo de gênero, e o
 * pronome errado sai na tela do personal falando do próprio aluno. Foi o mesmo
 * defeito no M2-01, na frase de arquivamento.
 */
function ProgramaAtivo({
  programa,
  nome,
}: {
  programa: Macrotreino | null;
  nome: string;
}) {
  if (!programa) {
    return (
      <section className="space-y-3">
        <h2 className="eyebrow text-ink-4">Programa</h2>
        <Card size="lg" className="max-w-xl space-y-2">
          <p className="text-[15px] font-bold text-ink">
            {primeiroNome(nome)} está sem programa ativo
          </p>
          <p className="text-[13.5px] leading-[1.6] text-ink-3">
            Sem programa, o app não mostra treino nenhum. O histórico continua
            guardado.
          </p>
          <Link
            href="/painel/macrotreinos"
            className="inline-block text-[13px] font-semibold text-brand transition hover:text-brand-hover"
          >
            Montar um programa →
          </Link>
        </Card>
      </section>
    );
  }

  // A semana sai da mesma função que o app do aluno usa: dois cálculos do
  // mesmo número divergem na tela, e aqui os dois lados leem a mesma coisa.
  const semana = semanaAtual(programa.started_at, programa.total_weeks);
  const fracao = semana / programa.total_weeks;

  return (
    <section className="space-y-3">
      <h2 className="eyebrow text-ink-4">Programa ativo</h2>
      <Card size="lg" className="max-w-xl space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">
            {programa.name}
          </h3>
          <p className="font-mono text-[11px] font-semibold tracking-[0.06em] text-ink-4 uppercase">
            Semana {semana} de {programa.total_weeks}
          </p>
        </div>

        <div
          role="progressbar"
          aria-label="Semanas do programa"
          aria-valuemin={0}
          aria-valuemax={programa.total_weeks}
          aria-valuenow={semana}
          className="h-1.5 overflow-hidden rounded-full bg-canvas-sunken"
        >
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${Math.round(fracao * 100)}%` }}
          />
        </div>

        <p className="text-[13px] text-ink-4">
          {programa.total_treinos === 1
            ? "1 treino no programa"
            : `${programa.total_treinos} treinos no programa`}
        </p>
      </Card>
    </section>
  );
}

function Historico({
  sessoes,
  alunoId,
  nome,
}: {
  sessoes: SessaoDoHistorico[];
  alunoId: string;
  nome: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="eyebrow text-ink-4">
        Histórico{sessoes.length ? ` · ${sessoes.length}` : ""}
      </h2>

      {sessoes.length === 0 ? (
        <Card size="lg" className="max-w-xl space-y-2">
          <p className="text-[15px] font-bold text-ink">
            {primeiroNome(nome)} ainda não treinou
          </p>
          <p className="text-[13.5px] leading-[1.6] text-ink-3">
            No primeiro treino concluído, cada sessão passa a aparecer aqui com
            carga e repetições série a série.
          </p>
        </Card>
      ) : (
        <>
          <ul className="space-y-2">
            {sessoes.map((sessao) => (
              <li key={sessao.id}>
                <Link
                  href={`/painel/alunos/${alunoId}/sessoes/${sessao.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 transition hover:border-border-strong"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">
                      {sessao.treino
                        ? `Treino ${sessao.treino.label} · ${sessao.treino.name}`
                        : "Treino removido"}
                    </p>
                    <p className="truncate text-[12.5px] text-ink-4 first-letter:uppercase">
                      {rotuloDoDia(sessao.finished_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-baseline gap-4 font-mono text-[11px] tracking-[0.04em] text-ink-4 uppercase tabular-nums">
                    <span>{duracaoCurta(sessao.duration_seconds)}</span>
                    <span>
                      {sessao.series_prescritas > 0
                        ? `${sessao.series_feitas}/${sessao.series_prescritas}`
                        : sessao.series_feitas}{" "}
                      séries
                    </span>
                    <span>{formatarNumero(sessao.volume_kg)} kg</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Corte silencioso faria o personal achar que o aluno treinou menos. */}
          {sessoes.length >= LIMITE_DO_HISTORICO ? (
            <p className="text-[12px] text-ink-5">
              Mostrando as {LIMITE_DO_HISTORICO} sessões mais recentes.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
