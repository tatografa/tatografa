"use client";

import { Camera, ImageOff, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { useIdioma } from "@/components/aluno/idioma-do-app";
import { Badge, Button, EscolhaCards, Textarea } from "@/components/ui";
import { LIMITE_DA_LEGENDA } from "@/lib/domain/feed";
import { prepararFoto } from "@/lib/imagem";
import { plural, preencher } from "@/lib/i18n/texto";
import type { TreinoDoPost } from "@/lib/queries/feed";

import { publicarPost, type EstadoDaPublicacao } from "../actions";

const INICIAL: EstadoDaPublicacao = {};

/**
 * O compositor de post (doc 05, tela 10).
 *
 * **A pré-visualização é local.** `URL.createObjectURL` desenha o arquivo que
 * está no aparelho, sem subir nada: o aluno confere o enquadramento antes de
 * gastar a internet da academia, e uma foto descartada nunca chega ao servidor.
 * O `revoke` no desmonte devolve a memória — sem ele, trocar de foto várias
 * vezes vaza um blob por troca.
 *
 * **`capture="environment"`** abre a câmera traseira direto no celular, e no
 * desktop o navegador ignora e cai no seletor de arquivo. Um atributo, os dois
 * comportamentos certos.
 *
 * **A foto escolhida é trocada pela versão reduzida antes de o formulário
 * enviar** (`prepararFoto`). O `accept` aceita `image/*` e não só os três tipos
 * do bucket justamente porque a conversão é que normaliza: o HEIC da câmera da
 * Apple entra e sai JPEG. O arquivo volta para o `input` por `DataTransfer`,
 * então o envio continua sendo o do `<form>`, sem FormData montado à mão.
 */
export function Compositor({
  nomeDoPersonal,
  sessaoId,
  treino,
  naTurma,
}: {
  nomeDoPersonal: string;
  /** Presente quando o post nasce da tela de conclusão do treino. */
  sessaoId?: string;
  treino?: TreinoDoPost | null;
  /**
   * Arquivado pelo personal (migration 0035): o post vai só para ele, e a
   * opção da turma nem aparece. Mostrá-la seria oferecer um caminho que o
   * banco recusa — o mesmo motivo de o perfil não enviar `trainer_id`.
   */
  naTurma: boolean;
}) {
  const [estado, acao, enviando] = useActionState(publicarPost, INICIAL);
  const { t, f } = useIdioma();
  const c = t.feed.compositor;

  const entrada = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [temFoto, setTemFoto] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [erroDaFoto, setErroDaFoto] = useState<string | null>(null);
  const [legenda, setLegenda] = useState("");
  const [alcance, setAlcance] = useState("personal");

  useEffect(() => {
    if (!previa) return;
    return () => URL.revokeObjectURL(previa);
  }, [previa]);

  function mostrar(arquivo: File | null) {
    setPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return arquivo ? URL.createObjectURL(arquivo) : null;
    });
    setTemFoto(Boolean(arquivo));
  }

  async function aoEscolherFoto(arquivo: File | undefined) {
    setErroDaFoto(null);
    if (!arquivo) {
      mostrar(null);
      return;
    }

    setPreparando(true);
    try {
      const reduzida = await prepararFoto(arquivo);

      // Devolve o arquivo reduzido para o próprio `input`: é ele que o `<form>`
      // envia, então a foto original nunca chega a sair do aparelho.
      const transferencia = new DataTransfer();
      transferencia.items.add(reduzida);
      if (entrada.current) entrada.current.files = transferencia.files;

      mostrar(reduzida);
    } catch {
      // Formato que o navegador não decodifica. Limpar o campo é obrigatório:
      // deixá-lo cheio mandaria o original para o servidor, que o recusaria com
      // uma mensagem menos útil que esta.
      if (entrada.current) entrada.current.value = "";
      mostrar(null);
      setErroDaFoto(c.erroDaFoto);
    } finally {
      setPreparando(false);
    }
  }

  function tirarAFoto() {
    if (entrada.current) entrada.current.value = "";
    setErroDaFoto(null);
    mostrar(null);
  }

  const restam = LIMITE_DA_LEGENDA - legenda.length;

  return (
    <form action={acao} noValidate className="space-y-5">
      {/*
        O resumo do treino aparece **antes** da foto, e não como detalhe no fim:
        é ele que diz por que este post é diferente de uma foto qualquer. O id da
        sessão vai num campo escondido, mas quem decide se ele vale é o servidor
        — a ação confere de novo que a sessão é do aluno e está concluída.
      */}
      {sessaoId && treino ? (
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-border-soft bg-surface px-3.5 py-3">
          <input type="hidden" name="sessao" value={sessaoId} />
          <Badge tone="brand">{treino.rotulo}</Badge>
          <span className="text-[13.5px] font-bold text-ink">{treino.nome}</span>
          <span className="text-[12.5px] text-ink-4">
            {plural(treino.series, t.comum.series)}
            {treino.volumeKg > 0 ? ` · ${f.carga(treino.volumeKg)}` : ""}
          </span>
        </div>
      ) : null}

      <div className="space-y-2">
        <input
          ref={entrada}
          type="file"
          name="foto"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => aoEscolherFoto(e.target.files?.[0])}
          id="foto-do-treino"
        />

        {previa ? (
          <div className="relative overflow-hidden rounded-card-lg border border-border-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previa}
              alt={c.previa}
              className="aspect-square w-full bg-canvas-sunken object-cover"
            />
            <button
              type="button"
              onClick={tirarAFoto}
              className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition hover:bg-ink"
            >
              <X size={17} aria-hidden />
              <span className="sr-only">{c.removerFoto}</span>
            </button>
          </div>
        ) : (
          <label
            htmlFor="foto-do-treino"
            className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-card-lg border-[1.5px] border-dashed border-border bg-surface text-ink-4 transition hover:border-border-strong hover:text-ink-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand"
          >
            <Camera size={26} aria-hidden />
            <span className="text-[14px] font-bold">{c.escolherFoto}</span>
            <span className="max-w-[240px] text-center text-[12.5px] leading-relaxed">
              {c.opcional}
            </span>
          </label>
        )}

        {preparando ? (
          <p role="status" className="text-[12.5px] font-semibold text-ink-4">
            {c.preparando}
          </p>
        ) : null}

        {erroDaFoto ?? estado.errosPorCampo?.foto ? (
          <p role="alert" className="flex items-center gap-1.5 text-[12.5px] font-semibold text-danger">
            <ImageOff size={13} aria-hidden />
            {erroDaFoto ?? estado.errosPorCampo?.foto}
          </p>
        ) : null}
      </div>

      <Textarea
        label={c.legenda}
        name="legenda"
        rows={3}
        placeholder={c.legendaExemplo}
        value={legenda}
        maxLength={LIMITE_DA_LEGENDA}
        onChange={(e) => setLegenda(e.target.value)}
        error={estado.errosPorCampo?.legenda}
        hint={
          restam > 60
            ? undefined
            : plural(restam, c.restantes)
        }
      />

      {/*
        O alcance é a decisão de privacidade do post, então os rótulos dizem
        **quem vê**, não o nome interno da opção. O padrão é o mais fechado:
        quem quiser mostrar para a turma escolhe, e quem não olhar não publica
        sem querer para um grupo.
      */}
      <EscolhaCards
        label={c.quemVe}
        name="alcance"
        colunas={1}
        valor={alcance}
        aoMudar={setAlcance}
        error={estado.errosPorCampo?.alcance}
        opcoes={
          naTurma
            ? [
                { valor: "personal", rotulo: preencher(c.so, { nome: nomeDoPersonal }), icone: "🔒" },
                {
                  valor: "publico",
                  rotulo: preencher(c.eATurma, { nome: nomeDoPersonal }),
                  icone: "👥",
                },
              ]
            : [{ valor: "personal", rotulo: preencher(c.so, { nome: nomeDoPersonal }), icone: "🔒" }]
        }
      />

      {!naTurma && (
        <p className="rounded-card bg-canvas-sunken px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-3">
          {preencher(t.feed.foraDaTurma.compositor, { nome: nomeDoPersonal })}
        </p>
      )}

      {estado.erro ? (
        <p role="alert" className="text-[13px] font-semibold text-danger">
          {estado.erro}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={enviando || preparando || (!temFoto && !legenda.trim())}
        >
          {enviando ? c.publicando : t.feed.publicar}
        </Button>
        <Link href="/app/feed" className="text-[13.5px] font-semibold text-ink-4 transition hover:text-ink-2">
          {t.comum.cancelar}
        </Link>
      </div>
    </form>
  );
}
