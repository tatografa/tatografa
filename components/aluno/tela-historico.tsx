import Link from "next/link";

import { classesDeBotao } from "@/components/ui";
import type { SessaoDoHistorico } from "@/lib/queries/historico";
import { LIMITE_DO_HISTORICO } from "@/lib/queries/historico";

import { CardDeSessao } from "./card-de-sessao";
import { LinkDeVoltar } from "@/components/aluno/link-de-voltar";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { plural, preencher } from "@/lib/i18n/texto";

/**
 * Lista do histórico (card M1-06). Recebe as sessões prontas, sem banco — é o
 * que permite conferir a tela no navegador com props fixas, já que o host do
 * Supabase é bloqueado neste ambiente.
 */
export function TelaHistorico({
  sessoes,
  idioma,
}: {
  sessoes: SessaoDoHistorico[];
  idioma: Idioma;
}) {
  const h = TEXTOS_DO_APP[idioma].historico.historico;
  return (
    <div className="space-y-4">
      <header>
        <LinkDeVoltar href="/app/treinos">{h.voltar}</LinkDeVoltar>
        <h1 className="mt-2 text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          {h.titulo}
        </h1>
        {/* Contador só quando há o que contar: "0 treinos registrados" em
            cima de um convite para começar soa como cobrança. */}
        {sessoes.length ? (
          <p className="mt-0.5 text-[13px] text-ink-4">
            {plural(sessoes.length, h.registrados)}
          </p>
        ) : null}
      </header>

      {sessoes.length ? (
        <>
          <ul className="space-y-2.5">
            {sessoes.map((sessao) => (
              <li key={sessao.id}>
                <CardDeSessao sessao={sessao} idioma={idioma} />
              </li>
            ))}
          </ul>

          {/* Corte silencioso faria o aluno achar que perdeu treino. */}
          {sessoes.length >= LIMITE_DO_HISTORICO ? (
            <p className="text-center text-[12px] text-ink-5">
              {preencher(h.limite, { n: LIMITE_DO_HISTORICO })}
            </p>
          ) : null}
        </>
      ) : (
        <section className="rounded-card-lg border border-border-soft bg-surface p-5 text-center">
          <p className="text-[15px] font-bold text-ink">
            {h.vazioTitulo}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            {h.vazioTexto}
          </p>
          <Link
            href="/app/treinos"
            className={classesDeBotao({ block: true, className: "mt-4" })}
          >
            {h.verTreinos}
          </Link>
        </section>
      )}
    </div>
  );
}
