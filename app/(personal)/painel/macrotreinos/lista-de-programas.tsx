import Link from "next/link";
import { Plus } from "lucide-react";

import { Badge, Button, Card, classesDeBotao } from "@/components/ui";
import { diaLocal } from "@/lib/domain/fuso";
import { semanaAtual } from "@/lib/domain/treino";
import type { Macrotreino, ProgramasDoAluno } from "@/lib/queries/macrotreinos";

import { BotaoArquivar, BotaoAtivar } from "./acoes-do-programa";
import { primeiroNome } from "./textos";

/**
 * A tela de macrotreinos, sem nenhum acesso a banco.
 *
 * Separada da página pelo mesmo motivo das telas do aluno: assim ela se abre no
 * navegador com props fixas, que é o único jeito de conferir a interface neste
 * ambiente — o host do Supabase é bloqueado pela rede.
 */
export function ListaDeProgramas({ porAluno }: { porAluno: ProgramasDoAluno[] }) {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-ink-4">Macrotreinos</p>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {porAluno.length === 0
              ? "Nenhum aluno ainda"
              : `${porAluno.length} aluno${porAluno.length > 1 ? "s" : ""}`}
          </h1>
        </div>
        {porAluno.length > 0 && (
          <Link href="/painel/macrotreinos/novo" className={classesDeBotao()}>
            <Plus size={16} aria-hidden /> Novo programa
          </Link>
        )}
      </header>

      {porAluno.length === 0 ? (
        <SemAluno />
      ) : (
        <div className="space-y-8">
          {porAluno.map(({ aluno, ativo, arquivados }) => (
            <section key={aluno.id} className="space-y-3">
              <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                {aluno.name}
              </h2>

              {ativo ? (
                <ProgramaAtivo programa={ativo} aluno={aluno.name} />
              ) : (
                <SemPrograma alunoId={aluno.id} aluno={aluno.name} />
              )}

              {arquivados.length > 0 && (
                <ul className="space-y-2">
                  {arquivados.map((programa) => (
                    <li key={programa.id}>
                      <ProgramaArquivado
                        programa={programa}
                        aluno={aluno.name}
                        ativoAtual={ativo?.name ?? null}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramaAtivo({ programa, aluno }: { programa: Macrotreino; aluno: string }) {
  // A semana sai de `semanaAtual` — derivada de `started_at`, nunca de coluna.
  // É o mesmo número que o aluno vê na home dele.
  const semana = semanaAtual(programa.started_at, programa.total_weeks);

  return (
    <Card size="lg" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge tone="brand">Ativo</Badge>
            <p className="truncate text-[15.5px] font-bold text-ink">{programa.name}</p>
          </div>
          <p className="text-[12.5px] text-ink-4">
            Semana {semana} de {programa.total_weeks} · início em{" "}
            {porExtenso(programa.started_at)} · {contagemDeTreinos(programa.total_treinos)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/painel/macrotreinos/${programa.id}`}
            className={classesDeBotao({ size: "sm", variant: "secondary" })}
          >
            Editar
          </Link>
          <BotaoArquivar id={programa.id} nome={programa.name} aluno={aluno} />
        </div>
      </div>

      <div
        className="h-1 overflow-hidden rounded-pill bg-canvas-sunken"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={programa.total_weeks}
        aria-valuenow={semana}
        aria-label={`Semana ${semana} de ${programa.total_weeks}`}
      >
        <div
          className="h-full bg-brand"
          style={{ width: `${Math.round((semana / programa.total_weeks) * 100)}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border-soft pt-3.5">
        <Link
          href={`/painel/treinos/novo?programa=${programa.id}`}
          className={classesDeBotao({ size: "sm" })}
        >
          <Plus size={15} aria-hidden /> Montar treino
        </Link>
        {programa.total_treinos > 0 && (
          <Link
            href="/painel/treinos"
            className="text-[12.5px] font-semibold text-ink-4 transition hover:text-ink-2"
          >
            Ver os treinos
          </Link>
        )}
      </div>
    </Card>
  );
}

function ProgramaArquivado({
  programa,
  aluno,
  ativoAtual,
}: {
  programa: Macrotreino;
  aluno: string;
  ativoAtual: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-soft bg-surface px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Badge tone="neutro">Arquivado</Badge>
          <p className="truncate text-[14px] font-semibold text-ink-2">{programa.name}</p>
        </div>
        <p className="mt-0.5 text-[12px] text-ink-4">
          {programa.total_weeks} semanas · início em {porExtenso(programa.started_at)} ·{" "}
          {contagemDeTreinos(programa.total_treinos)}
        </p>
      </div>
      <BotaoAtivar
        id={programa.id}
        nome={programa.name}
        aluno={aluno}
        ativoAtual={ativoAtual}
      />
    </div>
  );
}

/**
 * Estado vazio do card: aluno sem programa ativo.
 *
 * O texto diz a consequência, não só o fato: sem programa o aluno abre o app e
 * não tem o que fazer, e é o personal que resolve isso.
 */
function SemPrograma({ alunoId, aluno }: { alunoId: string; aluno: string }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[13.5px] text-ink-3">
        {primeiroNome(aluno)} está sem programa — e sem treino no app.
      </p>
      <Link
        href={`/painel/macrotreinos/novo?aluno=${alunoId}`}
        className={classesDeBotao({ size: "sm", variant: "secondary" })}
      >
        Criar programa
      </Link>
    </Card>
  );
}

function SemAluno() {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          Convide um aluno primeiro
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          Todo macrotreino pertence a um aluno. Gere um convite no painel e volte aqui
          quando ele tiver entrado.
        </p>
      </div>
      <Link href="/painel">
        <Button>Convidar aluno</Button>
      </Link>
    </Card>
  );
}

function contagemDeTreinos(total: number): string {
  if (total === 0) return "sem treinos";
  return `${total} treino${total > 1 ? "s" : ""}`;
}

/**
 * "01/09/2026" a partir de "2026-09-01".
 *
 * Formatado à mão, sem `Date`: a coluna `started_at` já é um dia de calendário,
 * e `new Date("2026-09-01")` é meia-noite UTC — que em São Paulo ainda é 31 de
 * agosto (`lib/domain/fuso.ts`).
 */
function porExtenso(dia: string): string {
  const [ano, mes, data] = diaLocal(dia).split("-");
  return `${data}/${mes}/${ano}`;
}
