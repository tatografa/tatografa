import type { Metadata } from "next";

import { TelaHome } from "@/components/aluno/tela-home";
import { requireStudent } from "@/lib/auth/session";
import { lerAgendaDoAluno } from "@/lib/queries/aluno";

export const metadata: Metadata = { title: "Treinar" };

export default async function HomeDoAluno() {
  const { student, personal } = await requireStudent();
  const { macrotreino, treinos, sugerido } = await lerAgendaDoAluno(student.id);

  return (
    <TelaHome
      nomeDoAluno={student.name}
      nomeDoPersonal={personal.name}
      macrotreino={macrotreino}
      totalDeTreinos={treinos.length}
      proximo={sugerido}
    />
  );
}
