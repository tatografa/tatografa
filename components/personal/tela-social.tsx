import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { CartaoDeAtividade } from "@/components/personal/cartao-de-atividade";
import { PERIODOS, type PeriodoDoSocial } from "@/lib/domain/feed";
import type { PostDaCarteira } from "@/lib/queries/social";

/**
 * O feed do personal no layout do protótipo (27/09): uma coluna de 680px, a
 * faixa escura "Reps Club", os dois filtros e os posts um embaixo do outro —
 * foto, o treino que a gerou, curtidas e a conversa.
 *
 * Sem banco: a página monta os controles e passa pronto, e assim a tela abre
 * no navegador com props fixas, que é o único jeito de conferir interface
 * neste ambiente.
 *
 * **O que o protótipo tem e não entrou:** "+ Publicar aviso" (o personal não
 * publica no feed — `posts_insert` é só do aluno, e o personal que quer postar
 * vira aluno de si mesmo, decisão de 13/09) e o post "Conquista do aluno" de
 * macrociclo iniciado/terminado com fotos de antes e depois (não existe no
 * modelo; seria um tipo de post novo, não um desenho novo).
 */
export function TelaSocial({
  posts,
  periodo,
  filtrado,
  filtros,
  curtir,
  responder,
}: {
  posts: PostDaCarteira[];
  periodo: PeriodoDoSocial;
  /** Há um aluno escolhido no filtro — muda a frase do vazio. */
  filtrado: boolean;
  filtros: React.ReactNode;
  curtir: (post: PostDaCarteira) => React.ReactNode;
  responder: (post: PostDaCarteira) => React.ReactNode;
}) {
  const semResposta = posts.filter((p) => p.semResposta).length;

  return (
    <>
      <CabecalhoDaPagina
        titulo="Feed"
        subtitulo="Todas as publicações dos seus alunos, das mais recentes às mais antigas"
      />

      <div className="mx-auto flex max-w-[680px] flex-col gap-3.5">
        <div className="rounded-[12px] bg-gradient-to-br from-dark-bg to-dark-elev px-5 py-[18px] text-dark-text">
          <p className="text-[15px] font-extrabold tracking-[-0.01em]">Reps Club</p>
          <p className="mt-0.5 text-[12.5px] font-medium text-dark-text-2">
            Atividade de todos os alunos · {posts.length === 1 ? "1 publicação" : `${posts.length} publicações`}
            {/* A fila de trabalho do personal: o que o protótipo não diz e
                é o motivo de ele abrir esta tela. */}
            {semResposta > 0
              ? ` · ${semResposta === 1 ? "1 sem sua resposta" : `${semResposta} sem sua resposta`}`
              : ""}
          </p>
        </div>

        {filtros}

        {posts.length ? (
          <ul className="flex flex-col gap-3.5">
            {posts.map((post) => (
              <li key={post.id}>
                <CartaoDePost post={post} curtir={curtir(post)} responder={responder(post)} />
              </li>
            ))}
          </ul>
        ) : (
          <Vazio periodo={periodo} filtrado={filtrado} />
        )}
      </div>
    </>
  );
}

function CartaoDePost({
  post,
  curtir,
  responder,
}: {
  post: PostDaCarteira;
  curtir: React.ReactNode;
  responder: React.ReactNode;
}) {
  return (
    <CartaoDeAtividade
      rotulo={`Post de ${post.aluno.nome}, ${post.rotuloDoDia}`}
      autor={post.aluno}
      linkDoAutor
      rotuloDoDia={post.rotuloDoDia}
      visibilidade={post.visibilidade}
      fotoUrl={post.fotoUrl}
      legenda={post.legenda}
      treino={post.treino}
      conversa={{ curtir, comentarios: post.comentarios, responder }}
    />
  );
}

function Vazio({ periodo, filtrado }: { periodo: PeriodoDoSocial; filtrado: boolean }) {
  const rotulo = PERIODOS.find((p) => p.valor === periodo)?.rotulo.toLowerCase();

  // Três vazios diferentes, e cada um pede uma ação diferente: esperar, abrir
  // o período, ou tirar o filtro do aluno.
  const [titulo, apoio] =
    periodo === "tudo" && !filtrado
      ? [
          "Nenhum aluno publicou ainda",
          "Quando um aluno registrar um treino com foto, o post aparece aqui — inclusive os que ele marcar para só você ver.",
        ]
      : filtrado
        ? [
            periodo === "tudo" ? "Este aluno ainda não publicou" : `Nada deste aluno nos ${rotulo}`,
            "Escolha “Todos os alunos” para ver a turma inteira.",
          ]
        : [`Nada publicado nos ${rotulo}`, "Experimente “Todo o período”."];

  return (
    <div className="rounded-[12px] border border-border bg-surface px-5 py-11 text-center">
      <p className="text-[14px] font-semibold text-ink">{titulo}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-4">{apoio}</p>
    </div>
  );
}
