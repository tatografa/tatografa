import Link from "next/link";

import { Badge } from "@/components/ui";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { plural, preencher } from "@/lib/i18n/texto";
import type { TreinoDaAgenda } from "@/lib/queries/aluno";
import { cn } from "@/lib/utils";

export type CardDeTreinoProps = {
  treino: TreinoDaAgenda;
  /** Marca o treino que a home sugere: borda da marca e selo "Sugerido". */
  sugerido?: boolean;
  idioma: Idioma;
};

/**
 * Item da lista de treinos (doc 05, tela 3).
 *
 * O estado "concluído" do doc depende de histórico de sessão e é M2 — no M1
 * um treino é neutro ou sugerido, e nada mais.
 */
export function CardDeTreino({ treino, sugerido = false, idioma }: CardDeTreinoProps) {
  const t = TEXTOS_DO_APP[idioma];
  return (
    <Link
      href={`/app/treinos/${treino.id}`}
      className={cn(
        "flex items-center gap-3 rounded-card bg-surface px-4 py-3.5 transition",
        "hover:bg-canvas-sunken",
        sugerido ? "border-[1.5px] border-brand" : "border border-border-soft",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-ink">
          {preencher(t.comum.treinoComNome, { label: treino.label, nome: treino.name })}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-4">
          {contagem(treino.total_exercicios, idioma)} · ~{treino.duracao_min}min
        </p>
      </div>

      {sugerido ? <Badge tone="brand-solido">{t.treinos.lista.sugerido}</Badge> : null}
    </Link>
  );
}

/** "1 exercício" / "6 exercícios" — "1 exercícios" não, em nenhum dos três idiomas. */
export function contagem(total: number, idioma: Idioma = "pt"): string {
  return plural(total, TEXTOS_DO_APP[idioma].comum.exercicios);
}
