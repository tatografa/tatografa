import Link from "next/link";

import { classesDeBotao } from "@/components/ui";
import { saudacao } from "@/lib/domain/treino";
import type { MacrotreinoDoAluno, TreinoDaAgenda } from "@/lib/queries/aluno";

import { contagem } from "./card-de-treino";
import { CardMacrotreino } from "./card-macrotreino";

export type TelaHomeProps = {
  nomeDoAluno: string;
  nomeDoPersonal: string;
  macrotreino: MacrotreinoDoAluno | null;
  totalDeTreinos: number;
  /** O treino sugerido; nulo quando o personal ainda não montou nada. */
  proximo: TreinoDaAgenda | null;
};

/**
 * Home do aluno (doc 05, tela 2), sem nenhum acesso a banco.
 *
 * A tela é um componente à parte da página de propósito: assim ela se abre no
 * navegador com props fixas, que é o único jeito de conferir a interface neste
 * ambiente — o host do Supabase é bloqueado pela rede.
 *
 * Os indicadores de streak e sessões totais do doc dependem de histórico e são
 * M2; não entram aqui zerados, porque "0 DIAS SEGUIDOS" na primeira abertura
 * do app parece punição.
 */
export function TelaHome({
  nomeDoAluno,
  nomeDoPersonal,
  macrotreino,
  totalDeTreinos,
  proximo,
}: TelaHomeProps) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          {saudacao()}, {primeiroNome(nomeDoAluno)}
        </h1>
        <Avatar nome={nomeDoAluno} />
      </header>

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

          {totalDeTreinos > 1 ? (
            <Link
              href="/app/treinos"
              className="mt-3 block text-center text-[12px] font-medium text-ink-5 transition hover:text-ink-3"
            >
              Fazer outro treino
            </Link>
          ) : null}
        </section>
      ) : (
        <SemTreino nomeDoPersonal={nomeDoPersonal} />
      )}

      {/*
        A porta de entrada do histórico. Ficava só no rodapé de `/app/treinos`,
        e a home só oferece `/app/treinos` quando há mais de um treino: o aluno
        do piloto, com um treino só, terminava a primeira sessão e o caminho até
        o próprio histórico passava por dentro da tela que abre sessão.
        A aba Progresso, que seria o lugar natural, é M2.
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
