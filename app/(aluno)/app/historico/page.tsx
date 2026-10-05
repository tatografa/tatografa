import { TelaHistorico } from "@/components/aluno/tela-historico";
import { requireStudent } from "@/lib/auth/session";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { listarHistorico } from "@/lib/queries/historico";

export default async function HistoricoDoAluno() {
  const { student } = await requireStudent();
  const [sessoes, { idioma }] = await Promise.all([listarHistorico(student.id), textosDoApp()]);

  return <TelaHistorico sessoes={sessoes} idioma={idioma} />;
}
