import Link from "next/link";
import { CalendarCheck, CalendarClock } from "lucide-react";

import { classesDeBotao } from "@/components/ui";
import { horaDaSessao, rotuloDoDia } from "@/lib/domain/historico";
import { saudacao } from "@/lib/domain/treino";
import type { SessaoAberta } from "@/lib/queries/execucao";
import type {
  IndicadoresDoAluno,
  MacrotreinoDoAluno,
  TreinoDaAgenda,
} from "@/lib/queries/aluno";

import { contagem } from "./card-de-treino";
import { CardMacrotreino } from "./card-macrotreino";

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
}: TelaHomeProps) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          {saudacao()}, {primeiroNome(nomeDoAluno)}
        </h1>
        <Avatar nome={nomeDoAluno} />
      </header>

      <Indicadores indicadores={indicadores} />

      {macrotreino ? (
        <CardMacrotreino
          nome={macrotreino.name}
          totalDeSemanas={macrotreino.total_weeks}
          inicio={macrotreino.started_at}
          nomeDoPersonal={nomeDoPersonal}
        />
      ) : null}

      {sessaoAberta ? (
        <EmAndamento sessao={sessaoAberta} />
      ) : proximo ? (
        <section className="rounded-card-lg border-[1.5px] border-brand bg-surface p-4.5">
          <p className="eyebrow text-brand">Seu próximo treino</p>
          <h2 className="mt-2 text-[19px] font-extrabold tracking-[-0.01em] text-ink">
            Treino {proximo.label} · {proximo.name}
          </h2>
          <p className="mt-1 text-[13px] text-ink-3">
            {contagem(proximo.total_exercicios)} · ~{proximo.duracao_min}min
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
            Iniciar treino
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
            {totalDeTreinos > 1 ? "Fazer outro treino" : "Ver o treino inteiro"}
          </Link>
        </section>
      ) : (
        <SemTreino nomeDoPersonal={nomeDoPersonal} />
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
            <span className="font-semibold text-ink">Sessão com {primeiroNome(nomeDoPersonal)}</span>{" "}
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
              Reavaliação disponível
            </span>
            <span className="block text-[11px] text-ink-3">
              {primeiroNome(nomeDoPersonal)} quer ver suas medidas
            </span>
          </span>
          <span className="shrink-0 rounded-pill border border-ink px-2.5 py-1 text-[11px] font-bold text-ink">
            Fazer agora
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
        Ver histórico
      </Link>
    </div>
  );
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
function EmAndamento({ sessao }: { sessao: SessaoAberta }) {
  const series = sessao.series_registradas;

  return (
    <section className="rounded-card-lg border-[1.5px] border-brand bg-brand-soft p-4.5">
      <p className="eyebrow text-brand">Treino em andamento</p>
      <h2 className="mt-2 text-[19px] font-extrabold tracking-[-0.01em] text-ink">
        {sessao.treino
          ? `Treino ${sessao.treino.label} · ${sessao.treino.name}`
          : "Treino removido"}
      </h2>
      <p className="mt-1 text-[13px] text-ink-3">
        Começado {rotuloDoDia(sessao.started_at).toLowerCase()} às{" "}
        {horaDaSessao(sessao.started_at)}
        {series > 0
          ? ` · ${series} ${series === 1 ? "série registrada" : "séries registradas"}`
          : ""}
      </p>

      <Link
        href={`/app/executar/${sessao.workout_id}`}
        className={classesDeBotao({ size: "lg", block: true, className: "mt-4" })}
      >
        Voltar para o treino
      </Link>

      <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-4">
        Enquanto ele estiver aberto, não entra no histórico. Conclua por lá para
        guardar.
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
function Indicadores({ indicadores }: { indicadores: IndicadoresDoAluno }) {
  const { sequencia, sessoesTotais } = indicadores;

  return (
    <section aria-label="Seus números" className="space-y-2">
      <div className="flex gap-2.5">
        <Indicador
          valor={sequencia}
          rotulo={sequencia === 1 ? "dia seguido" : "dias seguidos"}
          emoji="🔥"
        />
        <Indicador
          valor={sessoesTotais}
          rotulo={sessoesTotais === 1 ? "sessão total" : "sessões totais"}
        />
      </div>

      {sessoesTotais === 0 ? (
        <p className="text-[12px] leading-relaxed text-ink-5">
          Seu primeiro treino abre a contagem.
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
function SemTreino({ nomeDoPersonal }: { nomeDoPersonal: string }) {
  return (
    <section className="rounded-card-lg border border-border-soft bg-surface p-4.5 text-center">
      <p className="text-[15px] font-bold text-ink">
        Nenhum treino por aqui ainda
      </p>
      <p className="mx-auto mt-1.5 max-w-[280px] text-[13px] leading-relaxed text-ink-3">
        {nomeDoPersonal} ainda está montando seu programa. Assim que ficar
        pronto, ele aparece aqui.
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

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
