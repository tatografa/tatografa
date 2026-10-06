"use client";

import { useState } from "react";

import { CabecalhoDoGrafico, GraficoDeBarras } from "@/components/grafico-de-barras";
import { rotulosVisiveis } from "@/lib/domain/grafico";
import { INTERVALOS, type Intervalo, sessoesComCarga, type SessaoDoExercicio } from "@/lib/domain/progresso";
import { tendenciaNoIdioma, textoDaSerieNoIdioma } from "@/lib/i18n/app/frases";
import { preencher } from "@/lib/i18n/texto";
import { cn } from "@/lib/utils";

import { useIdioma } from "./idioma-do-app";

/**
 * Até quantas barras o número cabe em cima de cada uma numa tela de 390px.
 * Com mais, "102,5" encavala no vizinho: o número fica só na barra escolhida,
 * na dica e no painel de séries embaixo.
 */
const BARRAS_COM_NUMERO = 8;

/**
 * O gráfico de carga por sessão, no desenho de gráfico do produto
 * (`GraficoDeBarras`, 06/10). Era uma linha até 06/10.
 *
 * **O eixo começa no zero**, ao contrário da linha, que escalava entre o mínimo
 * e o máximo para a mudança aparecer. Em barra isso mentiria: a de 60 kg teria
 * o dobro da de 55. O que mostra a diferença pequena agora é o número escrito
 * em cima de cada barra e a pílula "+5 kg no período".
 *
 * O eixo é cronológico (mais antigo à esquerda), ao contrário das listas da
 * tela, que são mais-recente-primeiro: inverter o eixo inverteria o significado
 * de uma barra crescendo, que é justamente o que esta tela existe para mostrar.
 *
 * **Cada barra é um botão** que ocupa a coluna inteira: alvo de toque grande,
 * foco de teclado de graça, e nome para o leitor de tela.
 */
export function GraficoDeCarga({
  nome,
  sessoes,
}: {
  nome: string;
  sessoes: SessaoDoExercicio[];
}) {
  const [aberta, setAberta] = useState<string | null>(null);
  const { t, f } = useIdioma();
  const p = t.historico.progresso;

  const comCarga = sessoesComCarga(sessoes);

  if (!comCarga.length) {
    return (
      <p className="rounded-card bg-canvas-sunken p-4 text-[13px] leading-relaxed text-ink-3">
        {p.semCarga}
      </p>
    );
  }

  const selecionada = comCarga.find((s) => s.sessaoId === aberta);
  const primeira = comCarga[0].cargaMaxima;
  const ultima = comCarga[comCarga.length - 1].cargaMaxima;
  const variacao = ultima - primeira;
  const comNumero = comCarga.length <= BARRAS_COM_NUMERO;
  const visiveis = rotulosVisiveis(comCarga.length, 4);

  return (
    <div className="space-y-4">
      <CabecalhoDoGrafico
        Titulo="h3"
        compacto
        titulo={p.graficoTitulo}
        apoio={p.graficoApoio}
        numero={f.numero(ultima)}
        unidade="kg"
        variacao={
          comCarga.length > 1
            ? {
                sentido: variacao > 0 ? "sobe" : variacao < 0 ? "desce" : "neutro",
                texto:
                  variacao === 0
                    ? p.semMudanca
                    : preencher(p.noPeriodo, { sinal: variacao > 0 ? "+" : "−", carga: f.carga(Math.abs(variacao)) }),
              }
            : undefined
        }
      />

      <GraficoDeBarras
        altura={180}
        formatarMarca={f.numero}
        descricao={tendenciaNoIdioma(nome, sessoes, p, f)}
        barras={comCarga.map((sessao, i) => ({
          chave: sessao.sessaoId,
          valor: sessao.cargaMaxima,
          rotulo: comNumero || sessao.sessaoId === aberta ? f.numero(sessao.cargaMaxima) : undefined,
          eixo: visiveis.has(i) ? f.dataCurta(sessao.concluidaEm) : undefined,
          dica: { titulo: f.dataCurta(sessao.concluidaEm), texto: f.carga(sessao.cargaMaxima) },
          selecionada: sessao.sessaoId === aberta,
          nome: `${f.dataCurta(sessao.concluidaEm)}: ${f.carga(sessao.cargaMaxima)}`,
          aoEscolher: () => setAberta((atual) => (atual === sessao.sessaoId ? null : sessao.sessaoId)),
        }))}
      />

      {selecionada ? (
        <section
          aria-label={preencher(p.seriesDe, { data: f.dataCurta(selecionada.concluidaEm) })}
          className="rounded-card border border-border-soft bg-surface p-3.5"
        >
          {/* Sem o utilitário `eyebrow` aqui: ele deixa tudo em caixa alta e
              "57,5 KG" não é como se escreve quilo. */}
          <p className="font-mono text-[11px] font-semibold tracking-[0.06em] text-ink-4">
            {f.dataCurta(selecionada.concluidaEm)} · {f.carga(selecionada.cargaMaxima)}
          </p>
          <ul className="mt-2.5 space-y-1">
            {selecionada.series.map((serie) => (
              <li
                key={serie.set_number}
                className="flex items-baseline justify-between text-[13px] tabular-nums"
              >
                <span className="text-ink-4">{preencher(p.serie, { n: serie.set_number })}</span>
                <span className="font-semibold text-ink">{textoDaSerieNoIdioma(serie, f)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        // "Escolha", não "toque": o mesmo gráfico serve a quem usa mouse.
        <p className="text-center text-[12px] text-ink-5">{p.escolha}</p>
      )}
    </div>
  );
}

/**
 * O filtro 6 / 12 / Total.
 *
 * Vive junto do gráfico e é usado pelo app do aluno e pela ficha do aluno no
 * painel: são o mesmo controle sobre os mesmos dados, e duas cópias divergiriam
 * na primeira mudança de opção.
 *
 * 44px de altura porque no celular ele é tocado de pé, com o polegar.
 */
export function FiltroDeIntervalo({
  valor,
  aoEscolher,
}: {
  valor: Intervalo;
  aoEscolher: (intervalo: Intervalo) => void;
}) {
  const { t } = useIdioma();
  const p = t.historico.progresso;
  return (
    <div
      role="group"
      aria-label={p.intervalo}
      className="flex gap-1 rounded-input bg-canvas-sunken p-1"
    >
      {INTERVALOS.map((opcao) => (
        <button
          key={opcao.rotulo}
          type="button"
          aria-pressed={valor === opcao.sessoes}
          onClick={() => aoEscolher(opcao.sessoes)}
          className={cn(
            "h-11 flex-1 rounded-[9px] text-[12.5px] font-bold transition",
            valor === opcao.sessoes
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-4 hover:text-ink-2",
          )}
        >
          {opcao.sessoes === null ? p.total : preencher(p.sessoes, { n: opcao.sessoes })}
        </button>
      ))}
    </div>
  );
}
