import { Lock, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

import { Badge, Card } from "@/components/ui";
import { PERIODOS, type PeriodoDoSocial } from "@/lib/domain/feed";
import type { PostDaCarteira } from "@/lib/queries/social";
import { cn } from "@/lib/utils";

/**
 * O feed do personal (doc 06, tela 8), sem acesso a banco.
 *
 * Componente à parte da página, como a lista de alunos: assim abre no navegador
 * com props fixas, que é o único jeito de conferir interface neste ambiente.
 *
 * A hora não aparece, ao contrário do app do aluno: o painel é aberto no
 * computador, no fuso do produto, e a data já basta para situar a conversa.
 */
export function TelaSocial({
  posts,
  periodo,
  controles,
}: {
  posts: PostDaCarteira[];
  periodo: PeriodoDoSocial;
  /** Curtir e responder — um por post, montados pela página. */
  controles: (post: PostDaCarteira) => React.ReactNode;
}) {
  const semResposta = posts.filter((p) => p.semResposta).length;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="eyebrow text-ink-4">Painel do personal</p>
            <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
              Social
            </h1>
          </div>

          {/* Período por link, não por botão: a escolha fica na URL, então
              recarregar ou voltar mostra o mesmo recorte. */}
          <nav aria-label="Período" className="flex gap-1 rounded-input bg-canvas-sunken p-1">
            {PERIODOS.map((opcao) => (
              <Link
                key={opcao.valor}
                href={`/painel/social?periodo=${opcao.valor}`}
                aria-current={opcao.valor === periodo ? "page" : undefined}
                className={cn(
                  "rounded-[9px] px-3 py-1.5 text-[13px] font-bold transition",
                  opcao.valor === periodo
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-4 hover:text-ink-2",
                )}
              >
                {opcao.rotulo}
              </Link>
            ))}
          </nav>
        </div>

        {posts.length ? (
          <p className="text-[13.5px] text-ink-3">
            {posts.length === 1 ? "1 post" : `${posts.length} posts`}
            {semResposta > 0 ? (
              <>
                {" · "}
                <strong className="font-semibold text-ink">
                  {semResposta === 1
                    ? "1 ainda sem sua resposta"
                    : `${semResposta} ainda sem sua resposta`}
                </strong>
              </>
            ) : null}
          </p>
        ) : null}
      </header>

      {posts.length ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id}>
              <CartaoDePost post={post}>{controles(post)}</CartaoDePost>
            </li>
          ))}
        </ul>
      ) : (
        <Vazio periodo={periodo} />
      )}
    </div>
  );
}

function CartaoDePost({
  post,
  children,
}: {
  post: PostDaCarteira;
  children: React.ReactNode;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card-lg border border-border bg-surface">
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas-sunken font-mono text-[11.5px] font-bold text-ink-2"
        >
          {post.aluno.iniciais}
        </span>

        <div className="min-w-0 flex-1">
          <Link
            href={`/painel/alunos/${post.aluno.id}`}
            className="truncate text-[14px] font-bold text-ink transition hover:text-brand"
          >
            {post.aluno.nome}
          </Link>
          <p className="text-[12px] text-ink-4">{post.rotuloDoDia}</p>
        </div>

        {/*
          O selo diz o alcance porque ele muda o que uma resposta significa:
          num post privado o personal é o único leitor; num post da turma, os
          colegas leem junto.
        */}
        {post.visibilidade === "personal" ? (
          <Badge className="shrink-0 gap-1">
            <Lock size={9} aria-hidden />
            Só para você
          </Badge>
        ) : (
          <Badge tone="brand" className="shrink-0 gap-1">
            <Users size={9} aria-hidden />
            Turma
          </Badge>
        )}
      </div>

      {post.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.fotoUrl}
          alt={post.legenda ?? `Foto do treino de ${post.aluno.nome}`}
          className="aspect-square w-full bg-canvas-sunken object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-3.5 px-4 py-3.5">
        {post.legenda ? (
          <p className="text-[14px] leading-relaxed text-ink-2">{post.legenda}</p>
        ) : null}

        {post.comentarios.length ? (
          <ul className="space-y-2 border-l-2 border-border-soft pl-3">
            {post.comentarios.map((comentario) => (
              <li key={comentario.id} className="text-[13px] leading-relaxed">
                <span
                  className={cn(
                    "font-bold",
                    comentario.doPersonal ? "text-brand" : "text-ink",
                  )}
                >
                  {comentario.autorNome}
                </span>{" "}
                <span className="text-ink-2">{comentario.texto}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-1.5 text-[12.5px] text-ink-4">
            <MessageCircle size={13} aria-hidden />
            Ninguém comentou ainda
          </p>
        )}

        <div className="mt-auto pt-1">{children}</div>
      </div>
    </article>
  );
}

function Vazio({ periodo }: { periodo: PeriodoDoSocial }) {
  const rotulo = PERIODOS.find((p) => p.valor === periodo)?.rotulo.toLowerCase();

  return (
    <Card size="lg" className="max-w-xl text-center">
      <span
        aria-hidden
        className="mx-auto flex size-11 items-center justify-center rounded-full bg-canvas-sunken text-ink-4"
      >
        <Users size={19} />
      </span>
      <p className="mt-3.5 text-[15px] font-bold text-ink">
        {periodo === "tudo"
          ? "Nenhum aluno publicou ainda"
          : `Nada publicado nos últimos ${rotulo}`}
      </p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">
        {periodo === "tudo"
          ? "Quando um aluno registrar um treino com foto, o post aparece aqui — inclusive os que ele marcar para só você ver."
          : "Experimente um período maior."}
      </p>
    </Card>
  );
}
