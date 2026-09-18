
import { BotaoSair } from "@/components/botao-sair";
import { NavegacaoLateral } from "@/components/personal/navegacao-lateral";
import { PortaoDeAceite } from "@/components/portao-de-aceite";
import { requireTrainer } from "@/lib/auth/session";
import {
  O_QUE_MUDOU,
  O_QUE_NAO_MUDA,
  VERSAO_DOS_DOCUMENTOS,
} from "@/lib/legal/documentos";
import { aceiteEstaEmDia } from "@/lib/queries/aceite";
import { contarAlunos } from "@/lib/queries/alunos";

import { aceitarAtualizacaoDoPersonal } from "../acoes-de-aceite";

/**
 * Moldura do painel do personal (desktop).
 *
 * Aqui mora a autorização de verdade: `requireTrainer()` confirma que existe
 * linha em `trainers` para o usuário logado. O proxy só evita render à toa.
 *
 * **A moldura é a sidebar colapsável do doc 04**, e não mais a barra no topo.
 * As duas navegam as mesmas páginas — o que muda é a silhueta: com a barra, o
 * painel tinha a forma de um site; com a lateral, a de uma ferramenta. É a
 * diferença que mais salta ao comparar com o protótipo, e a única grande que
 * não dependia de dado novo nenhum.
 */
export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { trainer } = await requireTrainer();

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
    return (
      <div className="min-h-dvh bg-canvas">
        <PortaoDeAceite
          versao={VERSAO_DOS_DOCUMENTOS}
          oQueMudou={O_QUE_MUDOU.personal}
          oQueNaoMuda={O_QUE_NAO_MUDA.personal}
          aoAceitar={aceitarAtualizacaoDoPersonal}
        />
      </div>
    );
  }

  // A contagem vai no marcador de "Alunos", como no protótipo. Leitura barata
  // (`head + count`), não a carteira inteira: o layout roda em toda navegação
  // do painel, e trazer as linhas para contá-las seria pagar a leitura mais
  // cara do produto pela informação mais barata dele.
  const alunos = await contarAlunos();

  return (
    <div className="flex min-h-dvh bg-canvas">
      <NavegacaoLateral
        nome={trainer.name}
        alunos={alunos}
        sair={<BotaoSair />}
      />

      <main className="min-w-0 flex-1 px-8 py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
