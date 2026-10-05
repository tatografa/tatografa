import { NumeroDoTopo } from "@/components/personal/numero-do-topo";
import type { IndicadoresDaCarteira } from "@/lib/domain/carteira";
import { DIAS_DE_ENTRADA } from "@/lib/domain/carteira";
import { plural, preencher } from "@/lib/i18n/texto";

import { usePainel } from "./idioma-do-painel";

/**
 * Os quatro números do topo de `/painel/alunos` (doc 06 §3).
 *
 * **Nenhum é de cobrança.** O protótipo mostra "Renovações · vencendo nos
 * próximos 7 dias" e "24 de 40 vagas do plano"; não existe plano, preço nem
 * pagamento no modelo de dados. Inventar o "40" seria escrever um número falso
 * no lugar mais visível da tela, que é o oposto do que um indicador serve.
 *
 * No lugar de renovações entra **quem precisa de atenção** — a única das quatro
 * que é fila de trabalho, e por isso a única que vira link. Zero não vira link:
 * levar a uma lista vazia é pior que não levar. Ela ocupa a terceira casa, onde
 * o protótipo põe "Renovações", pelo mesmo motivo: é a que pede ação.
 */
export function IndicadoresDaCarteiraNoTopo({
  indicadores,
  diasParaAlerta,
  filtrandoAtencao,
  aoFiltrarAtencao,
}: {
  indicadores: IndicadoresDaCarteira;
  diasParaAlerta: number;
  /** O filtro "N+ dias" da tabela está ligado. */
  filtrandoAtencao: boolean;
  /** Liga e desliga aquele filtro. */
  aoFiltrarAtencao: () => void;
}) {
  const { total, novosNoMes, ativos, fatiaDeAtivos, inativos, precisamDeAtencao } =
    indicadores;
  const n = usePainel().t.alunos.numeros;
  const dias = { dias: DIAS_DE_ENTRADA };

  return (
    <section
      aria-label={n.rotulo}
      className="grid grid-cols-2 gap-3.5 @min-[760px]:grid-cols-4"
    >
      <NumeroDoTopo
        titulo={n.total}
        valor={String(total)}
        apoio={
          novosNoMes === 0
            ? preencher(n.nenhumNovo, dias)
            : preencher(plural(novosNoMes, n.novos), dias)
        }
      />
      <NumeroDoTopo
        titulo={n.ativos}
        valor={String(ativos)}
        apoio={fatiaDeAtivos === null ? n.semBase : preencher(n.daCarteira, { n: fatiaDeAtivos })}
      />
      {/*
        "Precisam de atenção" usa o limiar que o personal configurou em
        /painel/configuracoes, e não um número fixo: é ajuste dele, e o texto
        precisa dizer qual é — "3 alunos" sem o "há 7 dias" não é informação.
        O clique liga o filtro "N+ dias" da tabela logo abaixo, e não leva ao
        painel: mandar para outra página para ver as mesmas pessoas seria um
        clique para longe do que ele queria. Botão com `aria-pressed`, e não
        link, porque o que ele faz é ligar e desligar.
      */}
      <NumeroDoTopo
        titulo={n.atencao}
        valor={String(precisamDeAtencao)}
        apoio={preencher(n.atencaoApoio, { n: diasParaAlerta })}
        destaque={precisamDeAtencao > 0}
        aoClicar={precisamDeAtencao > 0 || filtrandoAtencao ? aoFiltrarAtencao : undefined}
        ativo={filtrandoAtencao}
      />
      <NumeroDoTopo
        titulo={n.inativos}
        valor={String(inativos)}
        apoio={inativos === 0 ? n.ninguemArquivado : n.arquivados}
      />
    </section>
  );
}
