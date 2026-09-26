import type { Metadata } from "next";

import { TelaHome } from "@/components/aluno/tela-home";
import { requireStudent } from "@/lib/auth/session";
import {
  duracaoEmTexto,
  horaDaSessaoNaAgenda,
  rotuloDoDiaDaAgenda,
} from "@/lib/domain/agenda";
import { lerAgendaDoAluno, lerIndicadoresDoAluno } from "@/lib/queries/aluno";
import { sessaoAbertaDoAluno } from "@/lib/queries/execucao";
import { proximaSessaoDoAluno } from "@/lib/queries/agenda";
import { temReavaliacaoAberta } from "@/lib/queries/reavaliacao";

export const metadata: Metadata = { title: "Treinar" };

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
  ] = await Promise.all([
    lerAgendaDoAluno(student.id),
    lerIndicadoresDoAluno(student.id),
    sessaoAbertaDoAluno(student.id),
    temReavaliacaoAberta(student.id),
    proximaSessaoDoAluno(student.id),
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
          rotuloDoDia: rotuloDoDiaDaAgenda(proxima.dia),
          hora: horaDaSessaoNaAgenda(proxima.inicio),
          duracao: duracaoEmTexto(proxima.duracaoMin),
        }
      }
    />
  );
}
