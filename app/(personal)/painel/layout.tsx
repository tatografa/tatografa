
import { cookies } from "next/headers";
import Link from "next/link";

import { BotaoSair } from "@/components/botao-sair";
import { ProvedorDoPainel } from "@/components/personal/idioma-do-painel";
import { NavegacaoLateral } from "@/components/personal/navegacao-lateral";
import { PortaoDeAceite } from "@/components/portao-de-aceite";
import { requireTrainer } from "@/lib/auth/session";
import {
  O_QUE_MUDOU,
  O_QUE_NAO_MUDA,
  VERSAO_DOS_DOCUMENTOS,
} from "@/lib/legal/documentos";
import { aceiteEstaEmDia } from "@/lib/queries/aceite";
import { langDe } from "@/lib/domain/idioma";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { preencher } from "@/lib/i18n/texto";
import { oQueMudouDoPersonalNoIdioma } from "@/lib/legal/por-idioma";
import { iniciaisDe } from "@/lib/domain/nome";
import { COOKIE_DA_BARRA_RECOLHIDA } from "@/lib/domain/painel";
import { contarAlunos } from "@/lib/queries/alunos";

import { aceitarAtualizacaoDoPersonal } from "../acoes-de-aceite";

/**
 * Moldura do painel do personal (desktop).
 *
 * Aqui mora a autorização de verdade: `requireTrainer()` confirma que existe
 * linha em `trainers` para o usuário logado. O proxy só evita render à toa.
 *
 * **A moldura é a do protótipo** (`Painel do Personal - Dashboard.dc.html`,
 * medido no código dele em 27/09): fundo cinza, e sobre ele dois cartões
 * brancos de cantos de 20px, afastados 13px da janela e 11px um do outro — a
 * navegação à esquerda e a página à direita.
 *
 * **Uma diferença deliberada:** no protótipo a janela não rola, rola o cartão
 * de dentro. Aqui quem rola é a janela, e a sidebar fica pregada com
 * `sticky`. Com rolagem interna, trocar de página pelo menu manteria a posição
 * da página anterior, o botão voltar do navegador não devolveria ao ponto onde
 * se estava, e a busca da página (Ctrl+F) rolaria o contêiner errado. Parado,
 * o desenho é o mesmo; a diferença só aparece rolando — o fim do cartão tem os
 * cantos arredondados embaixo do conteúdo, e não embaixo da janela.
 */
export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { trainer } = await requireTrainer();
  // O idioma do painel (etapa 3): o mesmo cookie do app e da landing.
  const { idioma, t } = await textosDoPainel();

  /*
   * O portão de re-aceite, agora também deste lado (decisão do Otávio, 17/09).
   * Mora no layout pelo mesmo motivo que `requireTrainer()` mora: é o único
   * lugar por onde toda tela do painel passa, e num componente de página ele
   * seria contornável por uma URL digitada.
   *
   * `/termos` e `/privacidade` ficam fora deste grupo de rotas de propósito —
   * ler o que se está aceitando não pode depender de aceitar.
   */
  if (!(await aceiteEstaEmDia(trainer.id))) {
    const traducao = oQueMudouDoPersonalNoIdioma(idioma);
    return (
      <div lang={langDe(idioma)} className="min-h-dvh bg-canvas">
        <PortaoDeAceite
          versao={VERSAO_DOS_DOCUMENTOS}
          oQueMudou={traducao?.oQueMudou ?? O_QUE_MUDOU.personal}
          oQueNaoMuda={traducao?.oQueNaoMuda ?? O_QUE_NAO_MUDA.personal}
          aoAceitar={aceitarAtualizacaoDoPersonal}
          textos={t.portao}
        />
      </div>
    );
  }

  // A contagem vai no marcador de "Alunos", como no protótipo. Leitura barata
  // (`head + count`), não a carteira inteira: o layout roda em toda navegação
  // do painel, e trazer as linhas para contá-las seria pagar a leitura mais
  // cara do produto pela informação mais barata dele.
  const alunos = await contarAlunos();
  const recolhida = (await cookies()).get(COOKIE_DA_BARRA_RECOLHIDA)?.value === "1";

  return (
    <ProvedorDoPainel idioma={idioma} textos={t}>
    <div lang={langDe(idioma)} className="flex min-h-dvh items-start gap-[11px] bg-canvas-sunken p-[13px]">
      <NavegacaoLateral
        nome={trainer.name}
        alunos={alunos}
        recolhidaInicial={recolhida}
        sair={
          <BotaoSair
            apenasIcone
            rotulo={t.comum.nav.sairDaConta}
            rotuloSaindo={t.comum.nav.saindo}
          />
        }
      />

      {/*
        O cartão da página. `relative` por causa do avatar, e `px-7 pb-8` é o
        respiro do corpo — o cabeçalho de cada página (`CabecalhoDaPagina`)
        sangra por cima dele para levar a linha de borda a borda.
      */}
      <main className="relative min-h-[calc(100dvh-26px)] min-w-0 flex-1 rounded-[20px] bg-surface px-7 pb-8 shadow-xs">
        {/*
          O avatar mora aqui e não no cabeçalho de cada página: é o único
          lugar que já conhece o nome do personal, e as telas que são
          componente cliente não conseguiriam buscá-lo. Ele se alinha ao
          cabeçalho pela altura — 90px de cabeçalho, 40px de avatar, 25px do
          topo —, e é por isso que o cabeçalho tem altura fixa e não quebra
          linha. Leva às configurações, que é onde a conta mora.
        */}
        <Link
          href="/painel/configuracoes"
          aria-label={preencher(t.comum.nav.suaContaDe, { nome: trainer.name })}
          title={trainer.name}
          className="absolute top-[25px] right-7 z-10 flex size-10 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white transition hover:opacity-85"
        >
          {iniciaisDe(trainer.name)}
        </Link>

        {children}
      </main>
    </div>
    </ProvedorDoPainel>
  );
}
