import type { Metadata } from "next";

import { TelaSocial } from "@/components/personal/tela-social";
import { requireTrainer } from "@/lib/auth/session";
import { periodoDaUrl } from "@/lib/domain/feed";
import { alunosDoFiltro, lerPostsDaCarteira } from "@/lib/queries/social";

import { CurtirDoPainel, ResponderDoPainel } from "./controles-do-post";
import { FiltrosDoFeed } from "./filtros-do-feed";

export const metadata: Metadata = { title: "Feed" };

/**
 * Os posts dos alunos (doc 06, tela 8; layout do protótipo desde 27/09).
 *
 * **Esta tela é a outra ponta do compositor.** O aluno publica marcando "só o
 * meu personal" — o padrão — e até aqui esse post não tinha leitor: a policy
 * liberava e nenhuma tela lia. É também o único lugar onde o personal responde
 * um post sem virar aluno.
 *
 * Aluno e período vêm da URL e são **palpites**: período desconhecido cai em
 * "todo o período", e aluno que não está na carteira que o RLS devolveu não
 * filtra nada — a mesma regra da agenda com `?aluno=` (18/09).
 */
export default async function Social({ searchParams }: PageProps<"/painel/social">) {
  const { periodo, aluno } = await searchParams;
  const escolhido = periodoDaUrl(periodo);

  const { trainer } = await requireTrainer();
  const alunos = await alunosDoFiltro();
  const alunoId = alunos.some((a) => a.id === aluno) ? (aluno as string) : null;
  const posts = await lerPostsDaCarteira(trainer.id, escolhido, alunoId);

  return (
    <TelaSocial
      posts={posts}
      periodo={escolhido}
      filtrado={alunoId !== null}
      filtros={<FiltrosDoFeed alunos={alunos} alunoId={alunoId} periodo={escolhido} />}
      curtir={(post) => (
        <CurtirDoPainel postId={post.id} curtidas={post.curtidas} curtiPor={post.curtiPor} />
      )}
      responder={(post) => <ResponderDoPainel postId={post.id} aluno={post.aluno.nome} />}
    />
  );
}
