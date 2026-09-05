import Link from "next/link";

import { Badge } from "@/components/ui";
import type { AlunoDaLista } from "@/lib/queries/alunos";
import { OBJETIVO, STATUS_DO_ALUNO } from "@/lib/rotulos";

/**
 * A lista de alunos do painel, sem nenhum acesso a banco.
 *
 * Componente à parte da página pelo mesmo motivo das telas do aluno: assim ele
 * se abre no navegador com props fixas, que é o único jeito de conferir a
 * interface neste ambiente — o host do Supabase é bloqueado pela rede.
 */
export function ListaDeAlunos({ alunos }: { alunos: AlunoDaLista[] }) {
  if (!alunos.length) {
    return (
      <p className="text-[14px] text-ink-3">
        Nenhum aluno entrou ainda. Assim que alguém abrir o convite, aparece
        aqui.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {alunos.map((aluno) => (
        <li key={aluno.id}>
          {/*
            Link de novo: no M1 este cartão não levava a lugar nenhum porque
            `/painel/alunos/[id]` não existia, e um link para 404 era pior que
            um cartão parado. O M2-06 criou a rota e a dívida está paga.
          */}
          <Link
            href={`/painel/alunos/${aluno.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3.5 transition hover:border-border-strong"
          >
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-semibold text-ink">
                {aluno.name}
              </p>
              <p className="truncate text-[12.5px] text-ink-4">
                {aluno.goal ? OBJETIVO[aluno.goal] : "Sem objetivo definido"}
                {" · "}
                {aluno.ultima_sessao
                  ? `treinou ${desde(aluno.ultima_sessao)}`
                  : "ainda não treinou"}
              </p>
            </div>
            <Badge tone={aluno.status === "ativo" ? "sucesso" : "neutro"}>
              {STATUS_DO_ALUNO[aluno.status]}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** "hoje" / "há 3 dias" — leitura rápida na lista de alunos. */
function desde(iso: string): string {
  const dias = Math.floor(
    (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000),
  );
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}
