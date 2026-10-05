import type { Idioma } from "@/lib/domain/idioma";
import { semanaAtual } from "@/lib/domain/treino";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { preencher } from "@/lib/i18n/texto";

export type CardMacrotreinoProps = {
  nome: string;
  totalDeSemanas: number;
  /** `mesocycles.started_at`, como vem do banco. */
  inicio: string;
  nomeDoPersonal: string;
  idioma: Idioma;
};

/**
 * O macrotreino ativo, em card escuro (doc 05, bloco 3).
 *
 * A semana atual sai de `semanaAtual()`, derivada de `started_at` — nunca de
 * uma coluna: uma semana guardada no banco começa a mentir no dia seguinte.
 */
export function CardMacrotreino({
  nome,
  totalDeSemanas,
  inicio,
  nomeDoPersonal,
  idioma,
}: CardMacrotreinoProps) {
  const t = TEXTOS_DO_APP[idioma].treinos.macrotreino;
  const semana = semanaAtual(inicio, totalDeSemanas);
  const progresso = Math.round((semana / totalDeSemanas) * 100);

  return (
    <section className="rounded-card-lg bg-dark-bg px-4.5 py-4">
      <p className="eyebrow text-dark-muted">{t.ativo}</p>
      <h2 className="mt-2 text-[19px] font-extrabold tracking-[-0.01em] text-dark-text">
        {nome}
      </h2>
      <p className="mt-1 text-[12px] text-dark-muted">
        {preencher(t.semana, { semana, total: totalDeSemanas })} · {nomeDoPersonal}
      </p>

      <div
        className="mt-3.5 h-1 overflow-hidden rounded-pill bg-dark-elev"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalDeSemanas}
        aria-valuenow={semana}
        aria-label={preencher(t.semana, { semana, total: totalDeSemanas })}
      >
        <div className="h-full bg-brand" style={{ width: `${progresso}%` }} />
      </div>
    </section>
  );
}
