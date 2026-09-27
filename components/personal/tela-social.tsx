import { ImageOff, Lock, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { PERIODOS, type PeriodoDoSocial } from "@/lib/domain/feed";
import type { PostDaCarteira } from "@/lib/queries/social";
import { cn } from "@/lib/utils";

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
    <article
      aria-label={`Post de ${post.aluno.nome}, ${post.rotuloDoDia}`}
      className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-4"
    >
      <header className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand"
        >
          {post.aluno.iniciais}
        </span>
        <Link
          href={`/painel/alunos/${post.aluno.id}`}
          className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink transition hover:text-brand"
        >
          {post.aluno.nome}
        </Link>
        {/*
          O selo diz o alcance porque ele muda o que uma resposta significa:
          num post privado o personal é o único leitor; num post da turma, os
          colegas leem junto.
        */}
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            post.visibilidade === "personal" ? "bg-canvas text-ink-3" : "bg-brand-soft text-brand",
          )}
        >
          {post.visibilidade === "personal" ? (
            <>
              <Lock size={10} aria-hidden /> Só para você
            </>
          ) : (
            <>
              <Users size={10} aria-hidden /> Turma
            </>
          )}
        </span>
        <span className="shrink-0 text-[12px] text-ink-5">{post.rotuloDoDia}</span>
      </header>

      {post.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.fotoUrl}
          alt={post.legenda ?? `Foto do treino de ${post.aluno.nome}`}
          className="aspect-[4/3] w-full rounded-[10px] bg-canvas object-cover"
          loading="lazy"
        />
      ) : post.treino ? (
        // Só quando há treino: o post avulso sem foto é um texto, e uma moldura
        // vazia em cima dele diria que faltou alguma coisa. Baixa, e não 4:3
        // como no protótipo: 450px de caixa vazia empurrariam o treino — que é
        // o conteúdo deste post — para fora da tela.
        <div className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border bg-canvas text-ink-5">
          <ImageOff size={20} aria-hidden />
          <span className="text-[12px] font-medium">Sem foto nesta execução</span>
        </div>
      ) : null}

      {post.legenda ? <p className="text-[13.5px] leading-relaxed text-ink-2">{post.legenda}</p> : null}

      {post.treino ? (
        <div className="rounded-[10px] bg-dark-surface px-[18px] py-4 text-dark-text">
          <p className="mb-2.5 text-[14.5px] font-bold">
            Treino {post.treino.rotulo} · {post.treino.nome}
          </p>
          {post.treino.exercicios.length ? (
            <ul>
              {post.treino.exercicios.map((e, i) => (
                <li key={`${e.nome}-${i}`} className="flex items-baseline justify-between gap-3 py-[5px] text-[13px] font-medium">
                  <span className="min-w-0 truncate">{e.nome}</span>
                  <span className="shrink-0 text-dark-text-2 tabular-nums">{e.resumo}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12.5px] text-dark-text-2">Nenhuma série registrada.</p>
          )}
        </div>
      ) : null}

      <div className="flex items-center gap-[18px]">
        {curtir}
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3">
          <MessageCircle size={15} aria-hidden />
          <span aria-hidden>{post.comentarios.length}</span>
          <span className="sr-only">
            {post.comentarios.length === 1 ? "1 comentário" : `${post.comentarios.length} comentários`}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border-soft pt-2.5">
        {post.comentarios.length ? (
          <ul className="flex flex-col gap-2.5">
            {post.comentarios.map((c) => (
              <li key={c.id} className="flex gap-[9px]">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    c.doPersonal ? "bg-ink text-white" : "bg-canvas text-ink-3",
                  )}
                >
                  {c.autorIniciais}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-[7px]">
                    <span className="text-[12.5px] font-bold text-ink">{c.autorNome}</span>
                    {c.doPersonal ? (
                      <span className="rounded-full bg-brand px-[7px] py-px text-[9px] font-bold tracking-[0.04em] text-white">
                        PERSONAL
                      </span>
                    ) : null}
                    <span className="ml-auto text-[11px] text-ink-5">{c.rotuloDoDia}</span>
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-2">{c.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {responder}
      </div>
    </article>
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
