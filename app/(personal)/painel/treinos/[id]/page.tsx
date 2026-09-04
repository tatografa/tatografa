import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { lerTreino } from "@/lib/queries/treinos";

import { EditorDeTreino, type ItemDoEditor } from "../editor-de-treino";

export const metadata: Metadata = { title: "Editar treino" };

export default async function EditarTreinoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  const [{ id }, { salvo }] = await Promise.all([params, searchParams]);

  const treino = await lerTreino(id);
  // `lerTreino` devolve nulo tanto para id inexistente quanto para treino de
  // outro personal: os dois casos são "não existe" para quem está olhando.
  if (!treino) notFound();

  const itens: ItemDoEditor[] = treino.exercicios.map((exercicio) => ({
    chave: exercicio.id,
    id: exercicio.id,
    exerciseId: exercicio.exercicio.id,
    source: exercicio.exercicio.source,
    nome: exercicio.exercicio.name,
    grupo: exercicio.exercicio.muscle_group,
    equipamento: exercicio.exercicio.equipment,
    sets: String(exercicio.sets),
    reps: exercicio.reps_target,
    rest: String(exercicio.rest_seconds),
    technique: exercicio.technique ?? "",
    notes: exercicio.notes ?? "",
    seriesRegistradas: exercicio.series_registradas,
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/painel/treinos"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Treinos
        </Link>
        <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          {treino.label} · {treino.name}
        </h1>
        <p className="text-[13.5px] text-ink-3">
          {treino.aluno.name} · {treino.total_series} séries · ~{treino.duracao_min} min
        </p>
      </header>

      {/*
        O programa vem do próprio treino, não de uma consulta ao programa ativo
        do aluno: um treino de programa arquivado continua editável, e buscar "o
        ativo" mostraria o nome do programa errado no cabeçalho do editor.
      */}
      <EditorDeTreino
        programa={{
          id: treino.macrotreino.id,
          name: treino.macrotreino.name,
          total_weeks: treino.macrotreino.total_weeks,
          aluno: treino.aluno,
        }}
        salvo={salvo === "1"}
        treino={{
          id: treino.id,
          label: treino.label,
          nome: treino.name,
          observacao: treino.notes ?? "",
          itens,
        }}
      />
    </div>
  );
}
