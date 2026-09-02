import Link from "next/link";

import { classesDeBotao } from "@/components/ui";
import type { SessaoDoHistorico } from "@/lib/queries/historico";
import { LIMITE_DO_HISTORICO } from "@/lib/queries/historico";

import { CardDeSessao } from "./card-de-sessao";

/**
 * Lista do histórico (card M1-06). Recebe as sessões prontas, sem banco — é o
 * que permite conferir a tela no navegador com props fixas, já que o host do
 * Supabase é bloqueado neste ambiente.
 */
export function TelaHistorico({ sessoes }: { sessoes: SessaoDoHistorico[] }) {
  return (
    <div className="space-y-4">
      <header>
        <Link
          href="/app/treinos"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Treinos
        </Link>
        <h1 className="mt-2 text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          Histórico
        </h1>
        {/* Contador só quando há o que contar: "0 treinos registrados" em
            cima de um convite para começar soa como cobrança. */}
        {sessoes.length ? (
          <p className="mt-0.5 text-[13px] text-ink-4">
            {sessoes.length === 1
              ? "1 treino registrado"
              : `${sessoes.length} treinos registrados`}
          </p>
        ) : null}
      </header>

      {sessoes.length ? (
        <>
          <ul className="space-y-2.5">
            {sessoes.map((sessao) => (
              <li key={sessao.id}>
                <CardDeSessao sessao={sessao} />
              </li>
            ))}
          </ul>

          {/* Corte silencioso faria o aluno achar que perdeu treino. */}
          {sessoes.length >= LIMITE_DO_HISTORICO ? (
            <p className="text-center text-[12px] text-ink-5">
              Mostrando os {LIMITE_DO_HISTORICO} treinos mais recentes.
            </p>
          ) : null}
        </>
      ) : (
        <section className="rounded-card-lg border border-border-soft bg-surface p-5 text-center">
          <p className="text-[15px] font-bold text-ink">
            Seu histórico começa no primeiro treino
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            Assim que você terminar um treino, ele aparece aqui com a carga e as
            repetições de cada série.
          </p>
          <Link
            href="/app/treinos"
            className={classesDeBotao({ block: true, className: "mt-4" })}
          >
            Ver meus treinos
          </Link>
        </section>
      )}
    </div>
  );
}
