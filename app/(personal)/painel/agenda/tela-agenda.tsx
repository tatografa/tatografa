import Link from "next/link";
import { CalendarClock, ChevronLeft, ChevronRight, Dumbbell, Ruler, User } from "lucide-react";

import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import {
  CartaoDoPainel,
  LINHA_DO_CARTAO,
  LINHAS_DO_CARTAO,
} from "@/components/personal/cartao-do-painel";
import {
  ROTULO_DA_SITUACAO,
  diasDaGradeDoMes,
  diasDaSemana,
  duracaoEmTexto,
  horaDaSessaoNaAgenda,
  mesVizinho,
  rotuloDaSemana,
  rotuloDoDiaDaAgenda,
  rotuloDoMes,
  semanaVizinha,
  type Mes,
  type Semana,
  type Situacao,
} from "@/lib/domain/agenda";
import { diaLocal, diaSomandoDias } from "@/lib/domain/fuso";
import { iniciaisDe } from "@/lib/domain/nome";
import type { IndicadoresDaAgenda, SessaoAgendada } from "@/lib/queries/agenda";
import type { AlunoDaLista } from "@/lib/queries/alunos";
import type { ReavaliacaoNaCarteira } from "@/lib/queries/reavaliacao";
import { cn } from "@/lib/utils";

import { BotaoCancelar, NovaReavaliacao } from "../reavaliacoes/acoes";
import { MarcarSessao, NovaSessao } from "./acoes";

type Visao = "semana" | "mes";

/** Altura de uma hora na grade da semana. */
const HORA_PX = 48;
const PRIMEIRA_HORA = 6;
const ULTIMA_HORA = 22;
const DIAS_CURTOS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

/**
 * O estilo de cada situação, e **nunca só a cor**: agendada é contorno cheio,
 * realizada tem o fundo verde e o rótulo, faltou o âmbar e o rótulo, cancelada
 * é tracejada e riscada. Quem não distingue vermelho de verde ainda lê a forma
 * e a palavra.
 */
const ESTILO: Record<Situacao, string> = {
  agendada: "border-brand bg-brand-soft text-brand",
  realizada: "border-success/50 bg-success-soft text-success-dark",
  faltou: "border-warning/60 bg-warning-bg text-warning",
  cancelada: "border-dashed border-border-strong bg-canvas text-ink-4 line-through",
};

/**
 * Agenda e reavaliações numa tela só (27/09), no desenho da tela
 * "Reavaliações" do protótipo.
 *
 * **Uma tela porque as duas respondem a mesma pergunta**: "o que eu tenho com
 * cada aluno e o que está esperando alguém". Separadas, o personal abria duas
 * telas para montar a semana.
 *
 * **O que junta e o que continua separado.** A sessão presencial tem hora e
 * vai na grade; a reavaliação não tem hora — é um formulário que o aluno
 * responde pelo app (15/09) — e entra na faixa de cima do dia, no dia em que
 * foi liberada e no dia em que foi respondida. Inventar horário para ela
 * seria dizer que a reavaliação é um encontro, e não é.
 *
 * **A grade de horas voltou**, e a decisão de 15/09 ("sete linhas, não uma
 * grade") foi revista pelo pedido do protótipo: com a faixa de 6h às 22h e a
 * rolagem dentro do cartão, o espaço vazio fica contido, e o que a grade dá
 * em troca — ver os buracos do dia — é o que um personal usa para encaixar
 * aluno.
 */
