import Link from "next/link";

import { HoraLocal } from "@/components/aluno/hora-local";
import type { SessaoAberta } from "@/lib/queries/execucao";
import type { TreinoCompleto } from "@/lib/queries/treinos";

import { encerrarPendenteEComecar, iniciarTreino } from "../actions";

/**
 * Telas de entrada da execução. São componentes de servidor com formulário:
 * começar um treino cria linha no banco, e criar linha no banco não pode
 * acontecer durante o render de uma página — um refresh criaria outra sessão.
 */

/** Confirmação antes de abrir a sessão. */
export function TelaComecar({ treino }: { treino: TreinoCompleto }) {
  return (
    <Moldura
      eyebrow={`Treino ${treino.label}`}
      titulo={treino.name}
      voltarPara={`/app/treinos/${treino.id}`}
    >
      <p className="text-[14px] leading-relaxed text-dark-text-2">
        {treino.exercicios.length} exercícios · {treino.total_series} séries ·
        ~{treino.duracao_min}min
      </p>

      <form action={iniciarTreino} className="mt-6">
        <input type="hidden" name="treinoId" value={treino.id} />
        <button
          type="submit"
          className="h-[52px] w-full rounded-[13px] bg-brand text-[16px] font-bold text-white shadow-cta transition active:scale-[0.99]"
        >
          Começar treino
        </button>
      </form>
    </Moldura>
  );
}

/**
 * Uma sessão de outro treino está aberta. O índice único parcial só permite
 * uma por aluno, então a escolha é explícita.
 *
 * Decisão do PM: série que o aluno executou nunca é apagada. Sessão com séries
 * é **encerrada e salva** como treino incompleto; só a sessão sem nenhuma
 * série é descartada de verdade — e o texto do botão diz qual dos dois é.
 */
export function TelaSessaoPendente({
  treino,
  pendente,
}: {
  treino: TreinoCompleto;
  pendente: SessaoAberta;
}) {
  const temSeries = pendente.series_registradas > 0;
  const nomePendente = pendente.treino
    ? `Treino ${pendente.treino.label} · ${pendente.treino.name}`
    : "Um treino";

  return (
    <Moldura
      eyebrow="Treino em andamento"
      titulo={nomePendente}
      voltarPara={`/app/treinos/${treino.id}`}
    >
      <p className="text-[14px] leading-relaxed text-dark-text-2">
        {temSeries
          ? `${pendente.series_registradas} ${pendente.series_registradas === 1 ? "série registrada" : "séries registradas"}.`
          : "Ainda não tem nenhuma série registrada."}
      </p>
      <p className="mt-1 text-[13px] text-ink-4">
        Começou às <HoraLocal iso={pendente.started_at} />.
      </p>

      <div className="mt-6 space-y-2.5">
        <Link
          href={`/app/executar/${pendente.workout_id}`}
          className="flex h-[52px] w-full items-center justify-center rounded-[13px] bg-brand text-[16px] font-bold text-white shadow-cta transition active:scale-[0.99]"
        >
          Retomar esse treino
        </Link>

        <form action={encerrarPendenteEComecar}>
          <input type="hidden" name="sessaoId" value={pendente.id} />
          <input type="hidden" name="treinoId" value={treino.id} />
          <button
            type="submit"
            className="h-[52px] w-full rounded-[13px] border-[1.5px] border-dark-border-2 text-[15px] font-bold text-dark-text-2 transition active:scale-[0.99]"
          >
            {temSeries
              ? `Encerrar e começar o Treino ${treino.label}`
              : `Descartar e começar o Treino ${treino.label}`}
          </button>
        </form>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-4">
        {temSeries
          ? "Encerrar salva o que já foi feito no histórico. Nenhuma série é apagada."
          : "Sem nenhuma série registrada, não há o que guardar."}
      </p>
    </Moldura>
  );
}

function Moldura({
  eyebrow,
  titulo,
  voltarPara,
  children,
}: {
  eyebrow: string;
  titulo: string;
  voltarPara: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg text-dark-text">
      <div className="mx-auto max-w-[440px] px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-10">
        <Link
          href={voltarPara}
          className="eyebrow text-ink-4 transition hover:text-dark-text-2"
        >
          ← Voltar
        </Link>

        <p className="eyebrow mt-6 text-[10px] text-brand">{eyebrow}</p>
        <h1 className="mt-2 text-[26px] leading-tight font-extrabold tracking-[-0.02em] text-dark-text">
          {titulo}
        </h1>

        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
