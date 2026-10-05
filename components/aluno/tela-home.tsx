import Link from "next/link";
import { CalendarCheck, CalendarClock } from "lucide-react";

import { classesDeBotao } from "@/components/ui";
import { FUSO } from "@/lib/domain/fuso";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_APP, type TextosDoApp } from "@/lib/i18n/app";
import { formatos } from "@/lib/i18n/formatos";
import { plural, preencher } from "@/lib/i18n/texto";
import type { SessaoAberta } from "@/lib/queries/execucao";
import type {
  IndicadoresDoAluno,
  MacrotreinoDoAluno,
  TreinoDaAgenda,
} from "@/lib/queries/aluno";

import { contagem } from "./card-de-treino";
import { CardMacrotreino } from "./card-macrotreino";
import { primeiroNome } from "@/lib/domain/nome";

export type TelaHomeProps = {
  nomeDoAluno: string;
  nomeDoPersonal: string;
  macrotreino: MacrotreinoDoAluno | null;
  totalDeTreinos: number;
  /** O treino sugerido pela rotação; nulo quando não há nada montado. */
  proximo: TreinoDaAgenda | null;
  indicadores: IndicadoresDoAluno;
  /**
   * O treino que ficou aberto, se houver. Sem isto a home não dizia nada sobre
   * ele, e o aluno só descobria ao tentar começar outro — com as séries já
   * registradas presas numa sessão invisível.
   */
  sessaoAberta: SessaoAberta | null;
  /**
   * O personal liberou uma reavaliação e ela ainda não foi respondida.
   *
   * Um booleano, e não a reavaliação inteira: a home só decide se mostra o
   * card, e é a tela que menos pode ser lenta — o aluno a abre na academia.
   */
  reavaliacaoAberta: boolean;
  /**
   * A próxima sessão presencial com o personal, se houver.
   *
   * O aluno não marca nem desmarca nada — quem combina horário são duas
   * pessoas conversando. Isto é lembrete, e existe porque a tela de agendar do
   * personal promete que o aluno vê a próxima sessão aqui: promessa de tela
   * sem tela é o defeito que este projeto já cometeu três vezes.
   */
  proximaSessao: ProximaSessao | null;
  idioma: Idioma;
};

export type ProximaSessao = {
  rotuloDoDia: string;
  hora: string;
  duracao: string;
};

/**
 * Home do aluno (doc 05, tela 2), sem nenhum acesso a banco.
 *
 * A tela é um componente à parte da página de propósito: assim ela se abre no
 * navegador com props fixas, que é o único jeito de conferir a interface neste
 * ambiente — o host do Supabase é bloqueado pela rede.
 *
 * Os indicadores do topo aparecem sempre, inclusive em zero — mas o aluno que
 * ainda não treinou ganha uma frase no lugar do vazio, porque "0 DIAS SEGUIDOS"
 * sozinho, na primeira abertura do app, parece punição em vez de convite.
 */
