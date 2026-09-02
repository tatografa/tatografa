import Link from "next/link";

import {
  cargaDaSerie,
  dataPorExtenso,
  duracaoCurta,
  formatarNumero,
  horaDaSessao,
  type LinhaDeSerie,
} from "@/lib/domain/historico";
import type { ExercicioDoHistorico, SessaoDetalhada } from "@/lib/queries/historico";

/**
 * Detalhe de uma sessão do histórico (card M1-06). Puro, sem banco.
 *
 * A tela é do tema **claro**: o escuro é da execução, onde o aluno está de pé
 * na academia. Aqui ele está lendo.
 */
export function TelaSessaoDoHistorico({ sessao }: { sessao: SessaoDetalhada }) {
  return (
    <div className="space-y-4">
      <header>
        <Link
          href="/app/historico"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Histórico
        </Link>
        <h1 className="mt-2 text-[20px] font-extrabold tracking-[-0.02em] text-ink">
          {sessao.treino
            ? `Treino ${sessao.treino.label} · ${sessao.treino.name}`
            : "Treino removido"}
        </h1>
        <p className="mt-0.5 text-[12px] text-ink-4 first-letter:uppercase">
          {dataPorExtenso(sessao.finished_at)} · {horaDaSessao(sessao.finished_at)}
        </p>
      </header>

      <section
        aria-label="Resumo da sessão"
        className="flex items-center rounded-card border border-border-soft bg-surface py-3"
      >
        {/* `duration_seconds` é a duração real, gravada no fechamento com o
            relógio do servidor — não se recalcula a partir das séries. */}
        <Metrica valor={duracaoCurta(sessao.duration_seconds)} rotulo="Duração" />
        <Divisoria />
        <Metrica
          valor={
            sessao.series_prescritas > 0
              ? `${sessao.series_feitas}/${sessao.series_prescritas}`
              : String(sessao.series_feitas)
          }
          rotulo="Séries"
        />
        <Divisoria />
        <Metrica valor={`${formatarNumero(sessao.volume_kg)} kg`} rotulo="Volume" />
      </section>

      {sessao.volume_kg === 0 && sessao.series_feitas > 0 ? (
        <p className="text-[12px] leading-relaxed text-ink-4">
          Exercício de peso corporal não entra no volume — somar repetições a
          quilos daria um número sem significado.
        </p>
      ) : null}

      {sessao.exercicios.length ? (
        <ol className="space-y-2.5">
          {sessao.exercicios.map((exercicio) => (
            <li key={exercicio.id}>
              <BlocoDoExercicio exercicio={exercicio} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-card border border-border-soft bg-surface p-4 text-[13px] text-ink-3">
          Esta sessão não tem séries registradas.
        </p>
      )}
    </div>
  );
}

function BlocoDoExercicio({ exercicio }: { exercicio: ExercicioDoHistorico }) {
  return (
    <div className="rounded-card border border-border-soft bg-surface px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
          {exercicio.nome}
        </p>
        <p className="shrink-0 font-mono text-[11px] font-bold text-ink-5">
          {exercicio.feitas}/{exercicio.sets_prescritos}
        </p>
      </div>

      {exercicio.reps_target ? (
        <p className="mt-0.5 text-[11px] text-ink-4">
          Prescrito: {exercicio.sets_prescritos} × {exercicio.reps_target}
        </p>
      ) : null}

      <ul className="mt-2.5 space-y-1">
        {exercicio.series.map((serie) => (
          <li key={serie.set_number}>
            <LinhaDaSerie serie={serie} pesoCorporal={exercicio.is_bodyweight} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Uma série. Os três estados são visualmente distintos de propósito: série
 * pulada mostrada como série feita com campos vazios contaria uma coisa que
 * não aconteceu, e é o defeito que o card manda evitar.
 */
function LinhaDaSerie({
  serie,
  pesoCorporal,
}: {
  serie: LinhaDeSerie;
  pesoCorporal: boolean;
}) {
  return (
    <div className="grid grid-cols-[22px_1fr] items-center gap-3 rounded-[10px] bg-canvas-sunken px-2.5 py-1.5">
      {/* O número vem de `set_number`, a posição prescrita: a série 3 é a
          terceira mesmo que a 2 tenha sido pulada. */}
      <span className="font-mono text-[11px] font-bold text-ink-5">
        {serie.set_number}
      </span>
      {serie.estado === "feita" ? (
        <span className="text-[13px] font-semibold text-ink">
          {cargaDaSerie(serie.load_kg, pesoCorporal)}
          {serie.reps !== null ? (
            <span className="text-ink-3"> × {serie.reps} reps</span>
          ) : null}
        </span>
      ) : (
        <span className="text-[13px] text-ink-4">
          {serie.estado === "pulada" ? "Série pulada" : "Não registrada"}
        </span>
      )}
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
