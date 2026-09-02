import Link from "next/link";

import { classesDeBotao } from "@/components/ui";
import type { ExercicioPrescrito, TreinoCompleto } from "@/lib/queries/treinos";

/** Detalhe do treino (doc 05, tela 4). Recebe o treino pronto, sem banco. */
export function TelaDetalheDoTreino({ treino }: { treino: TreinoCompleto }) {
  return (
    <div className="space-y-4">
      <header>
        <Link
          href="/app/treinos"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Treinos
        </Link>
        <h1 className="mt-2 text-[20px] font-extrabold tracking-[-0.02em] text-ink">
          Treino {treino.label}
        </h1>
        <p className="mt-0.5 text-[12px] text-ink-4">{treino.name}</p>
      </header>

      <section
        aria-label="Resumo do treino"
        className="flex items-center rounded-card border border-border-soft bg-surface py-3"
      >
        <Metrica valor={String(treino.exercicios.length)} rotulo="Exercícios" />
        <Divisoria />
        <Metrica valor={`~${treino.duracao_min}min`} rotulo="Duração" />
        <Divisoria />
        <Metrica valor={String(treino.total_series)} rotulo="Séries" />
      </section>

      {treino.notes ? (
        <p className="rounded-card bg-canvas-sunken p-3.5 text-[13px] leading-relaxed text-ink-2">
          {treino.notes}
        </p>
      ) : null}

      <ol className="space-y-2.5">
        {treino.exercicios.map((exercicio) => (
          <li key={exercicio.id}>
            <LinhaDoExercicio exercicio={exercicio} />
          </li>
        ))}
      </ol>

      {treino.exercicios.length ? (
        <Link
          href={`/app/executar/${treino.id}`}
          className={classesDeBotao({ size: "lg", block: true })}
        >
          Começar treino
        </Link>
      ) : (
        <p className="text-center text-[13px] text-ink-3">
          Este treino ainda não tem exercícios.
        </p>
      )}
    </div>
  );
}

function LinhaDoExercicio({ exercicio }: { exercicio: ExercicioPrescrito }) {
  return (
    <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 rounded-card bg-surface px-3.5 py-3">
      {/*
        A numeração vem de `position`, que a leitura renumera de 0 sem buracos
        (handoff, item 4) — contar aqui de novo daria outro número se uma linha
        órfã tivesse sido pulada.
      */}
      <span className="font-mono text-[12px] font-bold text-ink-5">
        {exercicio.position + 1}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-ink">
          {exercicio.exercicio.name}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-4">
          {exercicio.sets} × {exercicio.reps_target} · {exercicio.rest_seconds}s
          descanso
        </p>
      </div>

      {exercicio.technique ? (
        <span className="rounded-[7px] bg-badge-neutral px-2.5 py-1.5 text-[11px] font-semibold text-ink-2">
          {exercicio.technique}
        </span>
      ) : null}
    </div>
  );
}

function Metrica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[19px] font-extrabold tracking-[-0.01em] text-ink">
        {valor}
      </p>
      <p className="eyebrow mt-1 text-[9px] text-ink-5">{rotulo}</p>
    </div>
  );
}

function Divisoria() {
  return <span aria-hidden className="h-7 w-px shrink-0 bg-border-strong" />;
}
