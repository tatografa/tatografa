import Link from "next/link";
import { AlertTriangle, History } from "lucide-react";

import {
  CartaoDoPainel,
  LINHA_DO_CARTAO,
  LINHAS_DO_CARTAO,
} from "@/components/personal/cartao-do-painel";

import { NumeroDoTopo } from "@/components/personal/numero-do-topo";
import { comoPorcentagem, haQuantosDias } from "@/lib/domain/atencao";
import { iniciaisDe } from "@/lib/domain/nome";
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
    // Dois por linha ou os quatro numa linha só, nunca três e um sobrando —
    // que é o que `auto-fit` fazia com quatro ladrilhos numa coluna de 740px.
    // A régua é a largura da coluna (container query), não a da janela.
    <div className="@container">
      <section
        aria-label="Resumo da carteira"
        className="grid grid-cols-2 gap-3.5 @min-[640px]:grid-cols-4"
      >
        <NumeroDoTopo
          titulo="Alunos ativos"
          valor={String(alunosAtivos)}
          apoio="com acesso ao app"
        />
        <NumeroDoTopo
          titulo="Treinos na semana"
          valor={String(treinosNaSemana)}
          apoio="desde segunda-feira"
        />
        <NumeroDoTopo
          titulo="Aderência média"
          valor={comoPorcentagem(aderenciaMedia)}
          apoio="feitos sobre prescritos"
        />
        <NumeroDoTopo
          titulo="Reavaliações"
          valor={String(reavaliacoesPendentes)}
          apoio="esperando resposta"
          destaque={reavaliacoesPendentes > 0}
          href={reavaliacoesPendentes > 0 ? "/painel/agenda" : undefined}
        />
      </section>
    </div>
  );
}

/**
 * "Alunos que precisam de atenção" — o doc 06 chama de a lista mais útil da
 * página. No layout de duas colunas ela é o primeiro cartão depois dos
 * números: o protótipo põe os gráficos logo abaixo dos indicadores, e eles
 * continuam lá — só que **depois** de quem parou de treinar, que é a decisão de
 * hoje. Tendência é a camada seguinte.
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
    <CartaoDoPainel
      titulo={`Precisam de atenção · ${alertas.length}`}
      Icone={AlertTriangle}
      tom="warning"
      apoio={
        <Link
          href="/painel/configuracoes"
          className="transition hover:text-ink-3"
        >
          Aviso depois de {diasParaAlerta}{" "}
          {diasParaAlerta === 1 ? "dia" : "dias"} sem treinar · ajustar
        </Link>
      }
    >
      <ul className={LINHAS_DO_CARTAO}>
        {alertas.map((alerta) => (
          <li key={alerta.id}>
            <Link
              href={`/painel/alunos/${alerta.id}`}
              className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 transition hover:bg-canvas ${LINHA_DO_CARTAO}`}
            >
              <p className="min-w-0 truncate text-[13px] font-medium text-ink">
                {alerta.nome}
              </p>
              <p className="shrink-0 text-[12px] font-medium text-warning">
                {alerta.motivo === "nunca-treinou"
                  ? `entrou ${haQuantosDias(alerta.dias)} e ainda não treinou`
                  : `treinou ${haQuantosDias(alerta.dias)}`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </CartaoDoPainel>
  );
}

/**
 * "Treinos recentes" (doc 06 §2, "Atividade recente"): as últimas sessões
 * concluídas da carteira, no cartão da coluna da direita do protótipo.
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
    <CartaoDoPainel
      titulo="Treinos recentes"
      apoio="Últimos treinos concluídos"
      Icone={History}
    >
      {!sessoes.length ? (
        <p
          className={`text-[13px] leading-relaxed text-ink-3 ${LINHA_DO_CARTAO}`}
        >
          Nenhum treino concluído ainda. Assim que alguém terminar uma sessão,
          ela aparece aqui.
        </p>
      ) : (
        <ul className={LINHAS_DO_CARTAO}>
          {sessoes.map((sessao) => (
            <li key={sessao.id}>
              <Link
                href={`/painel/alunos/${sessao.aluno.id}/sessoes/${sessao.id}`}
                className={`flex items-center gap-3 transition hover:bg-canvas ${LINHA_DO_CARTAO}`}
              >
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[11px] font-semibold text-ink-3"
                >
                  {iniciaisDe(sessao.aluno.nome)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 truncate text-[13px] font-medium text-ink">
                      {sessao.aluno.nome}
                    </p>
                    <p className="shrink-0 text-[12px] text-ink-5 tabular-nums">
                      {sessao.rotuloDoDia}
                    </p>
                  </div>
                  {/* Volume e duração ficam a um clique, na sessão: numa
                      coluna de 340px eles empurrariam o nome do treino para
                      as reticências, e é o nome que diz o que foi feito. */}
                  <p className="truncate text-[12px] text-ink-4 tabular-nums">
                    {sessao.treino
                      ? `${sessao.treino.label} · ${sessao.treino.name}`
                      : "Treino removido"}
                    {" · "}
                    {sessao.series_feitas}{" "}
                    {sessao.series_feitas === 1 ? "série" : "séries"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CartaoDoPainel>
  );
}
