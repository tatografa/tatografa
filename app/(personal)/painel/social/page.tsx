import type { Metadata } from "next";

import { TelaSocial } from "@/components/personal/tela-social";
import { requireTrainer } from "@/lib/auth/session";
import type { PeriodoDoSocial } from "@/lib/domain/feed";
import { lerPostsDaCarteira } from "@/lib/queries/social";

import { ControlesDoPost } from "./controles-do-post";

export const metadata: Metadata = { title: "Social" };

/**
 * Os posts dos alunos (doc 06, tela 8).
 *
 * **Esta tela é a outra ponta do compositor.** O aluno publica marcando "só o
 * meu personal" — o padrão — e até aqui esse post não tinha leitor: a policy
 * liberava e nenhuma tela lia. É também o único lugar onde o personal responde
 * um post sem virar aluno.
 *
 * O período vem da URL e é validado aqui: `?periodo=` é texto editável, e um
 * valor desconhecido tem de cair no padrão em vez de virar consulta inválida.
 */
export default async function Social({ searchParams }: PageProps<"/painel/social">) {
  const { periodo } = await searchParams;
  const escolhido: PeriodoDoSocial =
    periodo === "7" || periodo === "tudo" ? periodo : "30";

  const { trainer } = await requireTrainer();
  const posts = await lerPostsDaCarteira(trainer.id, escolhido);

  return (
    <TelaSocial
      posts={posts}
      periodo={escolhido}
      controles={(post) => (
        <ControlesDoPost
          postId={post.id}
          curtidas={post.curtidas}
          curtiPor={post.curtiPor}
        />
      )}
    />
  );
}
