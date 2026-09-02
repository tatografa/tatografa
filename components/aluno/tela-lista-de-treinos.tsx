import Link from "next/link";

import { semanaAtual } from "@/lib/domain/treino";
import type { MacrotreinoDoAluno, TreinoDaAgenda } from "@/lib/queries/aluno";

import { CardDeTreino } from "./card-de-treino";

export type TelaListaDeTreinosProps = {
  nomeDoPersonal: string;
  macrotreino: MacrotreinoDoAluno | null;
  treinos: TreinoDaAgenda[];
  /** Id do treino sugerido, para o selo. Nulo quando não há sugestão. */
  idSugerido: string | null;
};

/** Lista de treinos do macrotreino ativo (doc 05, tela 3). Sem banco. */
export function TelaListaDeTreinos({
  nomeDoPersonal,
  macrotreino,
  treinos,
  idSugerido,
}: TelaListaDeTreinosProps) {
  return (
    <div className="space-y-4">
      <header>
        <Link
          href="/app"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Treinar
        </Link>
        <h1 className="mt-2 text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          {macrotreino?.name ?? "Meus treinos"}
        </h1>
        {macrotreino ? (
          <p className="mt-0.5 text-[13px] text-ink-4">
            Semana{" "}
            {semanaAtual(macrotreino.started_at, macrotreino.total_weeks)}{" "}
            de {macrotreino.total_weeks} · {nomeDoPersonal}
          </p>
        ) : null}
      </header>

      {treinos.length ? (
        <ul className="space-y-2.5">
          {treinos.map((treino) => (
            <li key={treino.id}>
              <CardDeTreino
                treino={treino}
                sugerido={treino.id === idSugerido}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-border-soft bg-surface p-4 text-[13px] leading-relaxed text-ink-3">
          {nomeDoPersonal} ainda não montou nenhum treino para você.
        </p>
      )}

      {/* Rodapé do doc 05, tela 3. Fica fora do `if` de propósito: quem ainda
          não tem treino montado pode ter histórico de um macrotreino anterior. */}
      <p className="pt-1 text-center">
        <Link
          href="/app/historico"
          className="text-[12px] font-medium text-ink-4 transition hover:text-ink-2"
        >
          Ver histórico completo
        </Link>
      </p>
    </div>
  );
}