export function TelaHome({
  nomeDoAluno,
  nomeDoPersonal,
  macrotreino,
  totalDeTreinos,
  proximo,
  indicadores,
  sessaoAberta,
  reavaliacaoAberta,
  proximaSessao,
  idioma,
}: TelaHomeProps) {
  const t = TEXTOS_DO_APP[idioma];
  const h = t.treinos.home;
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          {saudacao(t)}, {primeiroNome(nomeDoAluno)}
        </h1>
        <Avatar nome={nomeDoAluno} />
      </header>

      <Indicadores indicadores={indicadores} t={t} />

      {macrotreino ? (
        <CardMacrotreino
          nome={macrotreino.name}
          totalDeSemanas={macrotreino.total_weeks}
          inicio={macrotreino.started_at}
          nomeDoPersonal={nomeDoPersonal}
          idioma={idioma}
        />
      ) : null}

      {sessaoAberta ? (
        <EmAndamento sessao={sessaoAberta} idioma={idioma} />
      ) : proximo ? (
        <section className="rounded-card-lg border-[1.5px] border-brand bg-surface p-4.5">
          <p className="eyebrow text-brand">{h.proximo}</p>
          <h2 className="mt-2 text-[19px] font-extrabold tracking-[-0.01em] text-ink">
            {preencher(t.comum.treinoComNome, { label: proximo.label, nome: proximo.name })}
          </h2>
          <p className="mt-1 text-[13px] text-ink-3">
            {contagem(proximo.total_exercicios, idioma)} · ~{proximo.duracao_min}min
          </p>

          {/*
            Link, e não formulário: da home o aluno ainda não viu a prescrição,
            então a tela de execução confirma o treino (ou oferece retomar o
            que ficou aberto) antes de abrir a sessão.
          */}
          <Link
            href={`/app/executar/${proximo.id}`}
            className={classesDeBotao({
              size: "lg",
              block: true,
              className: "mt-4",
            })}
          >
            {h.iniciar}
          </Link>

          {/*
            Sempre, e não só com mais de um treino: mesmo com um treino só, é
            por aqui que o aluno chega à lista — e a lista é a porta do detalhe
            da prescrição. Dívida apontada na revisão do M1.
          */}
          <Link
            href="/app/treinos"
            className="mt-3 block text-center text-[12px] font-medium text-ink-5 transition hover:text-ink-3"
          >
            {totalDeTreinos > 1 ? h.fazerOutro : h.verInteiro}
          </Link>
        </section>
      ) : (
        <SemTreino nomeDoPersonal={nomeDoPersonal} t={t} />
      )}

      {/*
        A próxima sessão presencial. Linha discreta, e não card: é informação
        para conferir de relance, não uma ação — o aluno não faz nada com ela
        dentro do app, e um card com botão sugeriria que faz.
      */}
      {proximaSessao && (
        <div className="flex items-center gap-2.5 rounded-card border border-border-soft bg-surface px-4 py-3">
          <CalendarClock size={16} className="shrink-0 text-ink-4" aria-hidden />
          <p className="text-[12.5px] text-ink-3">
            <span className="font-semibold text-ink">{preencher(h.sessaoCom, { nome: primeiroNome(nomeDoPersonal) })}</span>{" "}
            · {proximaSessao.rotuloDoDia}, {proximaSessao.hora} · {proximaSessao.duracao}
          </p>
        </div>
      )}

      {/*
        O aviso de reavaliação (doc 05, tela 2, item 5).

        Fica **depois** do card de treino, não antes: quem abre o app está na
        academia para treinar, e uma fita métrica no topo empurraria a ação do
        dia para baixo. Mas fica antes do histórico, porque é uma coisa a fazer
        e o histórico é uma coisa a consultar.
      */}
      {reavaliacaoAberta && (
        <Link
          href="/app/reavaliacao"
          className="flex items-center gap-3 rounded-card bg-warning-bg px-4 py-3.5 transition hover:brightness-[0.98]"
        >
          <CalendarCheck size={18} className="shrink-0 text-warning" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-ink">
              {h.reavaliacao}
            </span>
            <span className="block text-[11px] text-ink-3">
              {preencher(h.querVer, { nome: primeiroNome(nomeDoPersonal) })}
            </span>
          </span>
          <span className="shrink-0 rounded-pill border border-ink px-2.5 py-1 text-[11px] font-bold text-ink">
            {h.fazerAgora}
          </span>
        </Link>
      )}

      {/*
        A porta de entrada do histórico, aberta no M1 porque o caminho até o
        próprio treino registrado passava por dentro da tela que abre sessão.
        Continua aqui mesmo com a aba Progresso já ligada (M2-04): progresso é
        "como estou evoluindo neste exercício", histórico é "o que eu fiz na
        terça" — são perguntas diferentes.
      */}
      <Link
        href="/app/historico"
        className="block rounded-card border border-border-soft bg-surface px-4 py-3 text-center text-[13px] font-semibold text-ink-2 transition hover:border-border-strong"
      >
        {h.verHistorico}
      </Link>
    </div>
  );
}

/**
 * Bom dia, boa tarde, boa noite — pela hora **do produto**, não a do servidor:
 * a Vercel roda em UTC, e às 21h de Brasília o servidor já está à meia-noite e
 * a home dizia "Bom dia" a quem chegava para o treino da noite.
 */
function saudacao(t: TextosDoApp): string {
  const hora = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hour: "2-digit", hour12: false }).format(
      new Date(),
    ),
  );
  const s = t.treinos.saudacao;
  if (hora < 12) return s.manha;
  if (hora < 18) return s.tarde;
  return s.noite;
}

/**
 * O treino que ficou aberto.
 *
 * Ele **substitui** o card de próximo treino em vez de conviver com ele: com os
 * dois na tela, e ainda por cima podendo ser o mesmo treino, a home passaria a
 * fazer duas propostas ao mesmo tempo. Quem tem treino aberto tem uma próxima
 * ação só — voltar para ele.
 *
 * Sem este card, a sessão aberta era invisível: o aluno só esbarrava nela ao
 * tentar começar outro treino, e as séries já registradas ficavam num lugar que
 * o histórico não mostra (sessão sem `finished_at` não é histórico, é agora).
 * Achado do teste de campo — o dado estava salvo, e ninguém conseguia vê-lo.
 */
