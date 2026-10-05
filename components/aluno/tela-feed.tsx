"use client";

import { Heart, Lock, MessageCircle, Plus, Users } from "lucide-react";
import Link from "next/link";

import { Carregando, Esqueleto } from "@/components/esqueleto";
import { Badge } from "@/components/ui";
import { plural, preencher } from "@/lib/i18n/texto";
import type { AbaDoFeed, PostDoFeed } from "@/lib/queries/feed";
import { cn } from "@/lib/utils";

import { HoraLocal } from "./hora-local";
import { useIdioma } from "./idioma-do-app";

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
  idDoPersonal,
  naTurma,
  carregando = false,
}: {
  posts: PostDoFeed[];
  aba: AbaDoFeed;
  aoTrocarAba: (aba: AbaDoFeed) => void;
  nomeDoPersonal: string;
  /** Arquivado pelo personal: a aba pública nunca mais terá post (0035). */
  naTurma: boolean;
  /**
   * Para o selo "PERSONAL" do doc 05. O personal que treina é aluno de si
   * mesmo (migration 0019), então ele posta com `student_id` como todo mundo —
   * e o que o distingue é ser o `trainer_id` de quem está olhando. Como só
   * existe um personal por turma, comparar os dois ids basta: nenhuma consulta
   * a mais, e nada de expor quem é personal para além do próprio.
   */
  idDoPersonal: string;
  /**
   * A aba mudou e os posts da nova ainda não chegaram. A aba acende na hora —
   * o toque foi recebido —, mas a lista vira esqueleto em vez de continuar
   * mostrando os posts da aba anterior sob o rótulo da nova.
   */
  carregando?: boolean;
}) {
  const { t } = useIdioma();
  const fd = t.feed;
  return (
    <div className="space-y-4">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink">
            {fd.titulo}
          </h1>
          {/*
            Publicar mora no cabeçalho e não numa barra flutuante: a barra de
            navegação já ocupa o rodapé, e botão flutuante em cima dela tapa a
            aba do meio no polegar.
          */}
          <Link
            href="/app/feed/novo"
            className="flex h-10 items-center gap-1.5 rounded-pill bg-brand px-3.5 text-[13px] font-bold text-white shadow-cta transition hover:bg-brand-hover"
          >
            <Plus size={15} aria-hidden />
            {fd.publicar}
          </Link>
        </div>

        <div
          role="tablist"
          aria-label={fd.oQueMostrar}
          className="flex gap-1 rounded-[11px] bg-canvas-sunken p-[3px]"
        >
          <Aba
            ativa={aba === "publico"}
            rotulo={fd.daTurma}
            aoEscolher={() => aoTrocarAba("publico")}
          />
          <Aba
            ativa={aba === "personal"}
            rotulo={fd.comPersonal}
            aoEscolher={() => aoTrocarAba("personal")}
          />
        </div>
      </header>

      {carregando ? (
        <Carregando rotulo={t.comum.carregando.posts}>
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
              <CardDePost post={post} idDoPersonal={idDoPersonal} />
            </li>
          ))}
        </ul>
      ) : (
        <Vazio aba={aba} nomeDoPersonal={nomeDoPersonal} naTurma={naTurma} />
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

function CardDePost({
  post,
  idDoPersonal,
}: {
  post: PostDoFeed;
  idDoPersonal: string;
}) {
  const doPersonal = post.autor.id === idDoPersonal;
  const { t, f } = useIdioma();
  const fd = t.feed;

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
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink">
            <span className="truncate">
              {post.meu ? t.comum.voce : post.autor.nome}
            </span>
            {/* O selo não encolhe: é ele que muda como se lê o post. */}
            {doPersonal ? (
              <Badge tone="brand-solido" className="shrink-0">
                {t.comum.personalSelo}
              </Badge>
            ) : null}
          </p>
          {/*
            O cadeado só aparece no que é privado, e só para quem publicou: é o
            aluno que precisa saber que aquele post não foi para a turma. Ícone
            sozinho não comunica estado (aprendizado do M2), então vem com texto.
          */}
          {post.meu && post.visibilidade === "personal" ? (
            <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-ink-4">
              <Lock aria-hidden size={10} />
              {fd.soPersonalVe}
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
          alt={post.legenda ?? (post.meu ? fd.fotoDeVoce : preencher(fd.fotoDe, { nome: post.autor.nome }))}
          className="aspect-square w-full bg-canvas-sunken object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="space-y-2.5 px-3.5 py-3">
        {/*
          O que separa este feed de qualquer outro: o post carrega o que foi
          levantado. Só aparece quando o post nasceu da tela de conclusão — e
          só para quem pode ler a sessão, que é o dono e o personal dele.
        */}
        {post.treino ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-4">
            <Badge tone="brand">{post.treino.rotulo}</Badge>
            <span className="font-bold text-ink-2">{post.treino.nome}</span>
            <span>
              {plural(post.treino.series, t.comum.series)}
              {post.treino.volumeKg > 0 ? ` · ${f.carga(post.treino.volumeKg)}` : ""}
            </span>
          </p>
        ) : null}

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
              {post.curtidas === 1 ? fd.curtidas.um : fd.curtidas.outros}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold">
            <MessageCircle aria-hidden size={15} />
            {post.comentarios}
            <span className="sr-only">
              {post.comentarios === 1 ? fd.comentarios.um : fd.comentarios.outros}
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
/**
 * Três vazios, não dois.
 *
 * "Ninguém postou ainda" era verdade enquanto todo aluno estava na turma.
 * Desde a 0035 existe um terceiro estado — fora da turma —, e ali a frase
 * vira mentira: **nunca** vai aparecer post, e o aluno ficaria esperando. É o
 * mesmo defeito de 17/09, quando duplicar programa criou um estado novo e o
 * card antigo passou a afirmar o oposto do que tinha acabado de acontecer.
 * Ao acrescentar um caminho que muda o que uma tela pode mostrar, reler os
 * vazios que aquele caminho agora alcança.
 */
function Vazio({
  aba,
  nomeDoPersonal,
  naTurma,
}: {
  aba: AbaDoFeed;
  nomeDoPersonal: string;
  naTurma: boolean;
}) {
  const foraDaTurma = !naTurma && aba === "publico";
  const { t } = useIdioma();
  const v = t.feed.vazio;
  const fora = t.feed.foraDaTurma;
  const nome = { nome: nomeDoPersonal };
  return (
    <section className="rounded-card-lg border border-border-soft bg-surface p-5 text-center">
      <span
        aria-hidden
        className="mx-auto flex size-11 items-center justify-center rounded-full bg-canvas-sunken text-ink-4"
      >
        <Users size={19} />
      </span>
      <p className="mt-3.5 text-[15px] font-bold text-ink">
        {foraDaTurma ? v.foraTitulo : aba === "publico" ? v.turmaTitulo : v.personalTitulo}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
        {foraDaTurma
          ? preencher(fora.feed, nome)
          : aba === "publico"
            ? preencher(v.turma, nome)
            : naTurma
              ? preencher(v.personal, nome)
              : preencher(fora.abaDoPersonal, nome)}
      </p>
    </section>
  );
}
