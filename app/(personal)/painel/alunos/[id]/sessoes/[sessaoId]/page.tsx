import { notFound } from "next/navigation";

import { TelaSessaoDoHistorico } from "@/components/aluno/tela-sessao-do-historico";
import { requireTrainer } from "@/lib/auth/session";
import { lerAluno } from "@/lib/queries/alunos";
import { lerSessaoDoHistorico } from "@/lib/queries/historico";
import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";

/**
 * Uma sessão do aluno, série a série, vista pelo personal.
 *
 * A tela é **a mesma** do app do aluno: só o link de voltar muda. Reescrever o
 * detalhe aqui duplicaria a regra de série ausente, pulada e órfã — três
 * estados que o M1-06 levou um card inteiro para acertar —, e as duas cópias
 * divergiriam na primeira correção.
 */
export default async function SessaoDoAluno(
  props: PageProps<"/painel/alunos/[id]/sessoes/[sessaoId]">,
) {
  const { id, sessaoId } = await props.params;
  await requireTrainer();

  const aluno = await lerAluno(id);
  if (!aluno) notFound();

  // `lerSessaoDoHistorico` filtra por `student_id`, então uma sessão de outro
  // aluno com este id na URL devolve nulo em vez de vazar o treino alheio.
  const sessao = await lerSessaoDoHistorico(aluno.id, sessaoId);
  if (!sessao) notFound();

  return (
    <>
      <CabecalhoDaPagina
        titulo="Treino registrado"
        subtitulo={aluno.name}
      />
      {/* A tela é a mesma que o aluno vê, com o próprio caminho de volta —
          ela é compartilhada com o app, e lá não existe esta moldura. */}
      <TelaSessaoDoHistorico
        sessao={sessao}
        voltarPara={{ href: `/painel/alunos/${aluno.id}`, rotulo: aluno.name }}
      />
    </>
  );
}
