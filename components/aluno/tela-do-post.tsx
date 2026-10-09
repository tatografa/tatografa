import { Lock } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { formatos } from "@/lib/i18n/formatos";
import { plural, preencher } from "@/lib/i18n/texto";
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
  exclusao,
  idioma,
}: {
  idioma: Idioma;
  post: PostDetalhado;
  idDoPersonal: string;
  /** O botão de curtir. */
  acoes: React.ReactNode;
  /** O campo de comentar. */
  formulario: React.ReactNode;
  /** Apagar, só no post do próprio aluno. Fica à direita, separado do coração. */
  exclusao?: React.ReactNode;
}) {
  const autorEPersonal = post.autor.id === idDoPersonal;
  const t = TEXTOS_DO_APP[idioma];
  const fd = t.feed;
  const f = formatos(idioma);

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <Link href="/app/feed" className="eyebrow text-ink-4 transition hover:text-ink-2">
          {fd.post.voltar}
        </Link>
      </header>

      <article className="overflow-hidden rounded-card-lg border border-border-soft bg-surface">
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <Avatar
            foto={post.autor.foto}
            iniciais={post.autor.iniciais}
            className="size-[38px] bg-canvas-sunken font-mono text-[12px] font-bold text-ink-2"
          />

          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-[14px] font-bold text-ink">
              <span className="truncate">{post.meu ? t.comum.voce : post.autor.nome}</span>
              {autorEPersonal ? (
                <Badge tone="brand-solido" className="shrink-0">
                  {t.comum.personalSelo}
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
            alt={post.legenda ?? (post.meu ? fd.fotoDeVoce : preencher(fd.fotoDe, { nome: post.autor.nome }))}
            className="aspect-square w-full bg-canvas-sunken object-cover"
          />
        ) : null}

        <div className="space-y-3.5 px-3.5 py-3.5">
          {/*
          O que separa este feed de qualquer outro: o post carrega o que foi
          levantado. Só aparece quando o post nasceu da tela de conclusão — e
          só para quem pode ler a sessão, que é o dono e o personal dele.
        */}
          {post.treino ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-4">
              <Badge tone="brand">{post.treino.rotulo}</Badge>
              <span className="font-bold text-ink-2">{post.treino.nome}</span>
              <span>
                {plural(post.treino.series, t.comum.series)}
                {post.treino.volumeKg > 0 ? ` · ${f.carga(post.treino.volumeKg)}` : ""}
              </span>
            </p>
          ) : null}

          {post.legenda ? (
            <p className="text-[14.5px] leading-relaxed text-ink-2">{post.legenda}</p>
          ) : null}

          {post.meu && post.visibilidade === "personal" ? (
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink-4">
              <Lock aria-hidden size={11} />
              {fd.soPersonalVePost}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            {acoes}
            {exclusao}
          </div>
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="eyebrow text-ink-4">
          {plural(post.comentarios, fd.nComentarios)}
        </h2>

        {post.listaDeComentarios.length ? (
          <ul className="space-y-2.5">
            {post.listaDeComentarios.map((comentario) => (
              <li
                key={comentario.id}
                className="flex gap-2.5 rounded-card border border-border-soft bg-surface px-3.5 py-3"
              >
                <Avatar
                  foto={comentario.autorFoto}
                  iniciais={comentario.autorIniciais}
                  className="size-8 bg-canvas-sunken font-mono text-[10.5px] font-bold text-ink-2"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] font-bold text-ink">
                    <span className="truncate">
                      {comentario.meu ? t.comum.voce : comentario.autorNome}
                    </span>
                    {comentario.doPersonal ? (
                      <Badge tone="brand-solido" className="shrink-0">
                        {t.comum.personalSelo}
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
            {fd.post.ninguemComentou}
          </p>
        )}

        {formulario}
      </section>
    </div>
  );
}
