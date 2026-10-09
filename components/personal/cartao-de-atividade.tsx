import { ImageOff, Lock, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/avatar";

import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_PAINEL } from "@/lib/i18n/painel";
import { plural, preencher } from "@/lib/i18n/texto";
import type { ComentarioDoPost } from "@/lib/queries/feed";
import type { TreinoDoPostNoPainel } from "@/lib/queries/social";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

/**
 * O cartão do feed do painel, e também o da coluna "Atividade" do perfil do
 * aluno: cabeçalho com o aluno, a foto, o bloco escuro com o treino exercício
 * por exercício, e a conversa.
 *
 * Um componente para as duas telas porque no protótipo é o mesmo cartão, e
 * duas cópias dele divergiriam na primeira mudança — a moldura de "sem foto"
 * já tinha mudado uma vez (27/09).
 *
 * No perfil, a sessão que não virou post também vira cartão, e aí não há foto
 * nem conversa para desenhar: `conversa` nulo tira a linha de curtidas e os
 * comentários, porque não existe post onde comentar. O que o perfil acrescenta
 * embaixo do treino (duração, séries, o link série a série) entra por `rodape`.
 */
export function CartaoDeAtividade({
  idioma = "pt",
  rotulo,
  autor,
  linkDoAutor = false,
  rotuloDoDia,
  visibilidade = null,
  fotoUrl = null,
  legenda = null,
  treino,
  rodape,
  conversa = null,
  rotuloDosComentarios = false,
}: {
  idioma?: Idioma;
  /** O nome do `<article>` para leitor de tela. */
  rotulo: string;
  autor: { id: string; nome: string; iniciais: string; foto: string | null };
  /** No feed o nome leva ao perfil; no próprio perfil seria um link para si. */
  linkDoAutor?: boolean;
  rotuloDoDia: string;
  /** Só post tem alcance; a sessão sem post não tem selo. */
  visibilidade?: Enums<"post_visibility"> | null;
  fotoUrl?: string | null;
  legenda?: string | null;
  treino: TreinoDoPostNoPainel | null;
  rodape?: React.ReactNode;
  conversa?: {
    curtir: React.ReactNode;
    comentarios: ComentarioDoPost[];
    responder: React.ReactNode;
  } | null;
  /** O "COMENTÁRIOS" em cima da conversa, que o protótipo põe só no perfil. */
  rotuloDosComentarios?: boolean;
}) {
  const { comum, ficha } = TEXTOS_DO_PAINEL[idioma];
  const t = ficha.cartao;
  return (
    <article
      aria-label={rotulo}
      className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-4"
    >
      <header className="flex items-center gap-2.5">
        <Avatar
          foto={autor.foto}
          iniciais={autor.iniciais}
          className="size-[34px] bg-brand-soft text-[12px] font-semibold text-brand"
        />
        {linkDoAutor ? (
          <Link
            href={`/painel/alunos/${autor.id}`}
            className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink transition hover:text-brand"
          >
            {autor.nome}
          </Link>
        ) : (
          <p className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">{autor.nome}</p>
        )}
        {/*
          O selo diz o alcance porque ele muda o que uma resposta significa:
          num post privado o personal é o único leitor; num post da turma, os
          colegas leem junto.
        */}
        {visibilidade ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              visibilidade === "personal" ? "bg-canvas text-ink-3" : "bg-brand-soft text-brand",
            )}
          >
            {visibilidade === "personal" ? (
              <>
                <Lock size={10} aria-hidden /> {t.soParaVoce}
              </>
            ) : (
              <>
                <Users size={10} aria-hidden /> {t.turma}
              </>
            )}
          </span>
        ) : null}
        <span className="shrink-0 text-[12px] text-ink-5">{rotuloDoDia}</span>
      </header>

      {fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fotoUrl}
          alt={legenda ?? preencher(t.fotoDe, { nome: autor.nome })}
          className="aspect-[4/3] w-full rounded-[10px] bg-canvas object-cover"
          loading="lazy"
        />
      ) : conversa && treino ? (
        // Só em post com treino: o post avulso sem foto é um texto, e uma
        // moldura vazia em cima dele diria que faltou alguma coisa; e a sessão
        // que não virou post não "ficou sem foto" — ela não foi publicada.
        // Baixa, e não 4:3 como no protótipo: 450px de caixa vazia empurrariam
        // o treino — que é o conteúdo deste cartão — para fora da tela.
        <div className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border bg-canvas text-ink-5">
          <ImageOff size={20} aria-hidden />
          <span className="text-[12px] font-medium">{t.semFoto}</span>
        </div>
      ) : null}

      {legenda ? <p className="text-[13.5px] leading-relaxed text-ink-2">{legenda}</p> : null}

      {treino ? (
        <div className="rounded-[10px] bg-dark-surface px-[18px] py-4 text-dark-text">
          <p className="mb-2.5 text-[14.5px] font-bold">
            {preencher(comum.treinoComNome, { label: treino.rotulo, nome: treino.nome })}
          </p>
          {treino.exercicios.length ? (
            <ul>
              {treino.exercicios.map((e, i) => (
                <li
                  key={`${e.nome}-${i}`}
                  className="flex items-baseline justify-between gap-3 py-[5px] text-[13px] font-medium"
                >
                  <span className="min-w-0 truncate">{e.nome}</span>
                  <span className="shrink-0 text-dark-text-2 tabular-nums">{e.resumo}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12.5px] text-dark-text-2">{t.nenhumaSerie}</p>
          )}
        </div>
      ) : null}

      {rodape}

      {conversa ? (
        <>
          <div className="flex items-center gap-[18px]">
            {conversa.curtir}
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3">
              <MessageCircle size={15} aria-hidden />
              <span aria-hidden>{conversa.comentarios.length}</span>
              <span className="sr-only">
                {plural(conversa.comentarios.length, t.comentarios)}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-border-soft pt-2.5">
            {rotuloDosComentarios && conversa.comentarios.length ? (
              <p className="text-[10px] font-bold tracking-[0.08em] text-ink-5">{t.comentariosTitulo}</p>
            ) : null}
            {conversa.comentarios.length ? (
              <ul className="flex flex-col gap-2.5">
                {conversa.comentarios.map((c) => (
                  <li key={c.id} className="flex gap-[9px]">
                    <Avatar
                      foto={c.autorFoto}
                      iniciais={c.autorIniciais}
                      className={cn(
                        "size-7 text-[11px] font-semibold",
                        c.doPersonal ? "bg-ink text-white" : "bg-canvas text-ink-3",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-[7px]">
                        <span className="text-[12.5px] font-bold text-ink">{c.autorNome}</span>
                        {c.doPersonal ? (
                          <span className="rounded-full bg-brand px-[7px] py-px text-[9px] font-bold tracking-[0.04em] text-white">
                            {t.personal}
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
            {conversa.responder}
          </div>
        </>
      ) : null}
    </article>
  );
}
