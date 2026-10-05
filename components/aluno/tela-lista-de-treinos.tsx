import Link from "next/link";

import type { Idioma } from "@/lib/domain/idioma";
import { semanaAtual } from "@/lib/domain/treino";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { preencher } from "@/lib/i18n/texto";
import type { MacrotreinoDoAluno, TreinoDaAgenda } from "@/lib/queries/aluno";

import { CardDeTreino } from "./card-de-treino";
import { LinkDeVoltar } from "@/components/aluno/link-de-voltar";

export type TelaListaDeTreinosProps = {
  nomeDoPersonal: string;
  macrotreino: MacrotreinoDoAluno | null;
  treinos: TreinoDaAgenda[];
  /** Id do treino sugerido, para o selo. Nulo quando não há sugestão. */
  idSugerido: string | null;
  idioma: Idioma;
};

/** Lista de treinos do macrotreino ativo (doc 05, tela 3). Sem banco. */
export function TelaListaDeTreinos({
  nomeDoPersonal,
  macrotreino,
  treinos,
  idSugerido,
  idioma,
}: TelaListaDeTreinosProps) {
  const t = TEXTOS_DO_APP[idioma].treinos;
  return (
    <div className="space-y-4">
      <header>
        <LinkDeVoltar href="/app">{t.lista.voltar}</LinkDeVoltar>
        <h1 className="mt-2 text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          {macrotreino?.name ?? t.lista.meusTreinos}
        </h1>
        {macrotreino ? (
          <p className="mt-0.5 text-[13px] text-ink-4">
            {preencher(t.macrotreino.semana, {
              semana: semanaAtual(macrotreino.started_at, macrotreino.total_weeks),
              total: macrotreino.total_weeks,
            })}{" "}
            · {nomeDoPersonal}
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
                idioma={idioma}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-border-soft bg-surface p-4 text-[13px] leading-relaxed text-ink-3">
          {preencher(t.lista.vazio, { nome: nomeDoPersonal })}
        </p>
      )}

      {/* Rodapé do doc 05, tela 3. Fica fora do `if` de propósito: quem ainda
          não tem treino montado pode ter histórico de um macrotreino anterior. */}
      <p className="pt-1 text-center">
        <Link
          href="/app/historico"
          className="text-[12px] font-medium text-ink-4 transition hover:text-ink-2"
        >
          {t.lista.historicoCompleto}
        </Link>
      </p>
    </div>
  );
}
