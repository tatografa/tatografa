import Link from "next/link";

import { Badge } from "@/components/ui";
import type { TreinoDaAgenda } from "@/lib/queries/aluno";
import { cn } from "@/lib/utils";

export type CardDeTreinoProps = {
  treino: TreinoDaAgenda;
  /** Marca o treino que a home sugere: borda da marca e selo "Sugerido". */
  sugerido?: boolean;
};

/**
 * Item da lista de treinos (doc 05, tela 3).
 *
 * O estado "concluído" do doc depende de histórico de sessão e é M2 — no M1
 * um treino é neutro ou sugerido, e nada mais.
 */
export function CardDeTreino({ treino, sugerido = false }: CardDeTreinoProps) {
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
          Treino {treino.label} · {treino.name}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-4">
          {contagem(treino.total_exercicios)} · ~{treino.duracao_min}min
        </p>
      </div>

      {sugerido ? <Badge tone="brand-solido">Sugerido</Badge> : null}
    </Link>
  );
}

/** "1 exercício" / "6 exercícios" — plural em português, não "1 exercícios". */
export function contagem(total: number): string {
  return total === 1 ? "1 exercício" : `${total} exercícios`;
}
