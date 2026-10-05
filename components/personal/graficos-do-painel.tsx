import { Trophy } from "lucide-react";

import {
  CartaoDoPainel,
  LINHA_DO_CARTAO,
  LINHAS_DO_CARTAO,
} from "@/components/personal/cartao-do-painel";
import {
  DIAS_DA_ATIVIDADE,
  DIAS_DAS_PROGRESSOES,
  ehFimDeSemana,
  ganhoPercentual,
  linhaDoCrescimento,
  LIMITE_DAS_PROGRESSOES,
  resumoDaAtividade,
  type DiaDaAtividade,
  type PontoDoMes,
  type Progressao,
} from "@/lib/domain/dashboard";
import type { Idioma } from "@/lib/domain/idioma";
import { formatos, type Formatos } from "@/lib/i18n/formatos";
import { TEXTOS_DO_PAINEL, type TextosDoPainel } from "@/lib/i18n/painel";
import { plural, preencher } from "@/lib/i18n/texto";

/**
 * A frase inteira do gráfico de crescimento, para o `aria-label` — a mesma conta
 * de `crescimentoEmPalavras` (`lib/domain/dashboard.ts`), no idioma do painel.
 */
function crescimentoNoIdioma(pontos: PontoDoMes[], t: TextosDoPainel, f: Formatos): string {
  const c = t.dashboard.crescimento;
  if (!pontos.length) return c.semHistorico;
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const variacao = ultimo.total - primeiro.total;
  const agora = preencher(c.agora, {
    alunos: plural(ultimo.total, t.comum.alunos),
    mes: f.mesPorExtenso(ultimo.mes),
  });
  const mes = f.mesPorExtenso(primeiro.mes);
  if (variacao === 0) return preencher(c.igual, { agora, mes });
  return preencher(variacao > 0 ? c.maisQue : c.menosQue, { agora, n: Math.abs(variacao), mes });
}

/*
 * Os três gráficos do doc 06 §2.
 *
 * **Os três são componentes de servidor, sem uma linha de JavaScript no
 * navegador.** A dica que aparece ao passar o mouse é CSS (`group-hover`), não
 * estado: um gráfico de leitura que não muda de filtro não paga o custo de
 * virar cliente — e no painel, que abre em toda navegação, isso é peso em toda
 * visita para um recurso que o teclado não usa.
 *
 * Por isso **o que o mouse revela nunca é a única via para o número**: cada
 * bloco imprime em texto o que o gráfico desenha (quantos alunos hoje, quantos
 * treinos na janela e em quantos dias, e a carga de cada progressão), e o SVG
 * leva a frase inteira no `aria-label`. Quem lê com leitor de tela ou com o
 * teclado recebe o conteúdo, não um retângulo mudo.
 *
 * Todos desenham em `brand` sobre `surface` — 5,38 de contraste, bem acima dos
 * 3:1 que a WCAG pede para objeto gráfico. O trilho e a linha de base ficam em
 * `border-strong`, que não alcança 3:1 e não precisa: eles não carregam
 * informação nenhuma, quem carrega é a barra.
 */

/** Coordenadas internas do SVG: proporção, não pixels. */
const LARGURA = 360;
const ALTURA = 120;

/* ------------------------------------------- evolução mensal de alunos --- */

export function CrescimentoDaCarteira({ pontos, idioma }: { pontos: PontoDoMes[]; idioma: Idioma }) {
  const t = TEXTOS_DO_PAINEL[idioma];
  const c = t.dashboard.crescimento;
  const f = formatos(idioma);
  const linha = linhaDoCrescimento(pontos, LARGURA, ALTURA);
  const atual = pontos.length ? pontos[pontos.length - 1].total : 0;
  const doPrimeiro = pontos.length ? pontos[0].total : 0;
  const variacao = atual - doPrimeiro;

  return (
    <Bloco
      titulo={c.titulo}
      apoio={preencher(c.apoio, { n: pontos.length })}
      // O acumulado, e não as entradas do mês: com um aluno novo em março e
      // nenhum em abril, "novos por mês" desenharia uma queda onde ninguém saiu.
      resumo={`${plural(atual, t.comum.alunos)} · ${
        variacao === 0
          ? c.semMudanca
          : preencher(c.noPeriodo, { sinal: variacao > 0 ? "+" : "−", n: Math.abs(variacao) })
      }`}
    >
      {!linha || linha.maximo === 0 ? (
        <Vazio>{c.vazio}</Vazio>
      ) : (
        <>
          <div className="relative">
            <svg
              viewBox={`0 0 ${LARGURA} ${ALTURA}`}
              className="w-full overflow-visible"
              role="img"
              aria-label={crescimentoNoIdioma(pontos, t, f)}
            >
              <path d={linha.area} fill="var(--color-brand-tint)" />
              <path
                d={linha.caminho}
                fill="none"
                stroke="var(--color-brand)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {linha.pontos.map((p) => (
                <circle
                  key={p.ponto.mes}
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill="var(--color-surface)"
                  stroke="var(--color-brand)"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* As faixas do mouse: uma por mês, altura inteira, sem sobreposição. */}
            <div className="absolute inset-0 flex" aria-hidden>
              {pontos.map((ponto) => (
                <div key={ponto.mes} className="group relative flex-1">
                  <div className="h-full rounded-[6px] transition group-hover:bg-canvas-sunken/60" />
                  <Dica>
                    {f.mesPorExtenso(ponto.mes)} · {plural(ponto.total, t.comum.alunos)}
                  </Dica>
                </div>
              ))}
            </div>
          </div>

          <Eixo
            rotulos={pontos.map((p) => f.mesCurto(p.mes))}
            // Doze rótulos de três letras se encavalam numa coluna de metade da
            // tela; um sim, um não mantém o começo, o meio e o fim legíveis.
            passo={2}
            alinhamento="pontos"
          />
        </>
      )}
    </Bloco>
  );
}

