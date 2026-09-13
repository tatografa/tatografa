import { Lock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui";
import type { PostDetalhado } from "@/lib/queries/feed";

import { HoraLocal } from "./hora-local";

/**
 * Um post aberto, com os comentários (doc 05, tela 11).
 *
 * Componente de servidor e sem acesso a banco: os dois controles que precisam
 * de cliente — o coração e o campo de comentar — entram por `children`, o que
 * deixa esta tela conferível no navegador com props fixas.
 */
export function TelaDoPost({
  post,
  idDoPersonal,
  acoes,
  formulario,
}: {
  post: PostDetalhado;
  idDoPersonal: string;
  /** O botão de curtir. */
  acoes: React.ReactNode;
  /** O campo de comentar. */
  formulario: React.ReactNode;
}) {
  const autorEPersonal = post.autor.id === idDoPersonal;

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <Link href="/app/feed" className="eyebrow text-ink-4 transition hover:text-ink-2">
          ← Feed
        </Link>
      </header>

      <article className="overflow-hidden rounded-card-lg border border-border-soft bg-surface">
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <span
            aria-hidden
            className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-canvas-sunken font-mono text-[12px] font-bold text-ink-2"
          >
            {post.autor.iniciais}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-[14px] font-bold text-ink">
              <span className="truncate">{post.meu ? "Você" : post.autor.nome}</span>
              {autorEPersonal ? (
                <Badge tone="brand-solido" className="shrink-0">
                  Personal
                </Badge>
              ) : null}
            </h1>
            <p className="mt-0.5 text-[11.5px] font-medium text-ink-5">
              {post.rotuloDoDia}
              <HoraLocal iso={post.criadoEm} prefixo=" · " />
            </p>
          </div>
        </div>

        {post.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.fotoUrl}
            alt={post.legenda ?? `Foto do treino de ${post.meu ? "você" : post.autor.nome}`}
            className="aspect-square w-full bg-canvas-sunken object-cover"
          />
        ) : null}

        <div className="space-y-3.5 px-3.5 py-3.5">
          {post.legenda ? (
            <p className="text-[14.5px] leading-relaxed text-ink-2">{post.legenda}</p>
          ) : null}

          {post.meu && post.visibilidade === "personal" ? (
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink-4">
              <Lock aria-hidden size={11} />
              Só o seu personal vê este post
            </p>
          ) : null}

          {acoes}
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="eyebrow text-ink-4">
          {post.comentarios === 1 ? "1 comentário" : `${post.comentarios} comentários`}
        </h2>

        {post.listaDeComentarios.length ? (
          <ul className="space-y-2.5">
            {post.listaDeComentarios.map((comentario) => (
              <li
                key={comentario.id}
                className="flex gap-2.5 rounded-card border border-border-soft bg-surface px-3.5 py-3"
              >
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-canvas-sunken font-mono text-[10.5px] font-bold text-ink-2"
                >
                  {comentario.autorIniciais}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] font-bold text-ink">
                    <span className="truncate">
                      {comentario.meu ? "Você" : comentario.autorNome}
                    </span>
                    {comentario.doPersonal ? (
                      <Badge tone="brand-solido" className="shrink-0">
                        Personal
                      </Badge>
                    ) : null}
                    <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] text-ink-5 uppercase">
                      {comentario.rotuloDoDia}
                      <HoraLocal iso={comentario.criadoEm} prefixo=" · " />
                    </span>
                  </p>
                  <p className="mt-1 text-[13.5px] leading-relaxed break-words text-ink-2">
                    {comentario.texto}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-border-soft bg-surface px-3.5 py-3 text-[13px] text-ink-3">
            Ninguém comentou ainda.
          </p>
        )}

        {formulario}
      </section>
    </div>
  );
}
