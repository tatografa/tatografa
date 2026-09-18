import Link from "next/link";

import type { IndicadoresDaCarteira } from "@/lib/domain/carteira";
import { DIAS_DE_ENTRADA } from "@/lib/domain/carteira";

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
 * levar a uma lista vazia é pior que não levar. Mesma regra do quarto indicador
 * do dashboard.
 */
export function IndicadoresDaCarteiraNoTopo({
  indicadores,
  diasParaAlerta,
}: {
  indicadores: IndicadoresDaCarteira;
  diasParaAlerta: number;
}) {
  const { total, novosNoMes, ativos, fatiaDeAtivos, inativos, precisamDeAtencao } =
    indicadores;

  return (
    <section
      aria-label="Resumo da carteira"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Indicador
        rotulo="Total de alunos"
        valor={total}
        apoio={
          novosNoMes === 0
            ? `nenhum novo em ${DIAS_DE_ENTRADA} dias`
            : `${novosNoMes} ${novosNoMes === 1 ? "novo" : "novos"} em ${DIAS_DE_ENTRADA} dias`
        }
      />
      <Indicador
        rotulo="Ativos"
        valor={ativos}
        apoio={fatiaDeAtivos === null ? "sem base para medir" : `${fatiaDeAtivos}% da carteira`}
      />
      <Indicador
        rotulo="Inativos"
        valor={inativos}
        apoio={inativos === 0 ? "ninguém arquivado" : "arquivados por você"}
      />
      {/*
        "Precisam de atenção" usa o limiar que o personal configurou em
        /painel/configuracoes, e não um número fixo: é ajuste dele, e o texto
        precisa dizer qual é — "3 alunos" sem o "há 7 dias" não é informação.
      */}
      <Indicador
        rotulo="Precisam de atenção"
        valor={precisamDeAtencao}
        apoio={`sem treinar há ${diasParaAlerta} dias ou mais`}
        destaque={precisamDeAtencao > 0}
        href={precisamDeAtencao > 0 ? "/painel" : undefined}
      />
    </section>
  );
}

function Indicador({
  rotulo,
  valor,
  apoio,
  destaque = false,
  href,
}: {
  rotulo: string;
  valor: number;
  apoio: string;
  destaque?: boolean;
  href?: string;
}) {
  const conteudo = (
    <>
      <p className="eyebrow text-ink-4">{rotulo}</p>
      <p
        className={`text-[26px] font-extrabold leading-none tracking-[-0.02em] tabular-nums ${
          destaque ? "text-brand" : "text-ink"
        }`}
      >
        {valor}
      </p>
      <p className="text-[12px] text-ink-4">{apoio}</p>
    </>
  );

  const classe =
    "block space-y-2 rounded-card border border-border bg-surface px-4 py-3.5";

  return href ? (
    <Link href={href} className={`${classe} transition hover:border-border-strong hover:bg-canvas-sunken`}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  );
}
