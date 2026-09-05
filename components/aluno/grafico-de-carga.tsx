"use client";

import { useId, useState } from "react";

import {
  dataCurta,
  formatarCarga,
  linhaDoGrafico,
  tendenciaEmPalavras,
  textoDaSerie,
  type SessaoDoExercicio,
} from "@/lib/domain/progresso";
import { cn } from "@/lib/utils";

/**
 * Coordenadas internas do SVG. O desenho escala com a largura da tela; estes
 * números são a proporção, não pixels.
 */
const LARGURA = 360;
const ALTURA = 150;

/**
 * O gráfico de carga por sessão. SVG à mão, sem biblioteca — decisão do brief
 * do M2, não do card.
 *
 * O eixo é cronológico (mais antigo à esquerda), ao contrário das listas da
 * tela, que são mais-recente-primeiro: inverter o eixo inverteria o significado
 * de uma linha subindo, que é justamente o que esta tela existe para mostrar.
 *
 * **Os pontos não são clicáveis no SVG.** As faixas de toque são botões HTML
 * sobrepostos, uma por sessão, ocupando a altura inteira do gráfico. Um
 * `<circle>` de raio grande o bastante para 44px se sobreporia ao vizinho já na
 * sexta sessão; a faixa vertical não se sobrepõe nunca, dá foco de teclado de
 * graça e continua sendo um botão de verdade para o leitor de tela.
 */
export function GraficoDeCarga({
  nome,
  sessoes,
}: {
  nome: string;
  sessoes: SessaoDoExercicio[];
}) {
  const idDoTitulo = useId();
  const [aberta, setAberta] = useState<string | null>(null);

  const linha = linhaDoGrafico(sessoes, LARGURA, ALTURA);

  if (!linha) {
    return (
      <p className="rounded-card bg-canvas-sunken p-4 text-[13px] leading-relaxed text-ink-3">
        Este exercício é de peso corporal: não há carga para desenhar. As
        repetições de cada série estão na planilha.
      </p>
    );
  }

  const { pontos, minimo, maximo, caminho } = linha;
  const selecionada = pontos.find((p) => p.sessao.sessaoId === aberta);
  const larguraDaFaixa = 100 / pontos.length;

  return (
    <div className="space-y-3">
      {/* "mín" e "máx" escritos por extenso: sem eles, dois números nas pontas
          de uma linha do tempo se leem como o primeiro e o último treino — e o
          mínimo quase nunca é o da esquerda. */}
      <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.06em] text-ink-5">
        <span>mín {formatarCarga(minimo)}</span>
        <span>máx {formatarCarga(maximo)}</span>
      </div>

      <div className="relative">
        {/* `overflow-visible`: a linha vai de borda a borda (doc 05), então o
            primeiro e o último ponto ficam em cima da borda do viewBox e
            seriam cortados pela metade. */}
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="w-full overflow-visible"
          role="img"
          aria-labelledby={idDoTitulo}
        >
          <title id={idDoTitulo}>{tendenciaEmPalavras(nome, sessoes)}</title>

          <path
            d={caminho}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {pontos.map((ponto) => {
            const destacado = ponto.sessao.sessaoId === aberta;
            return (
              <circle
                key={ponto.sessao.sessaoId}
                cx={ponto.x}
                cy={ponto.y}
                r={destacado ? 6 : 4}
                fill={destacado ? "var(--color-brand)" : "var(--color-surface)"}
                stroke="var(--color-brand)"
                strokeWidth={2.5}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* As faixas de toque. Uma por sessão, altura inteira, sem sobreposição. */}
        <div className="absolute inset-0 flex">
          {pontos.map((ponto) => (
            <button
              key={ponto.sessao.sessaoId}
              type="button"
              onClick={() =>
                setAberta((atual) =>
                  atual === ponto.sessao.sessaoId ? null : ponto.sessao.sessaoId,
                )
              }
              aria-pressed={ponto.sessao.sessaoId === aberta}
              style={{ width: `${larguraDaFaixa}%` }}
              className={cn(
                "h-full rounded-[6px] transition",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                ponto.sessao.sessaoId === aberta && "bg-brand-tint",
              )}
            >
              <span className="sr-only">
                {dataCurta(ponto.sessao.concluidaEm)}: {formatarCarga(ponto.carga)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Datas pontos={pontos} />

      {selecionada ? (
        <section
          aria-label={`Séries de ${dataCurta(selecionada.sessao.concluidaEm)}`}
          className="rounded-card border border-border-soft bg-surface p-3.5"
        >
          {/* Sem o utilitário `eyebrow` aqui: ele deixa tudo em caixa alta e
              "57,5 KG" não é como se escreve quilo. */}
          <p className="font-mono text-[11px] font-semibold tracking-[0.06em] text-ink-4">
            {dataCurta(selecionada.sessao.concluidaEm)} ·{" "}
            {formatarCarga(selecionada.carga)}
          </p>
          <ul className="mt-2.5 space-y-1">
            {selecionada.sessao.series.map((serie) => (
              <li
                key={serie.set_number}
                className="flex items-baseline justify-between text-[13px] tabular-nums"
              >
                <span className="text-ink-4">Série {serie.set_number}</span>
                <span className="font-semibold text-ink">
                  {textoDaSerie(serie)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-center text-[12px] text-ink-5">
          Toque num ponto para ver as séries daquele dia.
        </p>
      )}
    </div>
  );
}

/**
 * As datas do eixo horizontal.
 *
 * No máximo quatro rótulos: com doze sessões numa tela de 390px eles se
 * sobrepõem e viram borrão. O primeiro e o último sempre aparecem — são as
 * pontas que dão sentido à linha; a data exata de cada ponto sai no painel de
 * baixo, ao tocar.
 */
function Datas({ pontos }: { pontos: { x: number; sessao: SessaoDoExercicio }[] }) {
  if (!pontos.length) return null;

  const passo = Math.max(1, Math.ceil((pontos.length - 1) / 3));
  const visiveis = new Set<number>([0, pontos.length - 1]);
  for (let i = 0; i < pontos.length; i += passo) visiveis.add(i);

  return (
    <div className="flex justify-between font-mono text-[10px] tracking-[0.04em] text-ink-5">
      {[...visiveis]
        .sort((a, b) => a - b)
        .map((indice) => (
          <span key={pontos[indice].sessao.sessaoId}>
            {dataCurta(pontos[indice].sessao.concluidaEm)}
          </span>
        ))}
    </div>
  );
}
