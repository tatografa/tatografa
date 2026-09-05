import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { comoPorcentagem, haQuantosDias } from "@/lib/domain/atencao";
import type { AlunoEmAlerta, IndicadoresDoPainel } from "@/lib/queries/painel";

/**
 * Os três números do topo do painel (doc 06). Sem banco, como as outras telas.
 *
 * A aderência nula vira "—", não "0%": zero por cento diz que a carteira
 * inteira faltou; o traço diz que ainda não há o que medir.
 */
export function Indicadores({
  indicadores,
}: {
  indicadores: IndicadoresDoPainel;
}) {
  const { alunosAtivos, treinosNaSemana, aderenciaMedia } = indicadores;

  return (
    <section aria-label="Resumo da carteira" className="grid gap-3 sm:grid-cols-3">
      <Indicador
        valor={String(alunosAtivos)}
        rotulo={alunosAtivos === 1 ? "aluno ativo" : "alunos ativos"}
      />
      <Indicador
        valor={String(treinosNaSemana)}
        rotulo={
          treinosNaSemana === 1
            ? "treino executado esta semana"
            : "treinos executados esta semana"
        }
      />
      <Indicador
        valor={comoPorcentagem(aderenciaMedia)}
        rotulo="aderência média"
      />
    </section>
  );
}

function Indicador({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3.5">
      <p className="text-[26px] leading-none font-extrabold tracking-[-0.02em] text-ink tabular-nums">
        {valor}
      </p>
      <p className="eyebrow mt-2 text-[9px] leading-[1.4] text-ink-4">
        {rotulo}
      </p>
    </div>
  );
}

/**
 * "Alunos que precisam de atenção" — o doc 06 chama de a lista mais útil da
 * página, e por isso ela fica **acima** da lista geral, não embaixo dela.
 *
 * Lista vazia não desenha nada: um bloco de alerta vazio treina o olho a
 * ignorar o bloco de alerta.
 */
export function AlunosQuePrecisamDeAtencao({
  alertas,
  diasParaAlerta,
}: {
  alertas: AlunoEmAlerta[];
  diasParaAlerta: number;
}) {
  if (!alertas.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="eyebrow flex items-center gap-1.5 text-warning">
          <AlertTriangle aria-hidden size={13} />
          Precisam de atenção · {alertas.length}
        </h2>
        <Link
          href="/painel/configuracoes"
          className="text-[12px] font-medium text-ink-5 transition hover:text-ink-3"
        >
          Avisar depois de {diasParaAlerta}{" "}
          {diasParaAlerta === 1 ? "dia" : "dias"} · ajustar
        </Link>
      </div>

      <ul className="space-y-2">
        {alertas.map((alerta) => (
          <li key={alerta.id}>
            <Link
              href={`/painel/alunos/${alerta.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-warning/35 bg-warning-bg px-4 py-3.5 transition hover:border-warning/60"
            >
              <p className="truncate text-[14.5px] font-semibold text-ink">
                {alerta.nome}
              </p>
              <p className="shrink-0 text-[12.5px] font-medium text-ink-2">
                {alerta.motivo === "nunca-treinou"
                  ? `entrou ${haQuantosDias(alerta.dias)} e ainda não treinou`
                  : `treinou ${haQuantosDias(alerta.dias)}`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
