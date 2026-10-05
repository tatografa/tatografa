import { TelaListaDeTreinos } from "@/components/aluno/tela-lista-de-treinos";
import { requireStudent } from "@/lib/auth/session";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { lerAgendaDoAluno } from "@/lib/queries/aluno";

export default async function TreinosDoAluno() {
  const { student, personal } = await requireStudent();
  const [{ macrotreino, treinos, sugerido }, { idioma }] = await Promise.all([
    lerAgendaDoAluno(student.id),
    textosDoApp(),
  ]);

  return (
    <TelaListaDeTreinos
      nomeDoPersonal={personal.name}
      macrotreino={macrotreino}
      treinos={treinos}
      idSugerido={sugerido?.id ?? null}
      idioma={idioma}
    />
  );
}
