import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge, Card, classesDeBotao } from "@/components/ui";
import {
  ROTULO_DA_SITUACAO,
  diasDaSemana,
  duracaoEmTexto,
  horaDaSessaoNaAgenda,
  rotuloDaSemana,
  rotuloDoDiaDaAgenda,
  semanaVizinha,
  type Semana,
  type Situacao,
} from "@/lib/domain/agenda";
import type { AlunoDaLista } from "@/lib/queries/alunos";
import type { SessaoAgendada } from "@/lib/queries/agenda";

import { MarcarSessao, NovaSessao } from "./acoes";

const TOM: Record<Situacao, "neutro" | "brand" | "sucesso" | "atencao"> = {
  agendada: "brand",
  realizada: "sucesso",
  faltou: "atencao",
  cancelada: "neutro",
};

/**
 * A agenda da semana (doc 06 §7).
 *
 * **Sete linhas, não uma grade de horas.** Uma grade com faixa por hora é o
 * desenho de quem tem o dia cheio; um personal com carteira de piloto tem duas
 * ou três sessões por dia, e a grade seria 90% de espaço vazio com o conteúdo
 * comprimido. A lista por dia mostra o mesmo em menos tela, e o dia sem sessão
 * diz isso com uma linha em vez de uma coluna em branco.
 *
 * Sem acesso a banco, como as outras telas: abre no navegador com props fixas.
 */
export function TelaAgenda({
  semana,
  sessoes,
  semMarcacao,
  alunos,
  hoje,
}: {
  semana: Semana;
  sessoes: SessaoAgendada[];
  /** Sessões passadas que continuam “agendada”, de qualquer semana. */
  semMarcacao: SessaoAgendada[];
  alunos: AlunoDaLista[];
  /** O dia de hoje no fuso do produto, calculado no servidor. */
  hoje: string;
}) {
  const anterior = semanaVizinha(semana, -1);
  const seguinte = semanaVizinha(semana, 1);

  const porDia = new Map<string, SessaoAgendada[]>();
  for (const s of sessoes) {
    porDia.set(s.dia, [...(porDia.get(s.dia) ?? []), s]);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-ink-4">Agenda</p>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {rotuloDaSemana(semana)}
          </h1>
        </div>
        <NovaSessao alunos={alunos} semana={semana} sessoes={sessoes} hoje={hoje} />
      </header>

      {/*
        A fila do que ficou para trás vem **antes** da semana. Sessão passada
        sem marcação costuma ser de outra semana, e é justamente a que some da
        tela: sem esta lista, o personal só reencontraria a falta navegando
        para trás no calendário, que é o que ninguém faz.
      */}
      {semMarcacao.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
            {semMarcacao.length === 1
              ? "1 sessão esperando sua marcação"
              : `${semMarcacao.length} sessões esperando sua marcação`}
          </h2>
          <p className="-mt-1 text-[12.5px] text-ink-4">
            Já passaram e continuam como agendadas. Marcar é o que vira aderência.
          </p>
          <ul className="space-y-2">
            {semMarcacao.map((s) => (
              <li key={s.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-bold text-ink">
                      {s.alunoNome}
                    </p>
                    <p className="text-[12.5px] text-ink-4">
                      {rotuloDoDiaDaAgenda(s.dia)} · {horaDaSessaoNaAgenda(s.inicio)}
                    </p>
                  </div>
                  <MarcarSessao sessao={s} />
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="flex items-center justify-between gap-3" aria-label="Semanas">
        <Link
          href={`/painel/agenda?semana=${anterior.de}`}
          className={classesDeBotao({ size: "sm", variant: "secondary" })}
        >
          <ChevronLeft size={15} aria-hidden /> Semana anterior
        </Link>
        <Link
          href="/painel/agenda"
          className="text-[12.5px] font-semibold text-ink-4 transition hover:text-ink"
        >
          Esta semana
        </Link>
        <Link
          href={`/painel/agenda?semana=${seguinte.de}`}
          className={classesDeBotao({ size: "sm", variant: "secondary" })}
        >
          Semana seguinte <ChevronRight size={15} aria-hidden />
        </Link>
      </nav>

      {/*
        Semana sem nada não vira sete cartões dizendo "sem sessão": isso é
        ruído com a forma de conteúdo. O vazio **substitui** a lista, e explica
        para que serve marcar — que é a pergunta de quem abre a tela pela
        primeira vez.
      */}
      {sessoes.length === 0 ? (
        <Card size="lg" className="space-y-3 text-center">
          <CalendarDays size={22} className="mx-auto text-ink-4" aria-hidden />
          <p className="text-[15px] font-bold text-ink">
            Nenhuma sessão nesta semana
          </p>
          <p className="mx-auto max-w-md text-[13px] text-ink-4">
            {alunos.length === 0
              ? "Convide um aluno primeiro. A sessão é marcada por aluno."
              : "Marque as sessões presenciais e, depois que passarem, registre quem veio — é isso que vira a aderência de cada aluno."}
          </p>
        </Card>
      ) : (
      <section className="space-y-2">
        {diasDaSemana(semana).map((dia) => {
          const doDia = porDia.get(dia) ?? [];
          const ehHoje = dia === hoje;

          return (
            <div
              key={dia}
              className={
                ehHoje
                  ? "rounded-card-lg border-[1.5px] border-brand bg-surface p-4"
                  : "rounded-card-lg border border-border-soft bg-surface p-4"
              }
            >
              <div className="flex items-baseline gap-2">
                <h2
                  className={
                    ehHoje
                      ? "text-[13.5px] font-extrabold text-brand"
                      : "text-[13.5px] font-extrabold text-ink"
                  }
                >
                  {rotuloDoDiaDaAgenda(dia)}
                </h2>
                {ehHoje && <span className="eyebrow text-brand">Hoje</span>}
              </div>

              {doDia.length === 0 ? (
                <p className="mt-1.5 text-[12.5px] text-ink-5">Sem sessão.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {doDia.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft pt-2.5 first:border-0 first:pt-0"
                    >
                      <div className="flex min-w-0 items-baseline gap-2.5">
                        <span className="shrink-0 font-mono text-[13px] font-bold text-ink">
                          {horaDaSessaoNaAgenda(s.inicio)}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={
                              s.situacao === "cancelada"
                                ? "truncate text-[14px] font-semibold text-ink-4 line-through"
                                : "truncate text-[14px] font-bold text-ink"
                            }
                          >
                            <Link
                              href={`/painel/alunos/${s.alunoId}`}
                              className="transition hover:underline"
                            >
                              {s.alunoNome}
                            </Link>
                          </p>
                          <p className="text-[12px] text-ink-4">
                            {duracaoEmTexto(s.duracaoMin)}
                            {s.observacao ? ` · ${s.observacao}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {s.situacao !== "agendada" && (
                          <Badge tone={TOM[s.situacao]}>
                            {ROTULO_DA_SITUACAO[s.situacao]}
                          </Badge>
                        )}
                        <MarcarSessao sessao={s} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>
      )}
    </div>
  );
}
