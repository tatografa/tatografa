import { Trophy } from "lucide-react";

import {
  CartaoDoPainel,
  LINHA_DO_CARTAO,
  LINHAS_DO_CARTAO,
} from "@/components/personal/cartao-do-painel";
import { CabecalhoDoGrafico, GraficoDeBarras } from "@/components/grafico-de-barras";
import {
  DIAS_DA_ATIVIDADE,
  DIAS_DAS_PROGRESSOES,
  ehFimDeSemana,
  ganhoPercentual,
  LIMITE_DAS_PROGRESSOES,
  resumoDaAtividade,
  type DiaDaAtividade,
  type PontoDoMes,
  type Progressao,
} from "@/lib/domain/dashboard";
import { rotulosVisiveis } from "@/lib/domain/grafico";
import type { Idioma } from "@/lib/domain/idioma";
import { formatos, type Formatos } from "@/lib/i18n/formatos";
import { TEXTOS_DO_PAINEL, type TextosDoPainel } from "@/lib/i18n/painel";
import { forma, plural, preencher } from "@/lib/i18n/texto";

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
 * Os dois gráficos do doc 06 §2, no desenho de gráfico do produto
 * (`GraficoDeBarras`, 06/10). Os dois são componentes de servidor: a dica do
 * mouse é CSS, e nenhum JavaScript vai ao navegador por causa deles.
 *
 * Barra em `brand` sobre `surface` dá 5,38 de contraste, acima dos 3:1 que a
 * WCAG pede para objeto gráfico. A grade não carrega informação e fica clara.
 */

/* ------------------------------------------- evolução mensal de alunos --- */

export function CrescimentoDaCarteira({ pontos, idioma }: { pontos: PontoDoMes[]; idioma: Idioma }) {
  const t = TEXTOS_DO_PAINEL[idioma];
  const c = t.dashboard.crescimento;
  const f = formatos(idioma);
  const atual = pontos.length ? pontos[pontos.length - 1].total : 0;
  const doPrimeiro = pontos.length ? pontos[0].total : 0;
  const variacao = atual - doPrimeiro;
  const maximo = Math.max(0, ...pontos.map((p) => p.total));

  return (
    <Bloco
      cabecalho={
        <CabecalhoDoGrafico
          titulo={c.titulo}
          apoio={preencher(c.apoio, { n: pontos.length })}
          numero={f.numero(atual)}
          unidade={forma(atual, c.unidade)}
          // O acumulado, e não as entradas do mês: com um aluno novo em março e
          // nenhum em abril, "novos por mês" desenharia uma queda onde ninguém saiu.
          variacao={{
            sentido: variacao > 0 ? "sobe" : variacao < 0 ? "desce" : "neutro",
            texto:
              variacao === 0
                ? c.semMudanca
                : preencher(c.noPeriodo, { sinal: variacao > 0 ? "+" : "−", n: f.numero(Math.abs(variacao)) }),
          }}
        />
      }
    >
      {maximo === 0 ? (
        <Vazio>{c.vazio}</Vazio>
      ) : (
        <GraficoDeBarras
          inteiro
          altura={280}
          formatarMarca={f.numero}
          descricao={crescimentoNoIdioma(pontos, t, f)}
          barras={pontos.map((ponto, i) => ({
            chave: ponto.mes,
            valor: ponto.total,
            rotulo: f.numero(ponto.total),
            eixo: f.mesComAno(ponto.mes),
            // Doze rótulos "nov/25" só cabem a partir de uns 520px de gráfico;
            // abaixo disso fica um sim, um não, sempre com o mês atual.
            eixoSecundario: (pontos.length - 1 - i) % 2 === 1,
            dica: { titulo: f.mesPorExtenso(ponto.mes), texto: plural(ponto.total, t.comum.alunos) },
          }))}
        />
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
  // Trinta datas não cabem: de cinco em cinco, com o último dia sempre. Num
  // cartão estreito, um sim, um não desses, senão os dois últimos se encavalam.
  const visiveis = [...rotulosVisiveis(dias.length, 7)].sort((x, y) => x - y);
  const secundarios = new Set(visiveis.filter((_, j) => j % 2 === 1 && j !== visiveis.length - 1));

  return (
    <Bloco
      cabecalho={
        <CabecalhoDoGrafico
          titulo={a.titulo}
          apoio={preencher(a.apoio, { n: DIAS_DA_ATIVIDADE })}
          numero={f.numero(total)}
          unidade={forma(total, a.unidade)}
          // Não há janela anterior guardada para comparar, então a pílula não é
          // variação: é em quantos dias aqueles treinos aconteceram.
          variacao={
            total > 0
              ? { sentido: "neutro", texto: preencher(a.emDias, { dias: plural(diasComTreino, t.comum.dias) }) }
              : undefined
          }
        />
      }
    >
      {total === 0 ? (
        <Vazio>{preencher(a.vazio, { n: DIAS_DA_ATIVIDADE })}</Vazio>
      ) : (
        <GraficoDeBarras
          inteiro
          altura={200}
          rotulosSoNoLargo
          formatarMarca={f.numero}
          descricao={`${preencher(a.descricao, {
            treinos: plural(total, t.comum.treinos),
            dias: diasComTreino,
            n: DIAS_DA_ATIVIDADE,
          })}${
            melhorDia ? preencher(a.melhorDia, { dia: f.diaComSemana(melhorDia.dia), n: melhorDia.total }) : ""
          }.`}
          barras={dias.map((dia, i) => ({
            chave: dia.dia,
            valor: dia.total,
            rotulo: dia.total > 0 ? f.numero(dia.total) : undefined,
            eixo: visiveis.includes(i) ? f.diaCurto(dia.dia) : undefined,
            eixoSecundario: secundarios.has(i),
            suave: ehFimDeSemana(dia.dia),
            dica: { titulo: f.diaComSemana(dia.dia), texto: plural(dia.total, t.comum.treinos) },
          }))}
        />
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

/**
 * O cartão dos gráficos, no desenho da referência de 06/10: o cabeçalho é do
 * próprio gráfico (título, número grande e pílula), e não o selo com fio dos
 * outros blocos — o número grande é a resposta, e ele precisa de espaço.
 *
 * Sem `overflow-hidden`: a dica das barras das pontas sai por cima da borda.
 */
function Bloco({ cabecalho, children }: { cabecalho: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="min-w-0 space-y-4 rounded-[12px] border border-border bg-surface p-6">
      {cabecalho}
      {children}
    </section>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card bg-canvas-sunken px-4 py-6 text-center text-[13px] leading-relaxed text-ink-3">
      {children}
    </p>
  );
}
