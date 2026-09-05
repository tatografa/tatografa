import Link from "next/link";

import { classesDeBotao } from "@/components/ui";
import { saudacao } from "@/lib/domain/treino";
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

      {proximo ? (
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
