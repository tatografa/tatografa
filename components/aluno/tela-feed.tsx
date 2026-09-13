"use client";

import { Heart, Lock, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

import { Carregando, Esqueleto } from "@/components/esqueleto";
import type { AbaDoFeed, PostDoFeed } from "@/lib/queries/feed";
import { cn } from "@/lib/utils";

import { HoraLocal } from "./hora-local";

/**
 * O feed do aluno (doc 05, tela 9), sem nenhum acesso a banco — as props
 * chegam prontas, o que permite conferir a tela no navegador neste ambiente,
 * onde o host do Supabase é bloqueado.
 *
 * As duas abas do doc, com os nomes do produto e não do schema:
 * **"Da turma"** é o mural dos colegas do mesmo personal; **"Com meu personal"**
 * é a conversa privada. O handoff dizia "Público" e "Personal", e "Público"
 * mente: na v1 o post nunca sai para a internet, só para os alunos do mesmo
 * personal. Chamar de público convidaria o aluno a postar achando que é uma
 * rede social.
 */
export function TelaFeed({
  posts,
  aba,
  aoTrocarAba,
  nomeDoPersonal,
  carregando = false,
}: {
  posts: PostDoFeed[];
  aba: AbaDoFeed;
  aoTrocarAba: (aba: AbaDoFeed) => void;
  nomeDoPersonal: string;
  /**
   * A aba mudou e os posts da nova ainda não chegaram. A aba acende na hora —
   * o toque foi recebido —, mas a lista vira esqueleto em vez de continuar
   * mostrando os posts da aba anterior sob o rótulo da nova.
   */
  carregando?: boolean;
}) {
  return (
    <div className="space-y-4">
      <header className="space-y-3">
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          Feed
        </h1>

        <div
          role="tablist"
          aria-label="O que mostrar no feed"
          className="flex gap-1 rounded-[11px] bg-canvas-sunken p-[3px]"
        >
          <Aba
            ativa={aba === "publico"}
            rotulo="Da turma"
            aoEscolher={() => aoTrocarAba("publico")}
          />
          <Aba
            ativa={aba === "personal"}
            rotulo="Com meu personal"
            aoEscolher={() => aoTrocarAba("personal")}
          />
        </div>
      </header>

      {carregando ? (
        <Carregando rotulo="Carregando os posts">
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Esqueleto key={i} className="h-[300px] w-full rounded-card-lg" />
            ))}
          </div>
        </Carregando>
      ) : posts.length ? (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <CardDePost post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <Vazio aba={aba} nomeDoPersonal={nomeDoPersonal} />
      )}
    </div>
  );
}

function Aba({
  ativa,
  rotulo,
  aoEscolher,
}: {
  ativa: boolean;
  rotulo: string;
  aoEscolher: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={aoEscolher}
      className={cn(
        "flex h-11 flex-1 items-center justify-center rounded-[9px] text-[13px] font-bold transition",
        ativa ? "bg-surface text-ink shadow-sm" : "text-ink-4 hover:text-ink-2",
      )}
    >
      {rotulo}
    </button>
  );
}

function CardDePost({ post }: { post: PostDoFeed }) {
  return (
    <Link
      href={`/app/feed/${post.id}`}
      className="block overflow-hidden rounded-card-lg border border-border-soft bg-surface transition hover:border-border-strong"
    >
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <span
          aria-hidden
          className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-canvas-sunken font-mono text-[11px] font-bold text-ink-2"
        >
          {post.autor.iniciais}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-ink">
            {post.meu ? "Você" : post.autor.nome}
          </p>
          {/*
            O cadeado só aparece no que é privado, e só para quem publicou: é o
            aluno que precisa saber que aquele post não foi para a turma. Ícone
            sozinho não comunica estado (aprendizado do M2), então vem com texto.
          */}
          {post.meu && post.visibilidade === "personal" ? (
            <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-ink-4">
              <Lock aria-hidden size={10} />
              Só o seu personal vê
            </span>
          ) : null}
        </div>

        {/*
          A data vem pronta do servidor e a hora vem do aparelho — por isso o
          separador viaja dentro da `HoraLocal`: antes de hidratar existe só
          "Hoje", e não "Hoje · " com o ponto solto.
        */}
        <span className="shrink-0 text-[11px] font-medium text-ink-5">
          {post.rotuloDoDia}
          <HoraLocal iso={post.criadoEm} prefixo=" · " />
        </span>
      </div>

      {post.fotoUrl ? (
        // `alt` com a legenda quando ela existe: a foto é o conteúdo, e sem
        // isso quem usa leitor de tela ouve só "imagem".
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.fotoUrl}
          alt={post.legenda ?? `Foto do treino de ${post.meu ? "você" : post.autor.nome}`}
          className="aspect-square w-full bg-canvas-sunken object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="space-y-2.5 px-3.5 py-3">
        {post.legenda ? (
          <p className="text-[14px] leading-relaxed text-ink-2">{post.legenda}</p>
        ) : null}

        <div className="flex items-center gap-4 text-ink-4">
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold">
            <Heart
              aria-hidden
              size={15}
              className={cn(post.curtiPor && "fill-brand text-brand")}
            />
            {post.curtidas}
            <span className="sr-only">
              {post.curtidas === 1 ? "curtida" : "curtidas"}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold">
            <MessageCircle aria-hidden size={15} />
            {post.comentarios}
            <span className="sr-only">
              {post.comentarios === 1 ? "comentário" : "comentários"}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * O vazio muda por aba porque a próxima ação muda: na turma não há o que fazer
 * além de esperar alguém postar; no canal com o personal, quem age é o aluno.
 */
function Vazio({
  aba,
  nomeDoPersonal,
}: {
  aba: AbaDoFeed;
  nomeDoPersonal: string;
}) {
  return (
    <section className="rounded-card-lg border border-border-soft bg-surface p-5 text-center">
      <span
        aria-hidden
        className="mx-auto flex size-11 items-center justify-center rounded-full bg-canvas-sunken text-ink-4"
      >
        <Users size={19} />
      </span>
      <p className="mt-3.5 text-[15px] font-bold text-ink">
        {aba === "publico"
          ? "Ninguém postou ainda"
          : "Nada por aqui ainda"}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
        {aba === "publico"
          ? `Quando alguém que treina com ${nomeDoPersonal} compartilhar um treino, aparece aqui.`
          : `Ao terminar um treino você pode registrar uma foto. Ela fica visível só para ${nomeDoPersonal}, a não ser que você escolha mostrar para a turma.`}
      </p>
    </section>
  );
}
