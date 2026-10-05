import Link from "next/link";

import { Send } from "lucide-react";

import { AtividadeRecente, Indicadores } from "@/components/personal/blocos-do-painel";
import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import {
  CartaoDoPainel,
  LINHA_DO_CARTAO,
  LINHAS_DO_CARTAO,
} from "@/components/personal/cartao-do-painel";
import {
  AtividadeDiaria,
  CrescimentoDaCarteira,
  TopDeProgressoes,
} from "@/components/personal/graficos-do-painel";
import { Card, classesDeBotao } from "@/components/ui";
import { requireTrainer } from "@/lib/auth/session";
import { listarConvitesPendentes } from "@/lib/queries/alunos";
import { lerGraficosDoPainel, lerResumoDaCarteira } from "@/lib/queries/painel";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_PAINEL } from "@/lib/i18n/painel";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { plural, preencher } from "@/lib/i18n/texto";

import { cancelarConvite } from "./actions";
import { ConvidarAluno } from "./convidar-aluno";

export default async function PainelPage() {
  const { trainer } = await requireTrainer();

  const [{ alunos, indicadores, atividade }, convites, graficos, { idioma, t }] =
    await Promise.all([
      lerResumoDaCarteira(trainer.id),
      listarConvitesPendentes(),
      lerGraficosDoPainel(),
      textosDoPainel(),
    ]);
  const d = t.dashboard;

  return (
    <>
      <CabecalhoDaPagina
        // "Painel" e não "Dashboard" como no protótipo: é o nome do item no
        // menu ao lado, e a interface é inteira em português.
        titulo={d.titulo}
        subtitulo={d.subtitulo}
        acoes={<ConvidarAluno />}
      />

      {alunos.length === 0 && convites.length === 0 ? (
        <VazioSemAluno idioma={idioma} />
      ) : (
        /*
          Duas colunas como no protótipo, decididas por **container query** e
          não pela largura da janela: com a navegação lateral aberta ou
          recolhida a largura útil muda 184px, e quem decide se a coluna da
          direita cabe é o espaço que sobra no cartão. Abaixo disso as duas
          empilham e a da direita ocupa a largura toda — com `flex-wrap` ela
          descia presa aos 340px e ficava órfã no canto.
        */
        <div className="@container">
          <div className="grid items-start gap-4 @min-[720px]:grid-cols-[minmax(0,1fr)_clamp(260px,32%,340px)]">
            <div className="min-w-0 space-y-4">
              <Indicadores indicadores={indicadores} idioma={idioma} />

              {convites.length > 0 && <ConvitesPendentes convites={convites} idioma={idioma} />}

              <CrescimentoDaCarteira pontos={graficos.crescimento} idioma={idioma} />
              <AtividadeDiaria dias={graficos.atividade} idioma={idioma} />
            </div>

            <div className="min-w-0 space-y-4">
              <TopDeProgressoes progressoes={graficos.progressoes} idioma={idioma} />
              {/*
              A lista inteira não mora aqui: ela é `/painel/alunos` (doc 06
              §3), com tabela, busca e filtro. O dashboard guarda o que é
              decisão de hoje, e a carteira fica a um clique — no rodapé deste
              cartão, onde o olho termina a coluna.
            */}
              <AtividadeRecente sessoes={atividade} idioma={idioma} />
              <Link
                href="/painel/alunos"
                className="inline-flex min-h-8 items-center px-1 text-[13px] font-medium text-ink-3 transition hover:text-ink"
              >
                {plural(alunos.length, d.verTodos)}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ConvitesPendentes({
  convites,
  idioma,
}: {
  convites: Awaited<ReturnType<typeof listarConvitesPendentes>>;
  idioma: Idioma;
}) {
  const t = TEXTOS_DO_PAINEL[idioma];
  const c = t.dashboard.convites;
  return (
    <CartaoDoPainel
      titulo={preencher(c.titulo, { n: convites.length })}
      apoio={c.apoio}
      Icone={Send}
    >
      <ul className={LINHAS_DO_CARTAO}>
        {convites.map((convite) => (
          <li
            key={convite.id}
            className={`flex flex-wrap items-center justify-between gap-3 ${LINHA_DO_CARTAO}`}
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink">
                {convite.name}
              </p>
              <p className="truncate text-[12px] text-ink-4">
                {preencher(c.expira, { email: convite.email, quando: diasAte(convite.expires_at, t) })}
              </p>
            </div>
            <form action={cancelarConvite}>
              <input type="hidden" name="id" value={convite.id} />
              <button
                type="submit"
                className="inline-flex min-h-8 items-center text-[12.5px] font-medium text-ink-4 transition hover:text-danger"
              >
                {c.cancelar}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </CartaoDoPainel>
  );
}

function VazioSemAluno({ idioma }: { idioma: Idioma }) {
  const v = TEXTOS_DO_PAINEL[idioma].dashboard.vazio;
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          {v.titulo}
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          {v.texto}
        </p>
      </div>
      <Link href="/painel/treinos" className={classesDeBotao({ variant: "secondary" })}>
        {v.verTreinos}
      </Link>
    </Card>
  );
}

/** "3 dias" / "hoje" — o suficiente para o personal saber se vai expirar. */
function diasAte(iso: string, t: (typeof TEXTOS_DO_PAINEL)["pt"]): string {
  const dias = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
  if (dias <= 0) return t.dashboard.convites.hoje;
  return plural(dias, t.comum.dias);
}
