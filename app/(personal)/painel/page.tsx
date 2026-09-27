import type { Metadata } from "next";
import Link from "next/link";

import { Send } from "lucide-react";

import {
  AlunosQuePrecisamDeAtencao,
  AtividadeRecente,
  Indicadores,
} from "@/components/personal/blocos-do-painel";
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

import { cancelarConvite } from "./actions";
import { ConvidarAluno } from "./convidar-aluno";

export const metadata: Metadata = { title: "Painel" };

export default async function PainelPage() {
  const { trainer } = await requireTrainer();

  // O limiar sai da linha do personal, não de uma constante: é ajuste dele,
  // editável em /painel/configuracoes.
  const [{ alunos, alertas, indicadores, atividade }, convites, graficos] =
    await Promise.all([
      lerResumoDaCarteira(trainer.id, trainer.dias_para_alerta),
      listarConvitesPendentes(),
      lerGraficosDoPainel(),
    ]);

  return (
    <>
      <CabecalhoDaPagina
        // "Painel" e não "Dashboard" como no protótipo: é o nome do item no
        // menu ao lado, e a interface é inteira em português.
        titulo="Painel"
        subtitulo="Aqui está o resumo da sua consultoria hoje"
        acoes={<ConvidarAluno />}
      />

      {alunos.length === 0 && convites.length === 0 ? (
        <VazioSemAluno />
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
              <Indicadores indicadores={indicadores} />

              {/*
              Primeiro cartão depois dos números, e antes dos gráficos que o
              protótipo põe aqui: o doc 06 chama este bloco de "a lista mais
              útil da página — não a esconda embaixo". Sem ninguém parado ele
              não desenha nada, e os gráficos sobem.
            */}
              <AlunosQuePrecisamDeAtencao
                alertas={alertas}
                diasParaAlerta={trainer.dias_para_alerta}
              />

              {convites.length > 0 && <ConvitesPendentes convites={convites} />}

              <CrescimentoDaCarteira pontos={graficos.crescimento} />
              <AtividadeDiaria dias={graficos.atividade} />
            </div>

            <div className="min-w-0 space-y-4">
              <TopDeProgressoes progressoes={graficos.progressoes} />
              {/*
              A lista inteira não mora aqui: ela é `/painel/alunos` (doc 06
              §3), com tabela, busca e filtro. O dashboard guarda o que é
              decisão de hoje, e a carteira fica a um clique — no rodapé deste
              cartão, onde o olho termina a coluna.
            */}
              <AtividadeRecente sessoes={atividade} />
              <Link
                href="/painel/alunos"
                className="inline-flex min-h-8 items-center px-1 text-[13px] font-medium text-ink-3 transition hover:text-ink"
              >
                Ver todos os {alunos.length}{" "}
                {alunos.length === 1 ? "aluno" : "alunos"} →
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
}: {
  convites: Awaited<ReturnType<typeof listarConvitesPendentes>>;
}) {
  return (
    <CartaoDoPainel
      titulo={`Convites pendentes · ${convites.length}`}
      apoio="Links enviados que ainda não viraram conta"
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
                {convite.email} · expira em {diasAte(convite.expires_at)}
              </p>
            </div>
            <form action={cancelarConvite}>
              <input type="hidden" name="id" value={convite.id} />
              <button
                type="submit"
                className="inline-flex min-h-8 items-center text-[12.5px] font-medium text-ink-4 transition hover:text-danger"
              >
                Cancelar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </CartaoDoPainel>
  );
}

function VazioSemAluno() {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          Comece convidando um aluno
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          Você gera um link, manda pelo WhatsApp e o aluno cria a conta sozinho.
          Depois é só montar o treino e atribuir a ele.
        </p>
      </div>
      <Link href="/painel/treinos" className={classesDeBotao({ variant: "secondary" })}>
        Ver meus treinos
      </Link>
    </Card>
  );
}

/** "3 dias" / "hoje" — o suficiente para o personal saber se vai expirar. */
function diasAte(iso: string): string {
  const dias = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
  if (dias <= 0) return "hoje";
  if (dias === 1) return "1 dia";
  return `${dias} dias`;
}
