import type { Metadata } from "next";

import { TelaHome } from "@/components/aluno/tela-home";
import { requireStudent } from "@/lib/auth/session";
import { lerAgendaDoAluno, lerIndicadoresDoAluno } from "@/lib/queries/aluno";

export const metadata: Metadata = { title: "Treinar" };

export default async function HomeDoAluno() {
  const { student, personal } = await requireStudent();

  // As duas leituras são independentes: a agenda olha o programa ativo, os
  // indicadores olham o histórico. Em série, a home esperaria as duas em fila.
  const [{ macrotreino, treinos, sugerido }, indicadores] = await Promise.all([
    lerAgendaDoAluno(student.id),
    lerIndicadoresDoAluno(student.id),
  ]);

  return (
    <TelaHome
      nomeDoAluno={student.name}
      nomeDoPersonal={personal.name}
      macrotreino={macrotreino}
      totalDeTreinos={treinos.length}
      proximo={sugerido}
      indicadores={indicadores}
    />
  );
}
