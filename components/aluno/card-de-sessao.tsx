import Link from "next/link";

import { Badge } from "@/components/ui";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { formatos } from "@/lib/i18n/formatos";
import { plural, preencher } from "@/lib/i18n/texto";
import type { SessaoDoHistorico } from "@/lib/queries/historico";

/**
 * Uma sessão na lista do histórico.
 *
 * O selo "Incompleto" sai da comparação entre séries feitas e prescritas: pelas
 * colunas de `workout_sessions` um treino abandonado é idêntico a um completo
 * (handoff `execucao.md`, item 6), e sem o selo o aluno leria como treino
 * inteiro um treino que parou na metade.
 */
export function CardDeSessao({ sessao, idioma }: { sessao: SessaoDoHistorico; idioma: Idioma }) {
  const t = TEXTOS_DO_APP[idioma];
  const f = formatos(idioma);
  const incompleto =
    sessao.series_prescritas > 0 && sessao.series_feitas < sessao.series_prescritas;

  return (
    <Link
      href={`/app/historico/${sessao.id}`}
      className="flex items-center gap-3 rounded-card border border-border-soft bg-surface px-4 py-3.5 transition hover:bg-canvas-sunken"
    >
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-ink-5">
          {f.dia(sessao.finished_at)} · {f.hora(sessao.finished_at)}
        </p>
        <p className="mt-1.5 truncate text-[15px] font-bold text-ink">
          {sessao.treino
            ? preencher(t.comum.treinoComNome, { label: sessao.treino.label, nome: sessao.treino.name })
            : t.comum.treinoRemovido}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-4">
          {f.duracao(sessao.duration_seconds)} ·{" "}
          {sessao.series_prescritas > 0
            ? preencher(t.historico.historico.seriesDe, {
                feitas: sessao.series_feitas,
                total: sessao.series_prescritas,
              })
            : plural(sessao.series_feitas, t.comum.series)}
          {" · "}
          {f.carga(sessao.volume_kg)}
        </p>
      </div>

      {incompleto ? <Badge>{t.historico.historico.incompleto}</Badge> : null}
    </Link>
  );
}
