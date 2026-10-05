import { requireTrainer } from "@/lib/auth/session";
import { mesDe, semanaDe } from "@/lib/domain/agenda";
import { diaLocal } from "@/lib/domain/fuso";
import {
  lerAgendaEntre,
  lerIndicadoresDaAgenda,
  lerSessoesSemMarcacao,
  proximaSessaoDoPersonal,
} from "@/lib/queries/agenda";
import { listarAlunos } from "@/lib/queries/alunos";
import { lerReavaliacoesDaCarteira } from "@/lib/queries/reavaliacao";

import { TelaAgenda } from "./tela-agenda";

/**
 * Agenda e reavaliações numa tela só (27/09, pedido do Otávio, layout da tela
 * "Reavaliações" do protótipo): os números do topo, o calendário de semana ou
 * de mês, e à direita a próxima sessão e as filas — o que espera marcação e o
 * que espera o aluno.
 *
 * Visão, semana e mês vêm da URL e são **validados aqui**: são texto editável,
 * e um valor torto cai no hoje em vez de virar consulta inválida. `semanaDe` e
 * `mesDe` normalizam qualquer dia, então o link continua certo se alguém
 * digitar uma quarta-feira.
 *
 * O dia de hoje é calculado no **servidor**, no fuso do produto: no cliente
 * dependeria do relógio da máquina.
 */
export default async function Agenda({ searchParams }: PageProps<"/painel/agenda">) {
  const { semana: pedida, mes: mesPedido, visao, aluno: alunoPedido } = await searchParams;
  const { trainer } = await requireTrainer();
  const hoje = diaLocal(new Date().toISOString());

  const ehDia = typeof pedida === "string" && /^\d{4}-\d{2}-\d{2}$/.test(pedida);
  const ehMes = typeof mesPedido === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(mesPedido);
  const verMes = visao === "mes";

  // Dia solto ("2026-09-15") já é dia de calendário para `diaLocal`: não
  // passa por fuso nenhum.
  const semana = semanaDe(ehDia ? pedida : hoje);
  const mes = mesDe(ehMes ? `${mesPedido}-01` : ehDia ? pedida : hoje);
  const faixa = verMes ? mes : semana;

  const [sessoes, semMarcacao, alunos, reavaliacoes, indicadores, proxima] = await Promise.all([
    lerAgendaEntre(trainer.id, faixa.de, faixa.ate),
    lerSessoesSemMarcacao(trainer.id),
    listarAlunos(),
    lerReavaliacoesDaCarteira(trainer.id),
    lerIndicadoresDaAgenda(trainer.id, hoje),
    proximaSessaoDoPersonal(trainer.id),
  ]);

  /*
   * A ficha do aluno manda `?aluno=<id>` no botão "Agendar sessão", e o diálogo
   * abre já com ele escolhido. O id é conferido contra a carteira **que o RLS
   * devolveu** — id de estranho, ou torto, simplesmente não pré-seleciona
   * ninguém.
   */
  const alunoInicial =
    typeof alunoPedido === "string" && alunos.some((a) => a.id === alunoPedido)
      ? alunoPedido
      : null;

  return (
    <TelaAgenda
      visao={verMes ? "mes" : "semana"}
      semana={semana}
      mes={mes}
      sessoes={sessoes}
      semMarcacao={semMarcacao}
      alunos={alunos}
      alunoInicial={alunoInicial}
      reavaliacoes={reavaliacoes}
      indicadores={indicadores}
      proxima={proxima}
      hoje={hoje}
      agora={new Date().toISOString()}
    />
  );
}
