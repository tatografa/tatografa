import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CurtirDoPainel,
  ResponderDoPainel,
} from "@/app/(personal)/painel/social/controles-do-post";
import { FichaDoAluno } from "@/components/personal/ficha-do-aluno";
import { requireTrainer } from "@/lib/auth/session";
import { montarAtividade } from "@/lib/domain/atividade";
import { semanaAtual } from "@/lib/domain/treino";
import { lerAluno, resumoDoAluno } from "@/lib/queries/alunos";
import { lerTreinosDoPrograma } from "@/lib/queries/divisao";
import { listarHistorico } from "@/lib/queries/historico";
import { programaAtivoDoAluno } from "@/lib/queries/macrotreinos";
import { listarObservacoes } from "@/lib/queries/observacoes";
import { progressoDoAluno } from "@/lib/queries/progresso";
import { lerReavaliacoesDeUmAluno } from "@/lib/queries/reavaliacao";
import { lerPostsDaCarteira, treinosDasSessoes } from "@/lib/queries/social";

export const metadata: Metadata = { title: "Aluno" };

/**
 * O perfil do aluno (doc 06 §4, no layout do protótipo desde 27/09).
 *
 * As leituras do histórico são as **mesmas** que o app do aluno usa —
 * `listarHistorico` e `progressoDoAluno` já funcionam para o personal, porque
 * `workout_sessions_select` libera `private.trainer_of(student_id)` e
 * `session_sets_select` passa por `can_read_session`. Nenhuma policy nova, e
 * nenhum número recalculado: o que o personal vê é o que o aluno vê.
 *
 * Os posts saem da consulta do feed do painel filtrada pelo aluno — o cartão é
 * o mesmo, a conversa também.
 */
export default async function AlunoDoPainel(
  props: PageProps<"/painel/alunos/[id]">,
) {
  const { id } = await props.params;
  const { trainer } = await requireTrainer();

  // Aluno de outro personal e id inexistente dão o mesmo 404: distinguir
  // contaria a um estranho que aquele id existe.
  const aluno = await lerAluno(id);
  if (!aluno) notFound();

  // Sem `comFotos`: a ficha mostra os números, e a foto do corpo do aluno fica
  // na tela de reavaliações, onde o personal foi de propósito. Assinar três
  // URLs por ciclo aqui seria pagar por imagem que ninguém abriu.
  const [programa, sessoes, exercicios, reavaliacoes, observacoes, resumo, posts] =
    await Promise.all([
      programaAtivoDoAluno(aluno.id),
      listarHistorico(aluno.id),
      progressoDoAluno(aluno.id),
      lerReavaliacoesDeUmAluno(trainer.id, aluno.id),
      listarObservacoes(aluno.id),
      // Sessões totais e dias seguidos vêm agregados do banco, e não de
      // `sessoes`: aquela lista tem teto de 50, e o total pararia em "50" para
      // sempre justamente no aluno que mais treina.
      resumoDoAluno(aluno.id),
      lerPostsDaCarteira(trainer.id, "tudo", aluno.id),
    ]);

  /*
   * O bloco escuro só para as sessões que viram cartão e não trouxeram post —
   * as que trouxeram já vêm com o dele. Limitado aos cartões da tela, e não às
   * cinquenta sessões do histórico: as séries vêm numa consulta só, e o corte
   * de página do PostgREST é silencioso.
   */
  const { itens } = montarAtividade(sessoes, posts);
  const semPost = itens.flatMap((i) => (i.tipo === "sessao" && !i.post ? [i.sessao.id] : []));

  const [treinos, blocos] = await Promise.all([
    programa ? lerTreinosDoPrograma(programa.id) : Promise.resolve([]),
    treinosDasSessoes(semPost),
  ]);

  return (
    <FichaDoAluno
      aluno={aluno}
      programa={programa}
      // A semana sai da mesma função que o app do aluno usa, e aqui no
      // servidor: no navegador a conta usaria o relógio do aparelho.
      semana={programa ? semanaAtual(programa.started_at, programa.total_weeks) : null}
      treinos={treinos}
      sessoes={sessoes}
      posts={posts}
      treinosDasSessoes={Object.fromEntries(blocos)}
      exercicios={exercicios}
      reavaliacoes={reavaliacoes}
      observacoes={observacoes}
      resumo={resumo}
      curtir={(post) => (
        <CurtirDoPainel postId={post.id} curtidas={post.curtidas} curtiPor={post.curtiPor} />
      )}
      responder={(post) => <ResponderDoPainel postId={post.id} aluno={post.aluno.nome} />}
    />
  );
}
