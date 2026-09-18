import {
  crescimentoEmPalavras,
  DIAS_DA_ATIVIDADE,
  DIAS_DAS_PROGRESSOES,
  ehFimDeSemana,
  faixaDeCarga,
  formatarGanho,
  ganhoPercentual,
  linhaDoCrescimento,
  LIMITE_DAS_PROGRESSOES,
  resumoDaAtividade,
  rotuloDoDiaComSemana,
  rotuloDoDiaCurto,
  rotuloDoMes,
  rotuloDoMesPorExtenso,
  type DiaDaAtividade,
  type PontoDoMes,
  type Progressao,
} from "@/lib/domain/dashboard";
import { iniciaisDe } from "@/lib/domain/nome";

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

export function GraficosDoPainel({
  crescimento,
  atividade,
  progressoes,
}: {
  crescimento: PontoDoMes[];
  atividade: DiaDaAtividade[];
  progressoes: Progressao[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <CrescimentoDaCarteira pontos={crescimento} />
        <AtividadeDiaria dias={atividade} />
      </div>
      <TopDeProgressoes progressoes={progressoes} />
    </div>
  );
}

/* ------------------------------------------- evolução mensal de alunos --- */

function CrescimentoDaCarteira({ pontos }: { pontos: PontoDoMes[] }) {
  const linha = linhaDoCrescimento(pontos, LARGURA, ALTURA);
  const atual = pontos.length ? pontos[pontos.length - 1].total : 0;
  const doPrimeiro = pontos.length ? pontos[0].total : 0;
  const variacao = atual - doPrimeiro;

  return (
    <Bloco
      titulo="Evolução mensal de alunos"
      // O acumulado, e não as entradas do mês: com um aluno novo em março e
      // nenhum em abril, "novos por mês" desenharia uma queda onde ninguém saiu.
      resumo={`${atual} ${atual === 1 ? "aluno" : "alunos"} hoje`}
      apoio={
        variacao === 0
          ? `sem mudança em ${pontos.length} meses`
          : `${variacao > 0 ? "+" : "−"}${Math.abs(variacao)} em ${pontos.length} meses`
      }
    >
      {!linha || linha.maximo === 0 ? (
        <Vazio>Nenhum aluno cadastrado ainda.</Vazio>
      ) : (
        <>
          <div className="relative">
            <svg
              viewBox={`0 0 ${LARGURA} ${ALTURA}`}
              className="w-full overflow-visible"
              role="img"
              aria-label={crescimentoEmPalavras(pontos)}
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
                    {rotuloDoMesPorExtenso(ponto.mes)} · {ponto.total}{" "}
                    {ponto.total === 1 ? "aluno" : "alunos"}
                  </Dica>
                </div>
              ))}
            </div>
          </div>

          <Eixo
            rotulos={pontos.map((p) => rotuloDoMes(p.mes))}
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

function AtividadeDiaria({ dias }: { dias: DiaDaAtividade[] }) {
  const { total, diasComTreino, melhorDia } = resumoDaAtividade(dias);
  const maximo = Math.max(1, ...dias.map((d) => d.total));

  return (
    <Bloco
      titulo="Atividade diária"
      resumo={`${total} ${total === 1 ? "treino" : "treinos"}`}
      apoio={`em ${diasComTreino} dos últimos ${DIAS_DA_ATIVIDADE} dias`}
    >
      {total === 0 ? (
        <Vazio>
          Ninguém da carteira concluiu treino nos últimos {DIAS_DA_ATIVIDADE}{" "}
          dias.
        </Vazio>
      ) : (
        <>
          <div
            role="img"
            aria-label={`${total} treinos concluídos em ${diasComTreino} dos últimos ${DIAS_DA_ATIVIDADE} dias${
              melhorDia
                ? `; o dia mais cheio foi ${rotuloDoDiaComSemana(melhorDia.dia)}, com ${melhorDia.total}`
                : ""
            }.`}
            style={{ height: ALTURA }}
            className="flex items-end gap-[2px] border-b border-border-strong"
          >
            {dias.map((dia) => (
              <div key={dia.dia} className="group relative flex h-full flex-1 items-end">
                <div
                  style={{
                    height: dia.total === 0 ? 2 : `${(dia.total / maximo) * 100}%`,
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
                  {rotuloDoDiaComSemana(dia.dia)} · {dia.total}{" "}
                  {dia.total === 1 ? "treino" : "treinos"}
                </Dica>
              </div>
            ))}
          </div>

          <Eixo
            rotulos={dias.map((d) => rotuloDoDiaCurto(d.dia))}
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

function TopDeProgressoes({ progressoes }: { progressoes: Progressao[] }) {
  const ganhos = progressoes.map((p) =>
    ganhoPercentual(p.cargaInicial, p.cargaFinal),
  );
  const maior = Math.max(1, ...ganhos);

  return (
    <Bloco
      titulo={`Top ${LIMITE_DAS_PROGRESSOES} progressões`}
      resumo={
        progressoes.length
          ? `${progressoes.length} ${progressoes.length === 1 ? "evolução" : "evoluções"}`
          : // "—" desenharia um traço grande e solto onde deveria haver uma
            // palavra: o vazio aqui tem explicação logo abaixo, e o número
            // grande precisa combinar com ela.
            "Nenhuma"
      }
      apoio={`nos últimos ${DIAS_DAS_PROGRESSOES} dias`}
    >
      {progressoes.length === 0 ? (
        <Vazio>
          Ainda não há como comparar. Uma progressão aparece aqui quando o mesmo
          exercício, com carga, é executado em dois treinos diferentes dentro
          dos últimos {DIAS_DAS_PROGRESSOES} dias.
        </Vazio>
      ) : (
        // Lista ordenada de verdade: a posição no ranking é conteúdo, e num
        // `<div>` ela existiria só para quem enxerga a ordem na tela.
        <ol className="space-y-2.5">
          {progressoes.map((p, i) => {
            const ganho = ganhos[i];
            return (
              <li
                key={`${p.studentId}-${p.exercicio}`}
                className="flex items-center gap-3"
              >
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[10px] font-bold text-ink-3"
                >
                  {iniciaisDe(p.aluno)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-[13px] font-semibold text-ink">
                      {p.exercicio}{" "}
                      <span className="font-normal text-ink-4">· {p.aluno}</span>
                    </p>
                    <p className="shrink-0 font-mono text-[12px] font-bold text-brand tabular-nums">
                      {formatarGanho(ganho)}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-2.5">
                    {/* A barra é comparação entre as linhas, não o valor em si:
                        o número exato está escrito ao lado, e por isso ela pode
                        ser relativa à maior da lista sem enganar ninguém. */}
                    <div
                      aria-hidden
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-sunken"
                    >
                      <div
                        style={{ width: `${(ganho / maior) * 100}%` }}
                        className="h-full rounded-full bg-brand"
                      />
                    </div>
                    <p className="shrink-0 font-mono text-[11px] text-ink-4 tabular-nums">
                      {faixaDeCarga(p.cargaInicial, p.cargaFinal)} ·{" "}
                      {p.sessoes} treinos
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Bloco>
  );
}

/* ------------------------------------------------------------ pedaços --- */

function Bloco({
  titulo,
  resumo,
  apoio,
  children,
}: {
  titulo: string;
  /** O número grande. É ele que responde a pergunta do bloco sem o gráfico. */
  resumo: string;
  apoio: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-card border border-border bg-surface p-5">
      <header className="space-y-1.5">
        <h3 className="eyebrow text-ink-4">{titulo}</h3>
        <p className="flex items-baseline gap-2">
          <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] text-ink tabular-nums">
            {resumo}
          </span>
          <span className="text-[12.5px] text-ink-4">{apoio}</span>
        </p>
      </header>
      {children}
    </section>
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
