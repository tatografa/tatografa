import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { comoPorcentagem, haQuantosDias } from "@/lib/domain/atencao";
import { duracaoCurta, formatarNumero } from "@/lib/domain/historico";
import type {
  AlunoEmAlerta,
  IndicadoresDoPainel,
  SessaoRecente,
} from "@/lib/queries/painel";

/**
 * Os quatro números do topo do painel (doc 06 §2). Sem banco, como as outras
 * telas.
 *
 * A aderência nula vira "—", não "0%": zero por cento diz que a carteira
 * inteira faltou; o traço diz que ainda não há o que medir.
 *
 * "Reavaliações pendentes" é o único dos quatro que é fila de trabalho, e por
 * isso é o único que vira link: o número sem a tela obrigaria o personal a
 * procurar no menu quem ele está esperando. Zero não vira link — levar a uma
 * lista vazia é pior que não levar.
 */
export function Indicadores({
  indicadores,
}: {
  indicadores: IndicadoresDoPainel;
}) {
  const {
    alunosAtivos,
    treinosNaSemana,
    aderenciaMedia,
    reavaliacoesPendentes,
  } = indicadores;

  return (
    <section
      aria-label="Resumo da carteira"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
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
      <Indicador
        valor={String(reavaliacoesPendentes)}
        rotulo={
          reavaliacoesPendentes === 1
            ? "reavaliação pendente"
            : "reavaliações pendentes"
        }
        destaque={reavaliacoesPendentes > 0}
        href={reavaliacoesPendentes > 0 ? "/painel/reavaliacoes" : undefined}
      />
    </section>
  );
}

function Indicador({
  valor,
  rotulo,
  destaque = false,
  href,
}: {
  valor: string;
  rotulo: string;
  /** Pinta o número de `brand` quando há o que fazer com ele. */
  destaque?: boolean;
  href?: string;
}) {
  const classes = [
    "block rounded-card border bg-surface px-4 py-3.5 transition",
    href ? "border-border hover:border-border-strong" : "border-border",
  ].join(" ");

  const conteudo = (
    <>
      <p
        className={`text-[26px] leading-none font-extrabold tracking-[-0.02em] tabular-nums ${
          destaque ? "text-brand" : "text-ink"
        }`}
      >
        {valor}
      </p>
      <p className="eyebrow mt-2 text-[9px] leading-[1.4] text-ink-4">
        {rotulo}
      </p>
    </>
  );

  if (href) return <Link href={href} className={classes}>{conteudo}</Link>;
  return <div className={classes}>{conteudo}</div>;
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
          className="inline-flex min-h-6 items-center text-[12px] font-medium text-ink-5 transition hover:text-ink-3"
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

/**
 * "Atividade recente" (doc 06 §2): as últimas sessões concluídas da carteira.
 *
 * É a única tela do painel onde o personal vê a carteira inteira em ordem de
 * acontecimento, e não por aluno. Vale pela leitura de baixo: "ninguém treinou
 * hoje" é informação, e por isso o bloco **desenha o vazio** em vez de sumir —
 * ao contrário do bloco de alerta, que some. Alerta vazio é boa notícia e não
 * precisa de linha; atividade vazia é a pergunta que traz o personal aqui.
 *
 * Cada linha leva à sessão, não ao aluno: quem clica em "Carla · A · 16 séries"
 * quer ver aquelas séries. Para a ficha há a tabela de alunos.
 */
export function AtividadeRecente({ sessoes }: { sessoes: SessaoRecente[] }) {
  return (
    <section className="space-y-3">
      <h2 className="eyebrow text-ink-4">Atividade recente</h2>

      {!sessoes.length ? (
        <p className="rounded-card border border-border bg-surface px-4 py-3.5 text-[14px] text-ink-3">
          Nenhum treino concluído ainda. Assim que alguém terminar uma sessão,
          ela aparece aqui.
        </p>
      ) : (
        <ul className="space-y-2">
          {sessoes.map((sessao) => (
            <li key={sessao.id}>
              <Link
                href={`/painel/alunos/${sessao.aluno.id}/sessoes/${sessao.id}`}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-card border border-border bg-surface px-4 py-3.5 transition hover:border-border-strong"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-semibold text-ink">
                    {sessao.aluno.nome}
                  </p>
                  <p className="truncate text-[12.5px] text-ink-4">
                    {sessao.treino
                      ? `${sessao.treino.label} · ${sessao.treino.name}`
                      : "Treino removido"}
                  </p>
                </div>
                <p className="shrink-0 text-right text-[12.5px] font-medium text-ink-2 tabular-nums">
                  {sessao.rotuloDoDia}
                  <span className="block text-[12px] font-normal text-ink-4">
                    {sessao.series_feitas}{" "}
                    {sessao.series_feitas === 1 ? "série" : "séries"}
                    {sessao.volume_kg > 0
                      ? ` · ${formatarNumero(sessao.volume_kg)} kg`
                      : ""}
                    {sessao.duration_seconds !== null
                      ? ` · ${duracaoCurta(sessao.duration_seconds)}`
                      : ""}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
