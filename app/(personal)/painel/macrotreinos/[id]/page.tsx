import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, classesDeBotao } from "@/components/ui";
import { diaLocal } from "@/lib/domain/fuso";
import { semanaAtual } from "@/lib/domain/treino";
import { lerMacrotreino } from "@/lib/queries/macrotreinos";

import { BotaoArquivar } from "../acoes-do-programa";
import { FormularioDePrograma } from "../formulario-de-programa";

export const metadata: Metadata = { title: "Editar programa" };

export default async function EditarProgramaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  const [{ id }, { salvo }] = await Promise.all([params, searchParams]);

  const programa = await lerMacrotreino(id);
  // Nulo cobre id inexistente e programa de outro personal: são a mesma coisa
  // para quem está olhando.
  if (!programa) notFound();

  const ativo = programa.status === "ativo";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/painel/macrotreinos"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Macrotreinos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {programa.name}
          </h1>
          <Badge tone={ativo ? "brand" : "neutro"}>
            {ativo ? "Ativo" : "Arquivado"}
          </Badge>
        </div>
        <p className="text-[13.5px] text-ink-3">
          {programa.aluno.name}
          {ativo
            ? ` · semana ${semanaAtual(programa.started_at, programa.total_weeks)} de ${programa.total_weeks}`
            : " · fora da tela do aluno"}
        </p>
      </header>

      {salvo === "1" && (
        <p
          role="status"
          className="max-w-xl rounded-card border border-success/30 bg-success/10 px-4 py-3 text-[13.5px] font-semibold text-success-dark"
        >
          Programa salvo.
        </p>
      )}

      <FormularioDePrograma
        hoje={diaLocal(new Date())}
        programa={{
          id: programa.id,
          nome: programa.name,
          semanas: programa.total_weeks,
          inicio: programa.started_at,
          aluno: programa.aluno.name,
        }}
      />

      <div className="max-w-xl space-y-3 border-t border-border pt-6">
        <p className="eyebrow text-ink-4">Treinos deste programa</p>
        <div className="flex flex-wrap items-center gap-3">
          {ativo ? (
            <Link
              href={`/painel/treinos/novo?programa=${programa.id}`}
              className={classesDeBotao({ size: "sm", variant: "secondary" })}
            >
              Montar treino
            </Link>
          ) : (
            <p className="text-[13px] text-ink-3">
              Programa arquivado não recebe treino novo — o aluno não veria. Ative ele
              na lista para voltar a montar.
            </p>
          )}
          {programa.total_treinos > 0 && (
            <span className="text-[13px] text-ink-4">
              {programa.total_treinos} treino{programa.total_treinos > 1 ? "s" : ""}{" "}
              montado{programa.total_treinos > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {ativo && (
          <div className="pt-2">
            <BotaoArquivar
              id={programa.id}
              nome={programa.name}
              aluno={programa.aluno.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
