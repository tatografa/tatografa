import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { macrotreinosAtivos } from "@/lib/queries/treinos";

import { EditorDeTreino, type ProgramaDoAluno } from "../editor-de-treino";

export const metadata: Metadata = { title: "Novo treino" };

export default async function NovoTreinoPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const { aluno } = await searchParams;
  const supabase = await createClient();

  // O RLS de `students` já limita à carteira do personal logado.
  const [{ data: alunos }, programas] = await Promise.all([
    supabase.from("students").select("id, name").order("name"),
    macrotreinosAtivos(),
  ]);

  const programaPorAluno: Record<string, ProgramaDoAluno | undefined> = {};
  for (const [alunoId, macro] of programas) {
    programaPorAluno[alunoId] = {
      id: macro.id,
      name: macro.name,
      total_weeks: macro.total_weeks,
    };
  }

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
          Novo treino
        </h1>
      </header>

      <EditorDeTreino
        alunos={alunos ?? []}
        programaPorAluno={programaPorAluno}
        alunoInicial={aluno}
      />
    </div>
  );
}
