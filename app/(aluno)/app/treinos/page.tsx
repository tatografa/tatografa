import type { Metadata } from "next";

import { TelaListaDeTreinos } from "@/components/aluno/tela-lista-de-treinos";
import { requireStudent } from "@/lib/auth/session";
import { lerAgendaDoAluno, proximoTreino } from "@/lib/queries/aluno";

export const metadata: Metadata = { title: "Meus treinos" };

export default async function TreinosDoAluno() {
  const { student, personal } = await requireStudent();
  const { macrotreino, treinos } = await lerAgendaDoAluno(student.id);

  return (
    <TelaListaDeTreinos
      nomeDoPersonal={personal.name}
      macrotreino={macrotreino}
      treinos={treinos}
      idSugerido={proximoTreino(treinos)?.id ?? null}
    />
  );
}