/* --------------------------------------------------- atividade diária --- */

export function AtividadeDiaria({ dias, idioma }: { dias: DiaDaAtividade[]; idioma: Idioma }) {
  const t = TEXTOS_DO_PAINEL[idioma];
  const a = t.dashboard.atividade;
  const f = formatos(idioma);
  const { total, diasComTreino, melhorDia } = resumoDaAtividade(dias);
  const maximo = Math.max(1, ...dias.map((d) => d.total));

  return (
    <Bloco
      titulo={a.titulo}
      apoio={preencher(a.apoio, { n: DIAS_DA_ATIVIDADE })}
      resumo={preencher(a.resumo, {
        treinos: plural(total, t.comum.treinos),
        dias: plural(diasComTreino, t.comum.dias),
      })}
    >
      {total === 0 ? (
        <Vazio>
          {preencher(a.vazio, { n: DIAS_DA_ATIVIDADE })}
        </Vazio>
      ) : (
        <>
          <div
            role="img"
            aria-label={`${preencher(a.descricao, {
              treinos: plural(total, t.comum.treinos),
              dias: diasComTreino,
              n: DIAS_DA_ATIVIDADE,
            })}${
              melhorDia
                ? preencher(a.melhorDia, { dia: f.diaComSemana(melhorDia.dia), n: melhorDia.total })
                : ""
            }.`}
            style={{ height: ALTURA }}
            className="flex items-end gap-[2px] border-b border-border-strong"
          >
            {dias.map((dia) => (
              <div
                key={dia.dia}
                className="group relative flex h-full flex-1 items-end"
              >
                <div
                  style={{
                    height:
                      dia.total === 0 ? 2 : `${(dia.total / maximo) * 100}%`,
                  }}
                  className={`w-full rounded-t-[3px] transition ${
                    dia.total === 0
                      ? // O toco do dia vazio não é dado: é a marca de que
                        // existe um dia ali. Quem diz "ninguém treinou" é o
                        // buraco entre as barras e a frase acima delas.
                        "bg-border-strong"
                      : ehFimDeSemana(dia.dia)
                        ? "bg-brand/55 group-hover:bg-brand"
                        : "bg-brand group-hover:bg-brand-hover"
                  }`}
                />
                <Dica>
                  {f.diaComSemana(dia.dia)} · {plural(dia.total, t.comum.treinos)}
                </Dica>
              </div>
            ))}
          </div>

          <Eixo
            rotulos={dias.map((d) => f.diaCurto(d.dia))}
            // Trinta datas não cabem: de cinco em cinco dá seis marcas, que é o
            // que basta para localizar uma barra no mês.
            passo={5}
            alinhamento="barras"
          />
        </>
      )}
    </Bloco>
  );
}

/* ------------------------------------------------ top 10 progressões ---- */

