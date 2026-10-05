import { notFound } from "next/navigation";

import { TelaDoPost } from "@/components/aluno/tela-do-post";
import { requireStudent } from "@/lib/auth/session";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { lerPost } from "@/lib/queries/feed";

import { ApagarPost } from "./apagar-post";
import { BotaoDeCurtir } from "./botao-de-curtir";
import { FormularioDeComentario } from "./formulario-de-comentario";

export default async function PostDoFeedPage(
  props: PageProps<"/app/feed/[postId]">,
) {
  const { postId } = await props.params;
  const { student, personal } = await requireStudent();

  const { idioma } = await textosDoApp();
  const post = await lerPost(
    student.id,
    postId,
    { id: personal.id, nome: personal.name },
    idioma,
  );

  // Post de fora da turma, id inexistente e id malformado caem todos aqui: são
  // a mesma coisa para quem está olhando, e separá-los contaria a um estranho
  // que aquele post existe.
  if (!post) notFound();

  return (
    <TelaDoPost
      idioma={idioma}
      post={post}
      idDoPersonal={personal.id}
      acoes={
        <BotaoDeCurtir
          postId={post.id}
          curtidas={post.curtidas}
          curtiPor={post.curtiPor}
        />
      }
      exclusao={
        post.meu ? (
          <ApagarPost postId={post.id} temFoto={post.fotoUrl !== null} />
        ) : null
      }
      formulario={<FormularioDeComentario postId={post.id} />}
    />
  );
}
