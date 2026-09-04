import Link from "next/link";
import { Check, Medal } from "lucide-react";

import { duracaoCurta, formatarNumero } from "@/lib/domain/historico";
import { textoDoRecorde, type RecordeBatido } from "@/lib/domain/recordes";
import { volumeDaSessao, type SerieRegistrada } from "@/lib/domain/treino";

/** Um recorde batido, já com o nome do exercício resolvido para a tela. */
export type RecordeNaTela = RecordeBatido & { nome: string };

export interface ResumoDoTreinoProps {
  label: string;
  nome: string;
  /** `workout_sessions.duration_seconds`. Nulo vira "—", não vira zero. */
  duracaoSegundos: number | null;
  series: SerieRegistrada[];
  /**
   * Os recordes que esta sessão quebrou, na ordem do treino. Lista vazia é o
   * caso normal e não desenha nada: o doc 05 é explícito — "não invente
   * celebração vazia".
   */
  recordes?: RecordeNaTela[];
}

/**
 * O resumo da conclusão (doc 05, seção 6): duração, séries e volume.
 *
 * Componente puro, sem banco: é o que permite conferir a tela no navegador
 * numa rota descartável, já que o host do Supabase é bloqueado neste ambiente.
 *
 * Foto do treino e post no feed são M3. Os recordes chegam prontos: quem
 * decide o que é recorde é `lib/domain/recordes.ts`, e a tela só desenha.
 */
export function ResumoDoTreino({
  label,
  nome,
  duracaoSegundos,
  series,
  recordes = [],
}: ResumoDoTreinoProps) {
  const realizadas = series.filter((s) => !s.skipped);
  const volume = volumeDaSessao(series);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg text-dark-text">
      <div className="mx-auto flex min-h-full max-w-[440px] flex-col px-5 pt-[calc(32px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]">
        <div className="flex-1">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand shadow-halo">
            <Check aria-hidden size={28} strokeWidth={3} className="text-white" />
          </span>

          <h1 className="mt-5 text-[30px] leading-tight font-extrabold tracking-[-0.02em] text-dark-text">
            Treino concluído
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-4">
            Treino {label} · {nome}
          </p>

          <section
            aria-label="Resumo do treino"
            className="mt-7 flex items-center rounded-card-lg border border-dark-border bg-dark-surface py-5"
          >
            <Metrica valor={duracaoCurta(duracaoSegundos)} rotulo="Duração" />
            <Divisoria />
            <Metrica valor={String(realizadas.length)} rotulo="Séries" />
            <Divisoria />
            <Metrica valor={`${formatarNumero(volume)} kg`} rotulo="Volume" />
          </section>

          {recordes.length > 0 ? (
            <section
              aria-label={
                recordes.length === 1 ? "Recorde pessoal" : "Recordes pessoais"
              }
              className="mt-4 rounded-card-lg border border-brand bg-brand-tint p-4"
            >
              <p className="eyebrow flex items-center gap-1.5 text-[10px] text-brand">
                <Medal aria-hidden size={14} />
                {recordes.length === 1 ? "Recorde pessoal" : "Recordes pessoais"}
              </p>

              <ul className="mt-3 space-y-2.5">
                {recordes.map((recorde) => (
                  <li key={recorde.chave} className="space-y-0.5">
                    <p className="text-[14.5px] leading-tight font-bold text-dark-text">
                      {recorde.nome}
                    </p>
                    <p className="text-[13px] font-semibold text-dark-text-2 tabular-nums">
                      {textoDoRecorde(recorde)}
                      {recorde.reps === null ? null : (
                        <span className="text-ink-4"> · {recorde.reps} reps</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {volume === 0 && realizadas.length > 0 ? (
            <p className="mt-3 text-[12px] leading-relaxed text-ink-4">
              Exercício de peso corporal não entra no volume — somar repetições
              a quilos daria um número sem significado.
            </p>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/app"
            className="flex h-[52px] w-full items-center justify-center rounded-[13px] bg-brand text-[16px] font-bold text-white shadow-cta transition active:scale-[0.99]"
          >
            Concluir
          </Link>

          {/*
            O treino que acabou de ser gravado é justamente o que o aluno quer
            conferir. Sem este link, o caminho até o histórico passava por
            dentro da tela que abre uma nova sessão.
          */}
          <Link
            href="/app/historico"
            className="block text-center text-[13px] font-semibold text-ink-4 transition hover:text-dark-text"
          >
            Ver histórico
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metrica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[22px] font-extrabold tracking-[-0.01em] text-dark-text">
        {valor}
      </p>
      <p className="eyebrow mt-1.5 text-[9px] text-ink-4">{rotulo}</p>
    </div>
  );
}

function Divisoria() {
  return <span aria-hidden className="h-8 w-px shrink-0 bg-dark-border" />;
}
