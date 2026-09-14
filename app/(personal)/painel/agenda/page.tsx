import type { Metadata } from "next";

import { requireTrainer } from "@/lib/auth/session";
import { semanaDe } from "@/lib/domain/agenda";
import { diaLocal } from "@/lib/domain/fuso";
import { lerSemanaDaAgenda, lerSessoesSemMarcacao } from "@/lib/queries/agenda";
import { listarAlunos } from "@/lib/queries/alunos";

import { TelaAgenda } from "./tela-agenda";

export const metadata: Metadata = { title: "Agenda" };

/**
 * A agenda de sessões presenciais (doc 06 §7).
 *
 * A semana vem da URL e é **validada aqui**: `?semana=` é texto editável, e um
 * valor torto tem de cair na semana de hoje em vez de virar consulta inválida.
 * `semanaDe` normaliza qualquer dia para a segunda da semana dele, então o
 * link continua funcionando se alguém digitar uma quarta-feira.
 *
 * O dia de hoje é calculado no **servidor**, no fuso do produto: no cliente ele
 * dependeria do relógio da máquina, e o destaque de "hoje" apareceria no dia
 * errado para quem está fora do Brasil — além de ficar vazio até a hidratação.
 */
export default async function Agenda({ searchParams }: PageProps<"/painel/agenda">) {
  const { semana: pedida } = await searchParams;
  const { trainer } = await requireTrainer();

  const ehDia = typeof pedida === "string" && /^\d{4}-\d{2}-\d{2}$/.test(pedida);
  const semana = semanaDe(ehDia ? `${pedida}T12:00:00Z` : new Date());

  const [sessoes, semMarcacao, alunos] = await Promise.all([
    lerSemanaDaAgenda(trainer.id, semana),
    lerSessoesSemMarcacao(trainer.id),
    listarAlunos(),
  ]);

  return (
    <TelaAgenda
      semana={semana}
      sessoes={sessoes}
      semMarcacao={semMarcacao}
      alunos={alunos}
      hoje={diaLocal(new Date().toISOString())}
    />
  );
}