function EmAndamento({ sessao, idioma }: { sessao: SessaoAberta; idioma: Idioma }) {
  const series = sessao.series_registradas;
  const t = TEXTOS_DO_APP[idioma];
  const h = t.treinos.home;
  const f = formatos(idioma);

  return (
    <section className="rounded-card-lg border-[1.5px] border-brand bg-brand-soft p-4.5">
      <p className="eyebrow text-brand">{h.emAndamento}</p>
      <h2 className="mt-2 text-[19px] font-extrabold tracking-[-0.01em] text-ink">
        {sessao.treino
          ? preencher(t.comum.treinoComNome, { label: sessao.treino.label, nome: sessao.treino.name })
          : t.comum.treinoRemovido}
      </h2>
      <p className="mt-1 text-[13px] text-ink-3">
        {preencher(h.comecado, {
          dia: f.diaNaFrase(sessao.started_at),
          hora: f.hora(sessao.started_at),
        })}
        {series > 0 ? ` · ${plural(series, h.seriesRegistradas)}` : ""}
      </p>

      <Link
        href={`/app/executar/${sessao.workout_id}`}
        className={classesDeBotao({ size: "lg", block: true, className: "mt-4" })}
      >
        {h.voltarAoTreino}
      </Link>

      <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-4">
        {h.naoEntra}
      </p>
    </section>
  );
}

/**
 * Os dois indicadores do doc 05.
 *
 * Aparecem em zero também: esconder faria a home mudar de forma no dia do
 * primeiro treino, e o aluno não entenderia de onde saíram os números. O que
 * evita a cara de punição é a frase de baixo, que só existe enquanto não há
 * nenhuma sessão — depois dela, zero dias seguidos é um fato que o aluno já
 * sabe interpretar.
 */
function Indicadores({ indicadores, t }: { indicadores: IndicadoresDoAluno; t: TextosDoApp }) {
  const { sequencia, sessoesTotais } = indicadores;
  const h = t.treinos.home;

  return (
    <section aria-label={h.seusNumeros} className="space-y-2">
      <div className="flex gap-2.5">
        <Indicador
          valor={sequencia}
          rotulo={sequencia === 1 ? h.diasSeguidos.um : h.diasSeguidos.outros}
          emoji="🔥"
        />
        <Indicador
          valor={sessoesTotais}
          rotulo={sessoesTotais === 1 ? h.sessoesTotais.um : h.sessoesTotais.outros}
        />
      </div>

      {sessoesTotais === 0 ? (
        <p className="text-[12px] leading-relaxed text-ink-5">
          {h.primeiroTreino}
        </p>
      ) : null}
    </section>
  );
}

function Indicador({
  valor,
  rotulo,
  emoji,
}: {
  valor: number;
  rotulo: string;
  emoji?: string;
}) {
  return (
    <div className="flex-1 rounded-card border border-border-soft bg-surface px-4 py-3">
      <p className="text-[24px] leading-none font-extrabold tracking-[-0.02em] text-ink tabular-nums">
        {emoji ? (
          <span aria-hidden className="mr-1 text-[18px]">
            {emoji}
          </span>
        ) : null}
        {valor}
      </p>
      <p className="eyebrow mt-1.5 text-[9px] text-ink-4">{rotulo}</p>
    </div>
  );
}

/**
 * Estado vazio. Não é erro: o aluno acabou de entrar pelo convite e o personal
 * ainda não montou nada. O texto diz de quem é a próxima ação, para o aluno
 * não ficar procurando um botão que não existe.
 */
function SemTreino({ nomeDoPersonal, t }: { nomeDoPersonal: string; t: TextosDoApp }) {
  const h = t.treinos.home;
  return (
    <section className="rounded-card-lg border border-border-soft bg-surface p-4.5 text-center">
      <p className="text-[15px] font-bold text-ink">
        {h.semTreino}
      </p>
      <p className="mx-auto mt-1.5 max-w-[280px] text-[13px] leading-relaxed text-ink-3">
        {preencher(h.montando, { nome: nomeDoPersonal })}
      </p>
    </section>
  );
}

/**
 * Avatar do doc 05. Não há foto ainda (upload é fase posterior), então a
 * inicial do nome — um círculo cinza vazio pareceria imagem quebrada.
 */
function Avatar({ nome }: { nome: string }) {
  return (
    <span
      aria-hidden
      className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[15px] font-bold text-ink-2"
    >
      {nome.trim().charAt(0).toUpperCase()}
    </span>
  );
}

