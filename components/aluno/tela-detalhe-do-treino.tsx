
import { iniciarTreino } from "@/app/(aluno)/app/(ativo)/executar/actions";
import { classesDeBotao } from "@/components/ui";
import type { ExercicioPrescrito, TreinoCompleto } from "@/lib/queries/treinos";
import { LinkDeVoltar } from "@/components/aluno/link-de-voltar";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_APP, type TextosDoApp } from "@/lib/i18n/app";
import { preencher } from "@/lib/i18n/texto";

/** Detalhe do treino (doc 05, tela 4). Recebe o treino pronto, sem banco. */
export function TelaDetalheDoTreino({
  treino,
  idioma,
}: {
  treino: TreinoCompleto;
  idioma: Idioma;
}) {
  const t = TEXTOS_DO_APP[idioma];
  const d = t.treinos.detalhe;
  return (
    <div className="space-y-4">
      <header>
        <LinkDeVoltar href="/app/treinos">{d.voltar}</LinkDeVoltar>
        <h1 className="mt-2 text-[20px] font-extrabold tracking-[-0.02em] text-ink">
          {preencher(t.comum.treino, { label: treino.label })}
        </h1>
        <p className="mt-0.5 text-[12px] text-ink-4">{treino.name}</p>
      </header>

      <section
        aria-label={d.resumo}
        className="flex items-center rounded-card border border-border-soft bg-surface py-3"
      >
        <Metrica valor={String(treino.exercicios.length)} rotulo={d.exercicios} />
        <Divisoria />
        <Metrica valor={`~${treino.duracao_min}min`} rotulo={d.duracao} />
        <Divisoria />
        <Metrica valor={String(treino.total_series)} rotulo={d.series} />
      </section>

      {treino.notes ? (
        <p className="rounded-card bg-canvas-sunken p-3.5 text-[13px] leading-relaxed text-ink-2">
          {treino.notes}
        </p>
      ) : null}

      <ol className="space-y-2.5">
        {treino.exercicios.map((exercicio) => (
          <li key={exercicio.id}>
            <LinhaDoExercicio exercicio={exercicio} t={t} />
          </li>
        ))}
      </ol>

      {treino.exercicios.length ? (
        /*
         * Formulário, não link: o aluno já leu a prescrição inteira nesta
         * tela, e mandá-lo para outra tela de confirmação seria um toque a
         * mais na academia. A Server Action abre a sessão e redireciona — e é
         * ela que trata o caso de já existir um treino em andamento.
         */
        <form action={iniciarTreino}>
          <input type="hidden" name="treinoId" value={treino.id} />
          <button
            type="submit"
            className={classesDeBotao({ size: "lg", block: true })}
          >
            {d.comecar}
          </button>
        </form>
      ) : (
        <p className="text-center text-[13px] text-ink-3">
          {d.semExercicios}
        </p>
      )}
    </div>
  );
}

function LinhaDoExercicio({ exercicio, t }: { exercicio: ExercicioPrescrito; t: TextosDoApp }) {
  return (
    <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 rounded-card bg-surface px-3.5 py-3">
      {/*
        A numeração vem de `position`, que a leitura renumera de 0 sem buracos
        (handoff, item 4) — contar aqui de novo daria outro número se uma linha
        órfã tivesse sido pulada.
      */}
      <span className="text-[12px] font-bold text-ink-5 tabular-nums">
        {exercicio.position + 1}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-ink">
          {exercicio.exercicio.name}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-4">
          {exercicio.sets} × {exercicio.reps_target}
          {exercicio.rir_target ? ` · RIR ${exercicio.rir_target}` : ""} ·{" "}
          {preencher(t.treinos.detalhe.descanso, { s: exercicio.rest_seconds })}
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
