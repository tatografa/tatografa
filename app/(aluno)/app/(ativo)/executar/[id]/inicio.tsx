
import { HoraLocal } from "@/components/aluno/hora-local";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { plural, preencher } from "@/lib/i18n/texto";
import type { SessaoAberta } from "@/lib/queries/execucao";
import type { TreinoCompleto } from "@/lib/queries/treinos";

import { iniciarTreino } from "../actions";
import { ResolucaoDaSessaoPendente } from "./resolucao-pendente";
import { LinkDeVoltar } from "@/components/aluno/link-de-voltar";

/**
 * Telas de entrada da execução. São componentes de servidor com formulário:
 * começar um treino cria linha no banco, e criar linha no banco não pode
 * acontecer durante o render de uma página — um refresh criaria outra sessão.
 */

/** Confirmação antes de abrir a sessão. */
export function TelaComecar({ treino, idioma }: { treino: TreinoCompleto; idioma: Idioma }) {
  const t = TEXTOS_DO_APP[idioma];
  return (
    <Moldura
      eyebrow={preencher(t.comum.treino, { label: treino.label })}
      titulo={treino.name}
      voltarPara={`/app/treinos/${treino.id}`}
      voltar={t.execucao.inicio.voltar}
    >
      <p className="text-[14px] leading-relaxed text-dark-text-2">
        {preencher(t.execucao.inicio.resumo, {
          exercicios: plural(treino.exercicios.length, t.comum.exercicios),
          series: plural(treino.total_series, t.comum.series),
          min: treino.duracao_min,
        })}
      </p>

      <form action={iniciarTreino} className="mt-6">
        <input type="hidden" name="treinoId" value={treino.id} />
        <button
          type="submit"
          className="h-[52px] w-full rounded-[13px] bg-brand text-[16px] font-bold text-white shadow-cta transition active:scale-[0.99]"
        >
          {t.execucao.inicio.comecar}
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
  idioma,
}: {
  treino: TreinoCompleto;
  pendente: SessaoAberta;
  idioma: Idioma;
}) {
  const t = TEXTOS_DO_APP[idioma];
  const nomePendente = pendente.treino
    ? preencher(t.comum.treinoComNome, { label: pendente.treino.label, nome: pendente.treino.name })
    : t.comum.umTreino;

  return (
    <Moldura
      eyebrow={t.execucao.inicio.emAndamento}
      titulo={nomePendente}
      voltarPara={`/app/treinos/${treino.id}`}
      voltar={t.execucao.inicio.voltar}
    >
      {/*
        A decisão sobre encerrar mora no cliente porque depende do que este
        aparelho ainda guarda — a contagem do servidor não enxerga um treino
        feito sem sinal.
      */}
      <ResolucaoDaSessaoPendente
        sessaoId={pendente.id}
        sessaoWorkoutId={pendente.workout_id}
        seriesNoServidor={pendente.series_registradas}
        treinoId={treino.id}
        treinoLabel={treino.label}
      />

      <p className="mt-3 text-[13px] text-dark-muted">
        {t.execucao.inicio.comecouAs}<HoraLocal iso={pendente.started_at} />.
      </p>
    </Moldura>
  );
}

function Moldura({
  eyebrow,
  titulo,
  voltarPara,
  voltar,
  children,
}: {
  eyebrow: string;
  titulo: string;
  voltarPara: string;
  voltar: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg text-dark-text">
      <div className="mx-auto max-w-[440px] px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-10">
        <LinkDeVoltar href={voltarPara} tom="escuro">
          {voltar}
        </LinkDeVoltar>

        <p className="eyebrow mt-6 text-[10px] text-brand-on-dark">{eyebrow}</p>
        <h1 className="mt-2 text-[26px] leading-tight font-extrabold tracking-[-0.02em] text-dark-text">
          {titulo}
        </h1>

        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