export function TelaAgenda({
  visao,
  semana,
  mes,
  sessoes,
  semMarcacao,
  alunos,
  alunoInicial,
  reavaliacoes,
  indicadores,
  proxima,
  hoje,
  agora,
}: {
  visao: Visao;
  semana: Semana;
  mes: Mes;
  sessoes: SessaoAgendada[];
  semMarcacao: SessaoAgendada[];
  alunos: AlunoDaLista[];
  alunoInicial?: string | null;
  reavaliacoes: ReavaliacaoNaCarteira[];
  indicadores: IndicadoresDaAgenda;
  proxima: SessaoAgendada | null;
  /** O dia de hoje no fuso do produto, calculado no servidor. */
  hoje: string;
  agora: string;
}) {
  const pendentes = reavaliacoes.filter((r) => r.pendente);
  const respondidas = reavaliacoes.filter((r) => !r.pendente).slice(0, 5);
  const porDia = agruparPorDia(sessoes);
  const reavaliacoesPorDia = marcosDeReavaliacao(reavaliacoes);

  return (
    <>
      <CabecalhoDaPagina
        titulo="Agenda e reavaliações"
        subtitulo="Sessões presenciais e reavaliações dos seus alunos"
        acoes={
          <>
            <NovaReavaliacao alunos={alunos} variante="secondary" />
            <NovaSessao
              alunos={alunos}
              semana={semana}
              sessoes={sessoes}
              hoje={hoje}
              alunoInicial={alunoInicial}
            />
          </>
        }
      />

      <div className="@container">
        <section
          aria-label="Resumo da agenda"
          className="mb-4 grid grid-cols-2 gap-3.5 @min-[760px]:grid-cols-4"
        >
          <Numero titulo="Próximos 7 dias" valor={String(indicadores.proximos7Dias)} apoio="sessões agendadas" />
          <Numero
            titulo="Esperando o aluno"
            valor={String(pendentes.length)}
            apoio={pendentes.length === 1 ? "reavaliação sem resposta" : "reavaliações sem resposta"}
          />
          <Numero
            titulo="Esperando você"
            valor={String(semMarcacao.length)}
            apoio="sessões sem marcação"
            // A única que é trabalho do personal: presença que ninguém marcou
            // é aderência que o painel calcula errado.
            destaque={semMarcacao.length > 0 ? "Marque quem veio" : undefined}
          />
          <Numero
            titulo="Comparecimento"
            valor={
              indicadores.comparecimento === null
                ? "—"
                : `${Math.round(indicadores.comparecimento * 100)}%`
            }
            apoio={`no mês · ${indicadores.realizadasNoMes} ${indicadores.realizadasNoMes === 1 ? "realizada" : "realizadas"}`}
          />
        </section>

        <div className="grid items-start gap-4 @min-[900px]:grid-cols-[minmax(0,1fr)_clamp(280px,32%,360px)]">
          {/* ------------------------------------------------ calendário --- */}
          <section
            aria-label="Calendário"
            className="min-w-0 rounded-[12px] border border-border bg-surface"
          >
            <NavegacaoDoCalendario visao={visao} semana={semana} mes={mes} hoje={hoje} />
            <Legenda />
            {visao === "semana" ? (
              <GradeDaSemana
                semana={semana}
                porDia={porDia}
                reavaliacoesPorDia={reavaliacoesPorDia}
                hoje={hoje}
              />
            ) : (
              <GradeDoMes
                mes={mes}
                porDia={porDia}
                reavaliacoesPorDia={reavaliacoesPorDia}
                hoje={hoje}
              />
            )}
            {sessoes.length === 0 ? (
              <p className="border-t border-border-soft px-5 py-3 text-[12.5px] text-ink-4">
                {alunos.length === 0
                  ? "Convide um aluno primeiro. A sessão é marcada por aluno."
                  : `Nenhuma sessão ${visao === "semana" ? "nesta semana" : "neste mês"}. Marque as presenciais e, depois que passarem, registre quem veio — é isso que vira a aderência de cada aluno.`}
              </p>
            ) : null}
          </section>

          {/* ------------------------------------------------ a coluna --- */}
          <div className="flex min-w-0 flex-col gap-4">
            <ProximaSessao sessao={proxima} agora={agora} />

            {/*
              O que ficou para trás vem antes do resto: sessão passada sem
              marcação costuma ser de outra semana, e é justamente a que some
              do calendário.
            */}
            {semMarcacao.length > 0 ? (
              <CartaoDoPainel
                titulo={`Esperando sua marcação · ${semMarcacao.length}`}
                apoio="Já passaram e continuam como agendadas"
                Icone={CalendarClock}
                tom="warning"
              >
                <ul className={LINHAS_DO_CARTAO}>
                  {semMarcacao.map((s) => (
                    <li key={s.id} className={cn("space-y-1.5", LINHA_DO_CARTAO)}>
                      <LinhaDeAluno
                        nome={s.alunoNome}
                        detalhe={`${rotuloDoDiaDaAgenda(s.dia)} · ${horaDaSessaoNaAgenda(s.inicio)}`}
                      />
                      <MarcarSessao sessao={s} />
                    </li>
                  ))}
                </ul>
              </CartaoDoPainel>
            ) : null}

            <CartaoDoPainel
              titulo="Reavaliações esperando o aluno"
              apoio={
                pendentes.length
                  ? "Liberadas e ainda sem resposta"
                  : "Nenhuma esperando resposta"
              }
              Icone={Ruler}
            >
              {pendentes.length ? (
                <ul className={LINHAS_DO_CARTAO}>
                  {pendentes.map((r) => (
                    <li key={r.id} className={cn("flex items-center justify-between gap-2", LINHA_DO_CARTAO)}>
                      <LinhaDeAluno nome={r.aluno.nome} detalhe={`Liberada ${r.rotuloDaLiberacao}`} />
                      <BotaoCancelar id={r.id} aluno={r.aluno.nome} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cn("text-[12.5px] leading-relaxed text-ink-4", LINHA_DO_CARTAO)}>
                  Libere uma reavaliação e o aluno preenche medidas e fotos pelo app. Você
                  recebe a comparação com a anterior.
                </p>
              )}
            </CartaoDoPainel>

            {respondidas.length ? (
              <CartaoDoPainel titulo="Respondidas recentemente" apoio="Abra para comparar com a anterior">
                <ul className={LINHAS_DO_CARTAO}>
                  {respondidas.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/painel/reavaliacoes/${r.aluno.id}`}
                        className={cn("flex items-center justify-between gap-2 transition hover:bg-canvas", LINHA_DO_CARTAO)}
                      >
                        <LinhaDeAluno nome={r.aluno.nome} detalhe={`Respondida ${r.rotuloDoEnvio ?? ""}`} />
                        <ChevronRight size={15} aria-hidden className="shrink-0 text-ink-5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CartaoDoPainel>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------ o topo ---

function Numero({
  titulo,
  valor,
  apoio,
  destaque,
}: {
  titulo: string;
  valor: string;
  apoio: string;
  destaque?: string;
}) {
  return (
    <div className="min-w-0 rounded-[12px] bg-canvas p-4">
      <p className="text-[13px] text-ink-4">{titulo}</p>
      <p className="mt-0.5 text-[26px] leading-tight font-bold tracking-[-0.02em] text-ink tabular-nums">
        {valor}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-4">
        {apoio}
        {destaque ? (
          <span className="rounded-full bg-warning-bg px-2 py-px text-[11.5px] font-semibold text-warning">
            {destaque}
          </span>
        ) : null}
      </p>
    </div>
  );
}

function NavegacaoDoCalendario({
  visao,
  semana,
  mes,
  hoje,
}: {
  visao: Visao;
  semana: Semana;
  mes: Mes;
  hoje: string;
}) {
  const anterior =
    visao === "semana"
      ? `/painel/agenda?semana=${semanaVizinha(semana, -1).de}`
      : `/painel/agenda?visao=mes&mes=${mesVizinho(mes, -1).chave}`;
  const seguinte =
    visao === "semana"
      ? `/painel/agenda?semana=${semanaVizinha(semana, 1).de}`
      : `/painel/agenda?visao=mes&mes=${mesVizinho(mes, 1).chave}`;
  const rotulo = visao === "semana" ? rotuloDaSemana(semana) : rotuloDoMes(mes);
  // Trocar de visão mantém o lugar: a semana abre no mês dela, e o mês abre
  // na semana de hoje se hoje estiver nele, senão na primeira semana dele.
  const paraSemana =
    hoje.slice(0, 7) === mes.chave ? "/painel/agenda" : `/painel/agenda?semana=${mes.chave}-01`;
  const paraMes = `/painel/agenda?visao=mes&mes=${(visao === "semana" ? semana.de : mes.chave).slice(0, 7)}`;

  const seta =
    "flex size-8 items-center justify-center rounded-[8px] border border-border text-ink-3 transition hover:border-border-strong hover:text-ink";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-[14px] font-medium text-ink">Agenda</h2>
        <Link href={anterior} className={seta} aria-label={visao === "semana" ? "Semana anterior" : "Mês anterior"}>
          <ChevronLeft size={15} aria-hidden />
        </Link>
        <p aria-live="polite" className="min-w-[150px] text-center text-[13px] font-semibold text-ink first-letter:uppercase">
          {rotulo}
        </p>
        <Link href={seguinte} className={seta} aria-label={visao === "semana" ? "Semana seguinte" : "Mês seguinte"}>
          <ChevronRight size={15} aria-hidden />
        </Link>
        <Link
          href={visao === "semana" ? "/painel/agenda" : `/painel/agenda?visao=mes&mes=${hoje.slice(0, 7)}`}
          className="rounded-[8px] border border-border px-3 py-1.5 text-[12.5px] font-semibold text-ink-2 transition hover:border-border-strong"
        >
          Hoje
        </Link>
      </div>
      <nav aria-label="Visão" className="flex gap-1 rounded-[9px] border border-border bg-canvas p-[3px]">
        {(
          [
            ["semana", "Semana", paraSemana],
            ["mes", "Mês", paraMes],
          ] as const
        ).map(([valor, rotuloDaVisao, href]) => (
          <Link
            key={valor}
            href={href}
            aria-current={visao === valor ? "page" : undefined}
            className={cn(
              "rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold transition",
              visao === valor ? "bg-surface text-ink shadow-xs" : "text-ink-4 hover:text-ink-2",
            )}
          >
            {rotuloDaVisao}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Legenda() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-border-soft px-5 py-2.5 text-[12px] text-ink-3">
      <span className="flex items-center gap-2">
        <span className="text-ink-5">Tipo</span>
        <span className="flex items-center gap-1">
          <Dumbbell size={12} aria-hidden /> Sessão
        </span>
        <span className="flex items-center gap-1">
          <Ruler size={12} aria-hidden /> Reavaliação
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-ink-5">Situação</span>
        {(Object.keys(ESTILO) as Situacao[]).map((s) => (
          <span key={s} className={cn("rounded-[5px] border px-1.5 text-[11px] font-semibold", ESTILO[s])}>
            {ROTULO_DA_SITUACAO[s]}
          </span>
        ))}
      </span>
    </div>
  );
}

// ------------------------------------------------------------ a semana ---

function GradeDaSemana({
  semana,
  porDia,
  reavaliacoesPorDia,
  hoje,
}: {
  semana: Semana;
  porDia: Map<string, SessaoAgendada[]>;
  reavaliacoesPorDia: Map<string, MarcoDeReavaliacao[]>;
  hoje: string;
}) {
  const dias = diasDaSemana(semana);
  const todas = dias.flatMap((d) => porDia.get(d) ?? []);
  // A faixa das 6h às 22h cobre quase todo personal; sessão fora dela estica a
  // grade em vez de sumir.
  const inicio = Math.min(PRIMEIRA_HORA, ...todas.map((s) => Math.floor(s.minutoDoDia / 60)));
  const fim = Math.max(ULTIMA_HORA, ...todas.map((s) => Math.ceil((s.minutoDoDia + s.duracaoMin) / 60)));
  const horas = Array.from({ length: fim - inicio }, (_, i) => inicio + i);
  const temReavaliacao = dias.some((d) => reavaliacoesPorDia.has(d));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* cabeçalho dos dias */}
        <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-border-soft">
          <span aria-hidden />
          {dias.map((dia, i) => {
            const ehHoje = dia === hoje;
            return (
              <div key={dia} className="flex flex-col items-center gap-1 py-2.5">
                <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-5">{DIAS_CURTOS[i]}</span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums",
                    ehHoje ? "bg-brand text-white" : "text-ink-2",
                  )}
                >
                  {dia.slice(8)}
                </span>
                <span className="sr-only">
                  {ehHoje ? `${rotuloDoDiaDaAgenda(dia)}, hoje` : rotuloDoDiaDaAgenda(dia)}
                </span>
              </div>
            );
          })}
        </div>

        {/* faixa das reavaliações: não têm hora, então vão no alto do dia */}
        {temReavaliacao ? (
          <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-border-soft">
            <span className="flex items-center justify-end pr-2 text-[10px] text-ink-5">
              <Ruler size={12} aria-hidden />
              <span className="sr-only">Reavaliações</span>
            </span>
            {dias.map((dia) => (
              <div key={dia} className="space-y-1 border-l border-border-soft p-1">
                {(reavaliacoesPorDia.get(dia) ?? []).map((m) => (
                  <ChipDeReavaliacao key={`${m.id}-${m.tipo}`} marco={m} />
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {/* a grade de horas */}
        {/* Focável porque rola: sem isso quem usa teclado não alcança as
            horas de baixo (axe, scrollable-region-focusable). O `pt-2` dá
            lugar ao rótulo "06:00", que fica meio acima da própria linha. */}
        <div
          role="region"
          aria-label="Horários da semana"
          tabIndex={0}
          className="max-h-[560px] overflow-y-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
        >
          <div className="relative grid grid-cols-[52px_repeat(7,minmax(0,1fr))] pt-2">
            <div>
              {horas.map((h) => (
                <div key={h} style={{ height: HORA_PX }} className="relative">
                  <span className="absolute -top-2 right-2 text-[11px] text-ink-5 tabular-nums">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>
            {dias.map((dia, i) => (
              <ColunaDoDia
                key={dia}
                sessoes={porDia.get(dia) ?? []}
                inicio={inicio}
                horas={horas.length}
                ehHoje={dia === hoje}
                abreParaEsquerda={i >= 5}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColunaDoDia({
  sessoes,
  inicio,
  horas,
  ehHoje,
  abreParaEsquerda,
}: {
  sessoes: SessaoAgendada[];
  inicio: number;
  horas: number;
  ehHoje: boolean;
  abreParaEsquerda: boolean;
}) {
  const faixas = emFaixas(sessoes);
  return (
    <div
      className={cn("relative border-l border-border-soft", ehHoje && "bg-brand-soft/40")}
      style={{ height: horas * HORA_PX }}
    >
      {Array.from({ length: horas }, (_, i) => (
        <div key={i} aria-hidden className="border-t border-border-soft" style={{ height: HORA_PX }} />
      ))}
      {sessoes.map((s) => {
        const { faixa, total } = faixas.get(s.id) ?? { faixa: 0, total: 1 };
        return (
          <div
            key={s.id}
            className="absolute px-0.5"
            style={{
              top: ((s.minutoDoDia - inicio * 60) / 60) * HORA_PX,
              height: Math.max(26, (s.duracaoMin / 60) * HORA_PX),
              left: `${(faixa / total) * 100}%`,
              width: `${100 / total}%`,
            }}
          >
            <EventoDaSemana sessao={s} abreParaEsquerda={abreParaEsquerda} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * A sessão na grade. `<details>` e não estado de cliente: abrir o que fazer
 * com uma sessão não precisa de JavaScript na tela inteira, e o `<summary>`
 * já é um botão para o teclado e para o leitor de tela.
 */
function EventoDaSemana({ sessao, abreParaEsquerda }: { sessao: SessaoAgendada; abreParaEsquerda: boolean }) {
  return (
    <details className="group relative h-full">
      <summary
        className={cn(
          "h-full cursor-pointer list-none overflow-hidden rounded-[6px] border px-1.5 py-0.5 text-[11px] leading-tight font-semibold [&::-webkit-details-marker]:hidden",
          ESTILO[sessao.situacao],
        )}
      >
        <span className="block tabular-nums">{horaDaSessaoNaAgenda(sessao.inicio)}</span>
        <span className="block truncate font-medium">{sessao.alunoNome}</span>
        <span className="sr-only">, {ROTULO_DA_SITUACAO[sessao.situacao]}</span>
      </summary>
      <div
        className={cn(
          "absolute top-full z-30 mt-1 w-[260px] space-y-2 rounded-[10px] border border-border bg-surface p-3 text-left shadow-flutuante",
          abreParaEsquerda ? "right-0" : "left-0",
        )}
      >
        <Link href={`/painel/alunos/${sessao.alunoId}`} className="block text-[13.5px] font-bold text-ink hover:text-brand">
          {sessao.alunoNome}
        </Link>
        <p className="text-[12px] text-ink-4">
          {rotuloDoDiaDaAgenda(sessao.dia)} · {horaDaSessaoNaAgenda(sessao.inicio)} ·{" "}
          {duracaoEmTexto(sessao.duracaoMin)} · {ROTULO_DA_SITUACAO[sessao.situacao]}
        </p>
        {sessao.observacao ? <p className="text-[12.5px] text-ink-2">{sessao.observacao}</p> : null}
        <MarcarSessao sessao={sessao} />
      </div>
    </details>
  );
}

// -------------------------------------------------------------- o mês ---

function GradeDoMes({
  mes,
  porDia,
  reavaliacoesPorDia,
  hoje,
}: {
  mes: Mes;
  porDia: Map<string, SessaoAgendada[]>;
  reavaliacoesPorDia: Map<string, MarcoDeReavaliacao[]>;
  hoje: string;
}) {
  const dias = diasDaGradeDoMes(mes);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 border-b border-border-soft">
          {DIAS_CURTOS.map((d) => (
            <span key={d} className="py-2 text-center text-[11px] font-semibold tracking-[0.04em] text-ink-5">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dias.map((dia) => {
            const doDia = porDia.get(dia) ?? [];
            const marcos = reavaliacoesPorDia.get(dia) ?? [];
            const itens = doDia.length + marcos.length;
            const foraDoMes = dia.slice(0, 7) !== mes.chave;
            const ehHoje = dia === hoje;
            const cabem = 3;
            return (
              <div
                key={dia}
                className={cn(
                  "min-h-[104px] space-y-1 border-b border-l border-border-soft p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0",
                  foraDoMes && "bg-canvas/60",
                )}
              >
                {/* O número leva à semana daquele dia: o mês é para achar,
                    a semana é para agir. */}
                <Link
                  href={`/painel/agenda?semana=${dia}`}
                  aria-label={`Abrir a semana de ${rotuloDoDiaDaAgenda(dia)}`}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums transition hover:bg-canvas-sunken",
                    ehHoje ? "bg-brand text-white hover:bg-brand-hover" : foraDoMes ? "text-ink-5" : "text-ink-2",
                  )}
                >
                  {Number(dia.slice(8))}
                </Link>
                {marcos.slice(0, cabem).map((m) => (
                  <ChipDeReavaliacao key={`${m.id}-${m.tipo}`} marco={m} />
                ))}
                {doDia.slice(0, Math.max(0, cabem - marcos.length)).map((s) => (
                  <p
                    key={s.id}
                    title={`${horaDaSessaoNaAgenda(s.inicio)} · ${s.alunoNome} · ${ROTULO_DA_SITUACAO[s.situacao]}`}
                    className={cn("truncate rounded-[5px] border px-1 text-[10.5px] font-semibold", ESTILO[s.situacao])}
                  >
                    {horaDaSessaoNaAgenda(s.inicio)} {s.alunoNome}
                  </p>
                ))}
                {itens > cabem ? (
                  <Link href={`/painel/agenda?semana=${dia}`} className="block text-[10.5px] font-semibold text-ink-4 hover:text-ink">
                    +{itens - cabem} mais
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------- a coluna ---

function ProximaSessao({ sessao, agora }: { sessao: SessaoAgendada | null; agora: string }) {
  return (
    <CartaoDoPainel titulo="Próxima sessão" Icone={CalendarClock}>
      {sessao ? (
        <div className="space-y-3 px-[18px] py-4">
          <LinhaDeAluno nome={sessao.alunoNome} detalhe={duracaoEmTexto(sessao.duracaoMin)} grande />
          <div>
            <p className="text-[12px] text-ink-5">Horário</p>
            <p className="text-[13.5px] font-semibold text-ink">{quandoAcontece(sessao, agora)}</p>
          </div>
          {sessao.observacao ? (
            <div>
              <p className="text-[12px] text-ink-5">Notas da agenda</p>
              <p className="text-[13px] leading-relaxed text-ink-2">{sessao.observacao}</p>
            </div>
          ) : null}
          <div className="grid gap-2">
            <Link
              href={`/painel/treinos?aluno=${sessao.alunoId}`}
              className="flex items-center justify-center gap-2 rounded-[10px] border border-border py-2.5 text-[12.5px] font-semibold text-ink-2 transition hover:border-border-strong hover:text-ink"
            >
              <Dumbbell size={14} aria-hidden /> Ir para a divisão de treino
            </Link>
            <Link
              href={`/painel/alunos/${sessao.alunoId}`}
              className="flex items-center justify-center gap-2 rounded-[10px] border border-border py-2.5 text-[12.5px] font-semibold text-ink-2 transition hover:border-border-strong hover:text-ink"
            >
              <User size={14} aria-hidden /> Ir para o perfil
            </Link>
          </div>
        </div>
      ) : (
        <p className={cn("text-[12.5px] text-ink-4", LINHA_DO_CARTAO)}>Nenhuma sessão agendada daqui para a frente.</p>
      )}
    </CartaoDoPainel>
  );
}

function LinhaDeAluno({ nome, detalhe, grande = false }: { nome: string; detalhe: string; grande?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand",
          grande ? "size-10 text-[13px]" : "size-8 text-[11px]",
        )}
      >
        {iniciaisDe(nome)}
      </span>
      <div className="min-w-0">
        <p className={cn("truncate font-semibold text-ink", grande ? "text-[14.5px]" : "text-[13px]")}>{nome}</p>
        <p className="truncate text-[12px] text-ink-4">{detalhe}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------ as reavaliações ---

type MarcoDeReavaliacao = {
  id: string;
  alunoId: string;
  nome: string;
  tipo: "liberada" | "respondida";
};

/** Onde cada reavaliação aparece no calendário: no dia em que foi liberada e no dia em que foi respondida. */
function marcosDeReavaliacao(reavaliacoes: ReavaliacaoNaCarteira[]): Map<string, MarcoDeReavaliacao[]> {
  const mapa = new Map<string, MarcoDeReavaliacao[]>();
  const adicionar = (dia: string, marco: MarcoDeReavaliacao) =>
    mapa.set(dia, [...(mapa.get(dia) ?? []), marco]);
  for (const r of reavaliacoes) {
    const base = { id: r.id, alunoId: r.aluno.id, nome: r.aluno.nome };
    adicionar(diaLocal(r.liberadaEm), { ...base, tipo: "liberada" });
    if (r.enviadaEm) adicionar(diaLocal(r.enviadaEm), { ...base, tipo: "respondida" });
  }
  return mapa;
}

function ChipDeReavaliacao({ marco }: { marco: MarcoDeReavaliacao }) {
  const respondida = marco.tipo === "respondida";
  const rotulo = `${respondida ? "Respondeu" : "Liberada"}: ${marco.nome}`;
  const classes = cn(
    "flex items-center gap-1 truncate rounded-[5px] border px-1 text-[10.5px] font-semibold",
    respondida ? "border-ink-3 bg-surface text-ink-2" : "border-dashed border-ink-4 bg-surface text-ink-3",
  );
  return respondida ? (
    <Link href={`/painel/reavaliacoes/${marco.alunoId}`} title={rotulo} className={cn(classes, "hover:border-ink")}>
      <Ruler size={10} aria-hidden className="shrink-0" />
      <span className="truncate">{rotulo}</span>
    </Link>
  ) : (
    <p title={rotulo} className={classes}>
      <Ruler size={10} aria-hidden className="shrink-0" />
      <span className="truncate">{rotulo}</span>
    </p>
  );
}

// ------------------------------------------------------------- ajudas ---

function agruparPorDia(sessoes: SessaoAgendada[]): Map<string, SessaoAgendada[]> {
  const mapa = new Map<string, SessaoAgendada[]>();
  for (const s of sessoes) mapa.set(s.dia, [...(mapa.get(s.dia) ?? []), s]);
  return mapa;
}

/**
 * Sessões que se sobrepõem dividem a largura da coluna — duas no mesmo
 * horário são comuns (atendimento em dupla, 15/09) e uma não pode cobrir a
 * outra. Faixa gulosa por ordem de início: simples, e certo para o punhado de
 * sessões que cabe num dia.
 */
function emFaixas(sessoes: SessaoAgendada[]): Map<string, { faixa: number; total: number }> {
  const ordenadas = [...sessoes].sort((a, b) => a.minutoDoDia - b.minutoDoDia);
  const fimDaFaixa: number[] = [];
  const faixaDe = new Map<string, number>();
  for (const s of ordenadas) {
    let faixa = fimDaFaixa.findIndex((fim) => fim <= s.minutoDoDia);
    if (faixa === -1) faixa = fimDaFaixa.length;
    fimDaFaixa[faixa] = s.minutoDoDia + s.duracaoMin;
    faixaDe.set(s.id, faixa);
  }
  const total = Math.max(1, fimDaFaixa.length);
  return new Map([...faixaDe].map(([id, faixa]) => [id, { faixa, total }]));
}

/** "Hoje, às 18h" / "Amanhã, às 7h" / "qui, 2 de out, às 18h". */
function quandoAcontece(sessao: SessaoAgendada, agora: string): string {
  const hoje = diaLocal(agora);
  const hora = horaDaSessaoNaAgenda(sessao.inicio);
  if (sessao.dia === hoje) return `Hoje, às ${hora}`;
  if (sessao.dia === diaSomandoDias(hoje, 1)) return `Amanhã, às ${hora}`;
  return `${rotuloDoDiaDaAgenda(sessao.dia)}, às ${hora}`;
}
