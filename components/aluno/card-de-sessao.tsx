import Link from "next/link";

import { Badge } from "@/components/ui";
import {
  duracaoCurta,
  formatarNumero,
  horaDaSessao,
  rotuloDoDia,
} from "@/lib/domain/historico";
import type { SessaoDoHistorico } from "@/lib/queries/historico";

/**
 * Uma sessão na lista do histórico.
 *
 * O selo "Incompleto" sai da comparação entre séries feitas e prescritas: pelas
 * colunas de `workout_sessions` um treino abandonado é idêntico a um completo
 * (handoff `execucao.md`, item 6), e sem o selo o aluno leria como treino
 * inteiro um treino que parou na metade.
 */
export function CardDeSessao({ sessao }: { sessao: SessaoDoHistorico }) {
  const incompleto =
    sessao.series_prescritas > 0 && sessao.series_feitas < sessao.series_prescritas;

  return (
    <Link
      href={`/app/historico/${sessao.id}`}
      className="flex items-center gap-3 rounded-card border border-border-soft bg-surface px-4 py-3.5 transition hover:bg-canvas-sunken"
    >
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-ink-5">
          {rotuloDoDia(sessao.finished_at)} · {horaDaSessao(sessao.finished_at)}
        </p>
        <p className="mt-1.5 truncate text-[15px] font-bold text-ink">
          {sessao.treino
            ? `Treino ${sessao.treino.label} · ${sessao.treino.name}`
            : "Treino removido"}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-4">
          {duracaoCurta(sessao.duration_seconds)} ·{" "}
          {sessao.series_prescritas > 0
            ? `${sessao.series_feitas} de ${sessao.series_prescritas} séries`
            : `${sessao.series_feitas} séries`}
          {" · "}
          {formatarNumero(sessao.volume_kg)} kg
        </p>
      </div>

      {incompleto ? <Badge>Incompleto</Badge> : null}
    </Link>
  );
}