export function TopDeProgressoes({
  progressoes,
  idioma,
}: {
  progressoes: Progressao[];
  idioma: Idioma;
}) {
  const tp = TEXTOS_DO_PAINEL[idioma].dashboard.progressoes;
  const f = formatos(idioma);
  return (
    <CartaoDoPainel
      titulo={preencher(tp.titulo, { n: LIMITE_DAS_PROGRESSOES })}
      apoio={preencher(tp.apoio, { n: DIAS_DAS_PROGRESSOES })}
      Icone={Trophy}
    >
      {progressoes.length === 0 ? (
        <p
          className={`text-[13px] leading-relaxed text-ink-3 ${LINHA_DO_CARTAO}`}
        >
          {preencher(tp.vazio, { n: DIAS_DAS_PROGRESSOES })}
        </p>
      ) : (
        // Lista ordenada de verdade: a posição no ranking é conteúdo, e num
        // `<div>` ela existiria só para quem enxerga a ordem na tela.
        <ol className={LINHAS_DO_CARTAO}>
          {progressoes.map((p, i) => (
            <li
              key={`${p.studentId}-${p.exercicio}`}
              className={`flex items-center gap-3 ${LINHA_DO_CARTAO}`}
            >
              {/* O número da posição é o da `<ol>`, que o leitor de tela já
                  anuncia; este é o desenho dele. Os três primeiros em
                  `brand`, como no protótipo. */}
              <span
                aria-hidden
                className={`w-[22px] shrink-0 text-center text-[13px] font-semibold tabular-nums ${
                  i < 3 ? "text-brand" : "text-ink-5"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">
                  {p.aluno}
                </p>
                <p className="truncate text-[12px] text-ink-4">{p.exercicio}</p>
              </div>
              {/*
                Em percentual, não em quilos como no protótipo ("+20kg"): em
                quilos o agachamento ganha de toda rosca direta todo mês, e o
                ranking vira de exercício pesado em vez de evolução (18/09). A
                carga de onde para onde vai embaixo, para o número ter chão.
                Verde é certo aqui, ao contrário da medida do corpo: carga que
                sobe é progressão para qualquer objetivo.
              */}
              <div className="shrink-0 text-right">
                <p className="text-[12.5px] font-semibold text-success tabular-nums">
                  +{f.numero(Math.round(ganhoPercentual(p.cargaInicial, p.cargaFinal) * 10) / 10)}%
                </p>
                <p className="text-[11px] text-ink-5 tabular-nums">
                  {f.numero(p.cargaInicial)} → {f.carga(p.cargaFinal)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </CartaoDoPainel>
  );
}

/* ------------------------------------------------------------ pedaços --- */

function Bloco({
  titulo,
  apoio,
  resumo,
  children,
}: {
  titulo: string;
  apoio: string;
  /**
   * A resposta do bloco em palavras, na pílula ao lado do título — onde o
   * protótipo põe o "+71% no ano". É ela que responde a pergunta sem o gráfico.
   */
  resumo: string;
  children: React.ReactNode;
}) {
  return (
    <CartaoDoPainel
      titulo={titulo}
      apoio={apoio}
      lateral={
        <p className="rounded-full bg-canvas px-2.5 py-1 text-[12px] font-medium text-ink-2 tabular-nums">
          {resumo}
        </p>
      }
    >
      <div className="space-y-2 p-[18px] pt-8">{children}</div>
    </CartaoDoPainel>
  );
}

/**
 * A dica do mouse. CSS puro: sem estado, sem cliente, sem hidratação.
 *
 * `aria-hidden` no pai e `pointer-events-none` aqui — ela repete, em cima do
 * gráfico, um número que já está no `aria-label` e no texto do bloco. Uma dica
 * que rouba o ponteiro faria a faixa vizinha parar de responder.
 */
function Dica({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-[7px] bg-ink px-2 py-1 font-mono text-[10.5px] text-surface group-hover:block">
      {children}
    </span>
  );
}

/**
 * Os rótulos do eixo horizontal, um a cada `passo`.
 *
 * Posicionados **na fração exata** do item que nomeiam, não distribuídos por
 * `justify-between`. Com trinta barras e sete rótulos, espaçar por igual põe
 * "09/09" debaixo de outra barra — e o eixo passa a apontar para o dia errado,
 * que é pior que não ter eixo. A conta muda com a forma: a barra ocupa uma
 * faixa e o rótulo vai no meio dela; o ponto da linha é uma coordenada e o
 * rótulo vai em cima dele.
 */
function Eixo({
  rotulos,
  passo,
  alinhamento,
}: {
  rotulos: string[];
  passo: number;
  alinhamento: "barras" | "pontos";
}) {
  const ultimo = rotulos.length - 1;
  const fracao = (i: number) =>
    alinhamento === "barras"
      ? ((i + 0.5) / rotulos.length) * 100
      : ultimo === 0
        ? 50
        : (i / ultimo) * 100;

  return (
    <div
      aria-hidden
      className="relative h-4 font-mono text-[10px] tracking-[0.04em] text-ink-5"
    >
      {rotulos
        .map((rotulo, i) => ({ rotulo, i }))
        .filter(({ i }) => i % passo === 0 || i === ultimo)
        .map(({ rotulo, i }) => (
          <span
            key={`${rotulo}-${i}`}
            style={{
              left: `${fracao(i)}%`,
              // As pontas encostam na borda do bloco: centrá-las jogaria metade
              // do rótulo para fora do card.
              transform:
                i === 0
                  ? "translateX(0)"
                  : i === ultimo
                    ? "translateX(-100%)"
                    : "translateX(-50%)",
            }}
            className="absolute top-0 whitespace-nowrap"
          >
            {rotulo}
          </span>
        ))}
    </div>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card bg-canvas-sunken px-4 py-6 text-center text-[13px] leading-relaxed text-ink-3">
      {children}
    </p>
  );
}
