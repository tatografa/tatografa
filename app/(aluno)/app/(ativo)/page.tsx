import { TelaHome } from "@/components/aluno/tela-home";
import { requireStudent } from "@/lib/auth/session";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { lerAgendaDoAluno, lerIndicadoresDoAluno } from "@/lib/queries/aluno";
import { sessaoAbertaDoAluno } from "@/lib/queries/execucao";
import { proximaSessaoDoAluno } from "@/lib/queries/agenda";
import { temReavaliacaoAberta } from "@/lib/queries/reavaliacao";

export default async function HomeDoAluno() {
  const { student, personal } = await requireStudent();

  // As duas leituras são independentes: a agenda olha o programa ativo, os
  // indicadores olham o histórico. Em série, a home esperaria as duas em fila.
  const [
    { macrotreino, treinos, sugerido },
    indicadores,
    sessaoAberta,
    reavaliacaoAberta,
    proxima,
    { idioma, f },
  ] = await Promise.all([
    lerAgendaDoAluno(student.id),
    lerIndicadoresDoAluno(student.id),
    sessaoAbertaDoAluno(student.id),
    temReavaliacaoAberta(student.id),
    proximaSessaoDoAluno(student.id),
    textosDoApp(),
  ]);

  return (
    <TelaHome
      nomeDoAluno={student.name}
      nomeDoPersonal={personal.name}
      macrotreino={macrotreino}
      totalDeTreinos={treinos.length}
      proximo={sugerido}
      indicadores={indicadores}
      sessaoAberta={sessaoAberta}
      reavaliacaoAberta={reavaliacaoAberta}
      proximaSessao={
        proxima && {
          // Formatado no servidor, no fuso do produto: no cliente a data ficaria
          // vazia até a hidratação e dependeria do relógio do aparelho.
          rotuloDoDia: f.diaDaAgenda(proxima.dia),
          hora: f.horaDaAgenda(proxima.inicio),
          duracao: f.duracaoEmMinutos(proxima.duracaoMin),
        }
      }
      idioma={idioma}
    />
  );
}
