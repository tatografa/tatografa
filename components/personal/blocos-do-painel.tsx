import Link from "next/link";
import { History } from "lucide-react";

import {
  CartaoDoPainel,
  LINHA_DO_CARTAO,
  LINHAS_DO_CARTAO,
} from "@/components/personal/cartao-do-painel";

import { NumeroDoTopo } from "@/components/personal/numero-do-topo";
import { comoPorcentagem } from "@/lib/domain/atencao";
import type { Idioma } from "@/lib/domain/idioma";
import { formatos } from "@/lib/i18n/formatos";
import { TEXTOS_DO_PAINEL, type TextosDoPainel } from "@/lib/i18n/painel";
import { plural } from "@/lib/i18n/texto";
import { iniciaisDe } from "@/lib/domain/nome";
import type {
  IndicadoresDoPainel,
  SessaoRecente,
} from "@/lib/queries/painel";

/**
 * Os quatro números do topo do painel (doc 06 §2). Sem banco, como as outras
 * telas.
 *
 * A aderência nula vira "—", não "0%": zero por cento diz que a carteira
 * inteira faltou; o traço diz que ainda não há o que medir.
 *
 * "Reavaliações pendentes" é o único dos quatro que é fila de trabalho, e por
 * isso é o único que vira link: o número sem a tela obrigaria o personal a
 * procurar no menu quem ele está esperando. Zero não vira link — levar a uma
 * lista vazia é pior que não levar.
 */
export function Indicadores({
  indicadores,
  idioma,
}: {
  indicadores: IndicadoresDoPainel;
  idioma: Idioma;
}) {
  const n = TEXTOS_DO_PAINEL[idioma].dashboard.numeros;
  const {
    alunosAtivos,
    treinosNaSemana,
    aderenciaMedia,
    reavaliacoesPendentes,
  } = indicadores;

  return (
    // Dois por linha ou os quatro numa linha só, nunca três e um sobrando —
    // que é o que `auto-fit` fazia com quatro ladrilhos numa coluna de 740px.
    // A régua é a largura da coluna (container query), não a da janela.
    <div className="@container">
      <section
        aria-label={n.rotulo}
        className="grid grid-cols-2 gap-3.5 @min-[640px]:grid-cols-4"
      >
        <NumeroDoTopo
          titulo={n.ativos}
          valor={String(alunosAtivos)}
          apoio={n.ativosApoio}
        />
        <NumeroDoTopo
          titulo={n.semana}
          valor={String(treinosNaSemana)}
          apoio={n.semanaApoio}
        />
        <NumeroDoTopo
          titulo={n.aderencia}
          valor={comoPorcentagem(aderenciaMedia)}
          apoio={n.aderenciaApoio}
        />
        <NumeroDoTopo
          titulo={n.reavaliacoes}
          valor={String(reavaliacoesPendentes)}
          apoio={n.reavaliacoesApoio}
          destaque={reavaliacoesPendentes > 0}
          href={reavaliacoesPendentes > 0 ? "/painel/agenda" : undefined}
        />
      </section>
    </div>
  );
}

/**
 * "Treinos recentes" (doc 06 §2, "Atividade recente"): as últimas sessões
 * concluídas da carteira, no cartão da coluna da direita do protótipo.
 *
 * É a única tela do painel onde o personal vê a carteira inteira em ordem de
 * acontecimento, e não por aluno. Vale pela leitura de baixo: "ninguém treinou
 * hoje" é informação, e por isso o bloco **desenha o vazio** em vez de sumir —
 * atividade vazia é a pergunta que traz o personal aqui.
 *
 * Cada linha leva à sessão, não ao aluno: quem clica em "Carla · A · 16 séries"
 * quer ver aquelas séries. Para a ficha há a tabela de alunos.
 */
export function AtividadeRecente({
  sessoes,
  idioma,
}: {
  sessoes: SessaoRecente[];
  idioma: Idioma;
}) {
  const t: TextosDoPainel = TEXTOS_DO_PAINEL[idioma];
  const r = t.dashboard.recentes;
  const f = formatos(idioma);
  return (
    <CartaoDoPainel
      titulo={r.titulo}
      apoio={r.apoio}
      Icone={History}
    >
      {!sessoes.length ? (
        <p
          className={`text-[13px] leading-relaxed text-ink-3 ${LINHA_DO_CARTAO}`}
        >
          {r.vazio}
        </p>
      ) : (
        <ul className={LINHAS_DO_CARTAO}>
          {sessoes.map((sessao) => (
            <li key={sessao.id}>
              <Link
                href={`/painel/alunos/${sessao.aluno.id}/sessoes/${sessao.id}`}
                className={`flex items-center gap-3 transition hover:bg-canvas ${LINHA_DO_CARTAO}`}
              >
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[11px] font-semibold text-ink-3"
                >
                  {iniciaisDe(sessao.aluno.nome)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 truncate text-[13px] font-medium text-ink">
                      {sessao.aluno.nome}
                    </p>
                    <p className="shrink-0 text-[12px] text-ink-5 tabular-nums">
                      {f.dia(sessao.finished_at)}
                    </p>
                  </div>
                  {/* Volume e duração ficam a um clique, na sessão: numa
                      coluna de 340px eles empurrariam o nome do treino para
                      as reticências, e é o nome que diz o que foi feito. */}
                  <p className="truncate text-[12px] text-ink-4 tabular-nums">
                    {sessao.treino
                      ? `${sessao.treino.label} · ${sessao.treino.name}`
                      : r.removido}
                    {" · "}
                    {plural(sessao.series_feitas, t.comum.series)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CartaoDoPainel>
  );
}
