"use client";

import { Camera, Trash2 } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";

import { useIdioma } from "@/components/aluno/idioma-do-app";
import { Button } from "@/components/ui";
import { iniciaisDe } from "@/lib/domain/nome";
import { prepararFoto } from "@/lib/imagem";

import { apagarFotoDePerfil, salvarFotoDePerfil, type EstadoDoAvatar } from "./actions";

const INICIAL: EstadoDoAvatar = {};

/**
 * Trocar e remover a foto do perfil (doc 05, tela 11: avatar).
 *
 * **A pré-visualização é local** (`URL.createObjectURL`), como no compositor
 * do feed: o aluno vê o enquadramento antes de gastar a internet da academia,
 * e uma foto descartada nunca chega ao servidor. O `revoke` no desmonte
 * devolve a memória — sem ele, trocar várias vezes vaza um blob por troca.
 *
 * **A foto escolhida é trocada pela versão reduzida antes de enviar**
 * (`prepararFoto`): HEIC do iPhone entra e sai JPEG, e o arquivo cai de
 * tabela. O `accept="image/*"` aceita tudo que o navegador decodifica porque
 * é a conversão que normaliza; o bucket (3 tipos) é a trava do servidor.
 *
 * **Sem `capture`**, de propósito: no celular o navegador pergunta se o aluno
 * quer tirar uma foto nova ou escolher do álbum, e no PC abre o seletor de
 * arquivo. Um `capture="user"` forçava a câmera frontal e tirava o álbum do
 * caminho — pedido do Otávio (07/10). A foto do treino segue com
 * `capture="environment"` porque lá o momento é o do treino na academia.
 *
 * **`accept` lista os três tipos do bucket, não `image/*`.** O álbum do
 * iPhone serve a foto em HEIC, e com `image/*` o Safari passa o arquivo cru
 * — o `createImageBitmap` não decodifica, e o produto mostrava "Não
 * conseguimos ler essa imagem". Com os três tipos listados, o iOS **converte
 * HEIC em JPEG na própria entrega do arquivo** antes de ele chegar ao app.
 * No feed o input usa `capture="environment"` + `image/*`, e aí o iOS
 * converte sozinho — por isso aquela tela nunca sentiu o defeito.
 */
export function FotoDePerfil({
  nome,
  avatarUrl,
}: {
  nome: string;
  avatarUrl: string | null;
}) {
  const { t } = useIdioma();
  const m = t.perfil.perfil.foto;

  const [salvar, acaoSalvar, salvando] = useActionState(salvarFotoDePerfil, INICIAL);
  const [remover, acaoRemover, removendo] = useActionState(apagarFotoDePerfil, INICIAL);

  const entrada = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [confirmandoRemover, setConfirmandoRemover] = useState(false);

  useEffect(() => {
    if (!previa) return;
    return () => URL.revokeObjectURL(previa);
  }, [previa]);

  async function aoEscolher(arquivo: File | undefined) {
    setErroLocal(null);
    if (!arquivo) return;

    setPreparando(true);
    try {
      // 512px: o maior círculo do produto tem 80px, e 3x cobre tela de alta
      // densidade. Em 1600px cada círculo da carteira baixaria ~300 kB.
      const reduzida = await prepararFoto(arquivo, 512);
      setPrevia((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return URL.createObjectURL(reduzida);
      });
      // A foto reduzida vai direto para a ação. Antes ia por um <form> escondido
      // com requestSubmit — e o campo de arquivo morava fora dele, sem `name`:
      // o servidor recebia o formulário vazio e respondia "não lemos a imagem".
      // Envia na hora: trocar foto é um gesto só, sem botão "Salvar".
      const dados = new FormData();
      dados.set("foto", reduzida);
      startTransition(() => acaoSalvar(dados));
    } catch {
      if (entrada.current) entrada.current.value = "";
      setErroLocal(m.naoLeu);
    } finally {
      setPreparando(false);
    }
  }

  // Depois que a ação confirma, limpa a prévia local (o avatarUrl novo chega
  // pelo revalidate) e fecha a confirmação. Ajuste durante a renderização, não
  // em efeito: é o mesmo padrão que o formulário de perfil usa.
  const [ultimoSalvar, setUltimoSalvar] = useState(salvar);
  if (salvar !== ultimoSalvar) {
    setUltimoSalvar(salvar);
    if (salvar.sucesso && previa) {
      URL.revokeObjectURL(previa);
      setPrevia(null);
    }
  }
  // Limpar o `<input type=file>` precisa de ref — não dá para fazer na mesma
  // atualização de render acima, porque o lint recusa acessar `.current` ali.
  useEffect(() => {
    if (salvar.sucesso && entrada.current) entrada.current.value = "";
  }, [salvar.sucesso]);
  const [ultimoRemover, setUltimoRemover] = useState(remover);
  if (remover !== ultimoRemover) {
    setUltimoRemover(remover);
    if (remover.sucesso) setConfirmandoRemover(false);
  }

  const mostrada = previa ?? avatarUrl;
  const temFoto = Boolean(avatarUrl);
  const erro = erroLocal ?? salvar.erro ?? remover.erro ?? null;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {mostrada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mostrada}
            alt=""
            className="size-[72px] rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-[72px] items-center justify-center rounded-full bg-brand-soft text-[22px] font-bold text-brand"
          >
            {iniciaisDe(nome)}
          </span>
        )}
        {(preparando || salvando || removendo) && (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40 text-[11px] font-semibold text-surface"
          >
            {removendo ? m.removendo : salvando ? m.enviando : m.preparando}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[13.5px] font-semibold text-ink">{m.titulo}</p>
        <p className="text-[11.5px] text-ink-4">{m.apoio}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-hover">
            <Camera size={14} aria-hidden />
            {temFoto ? m.escolher : m.adicionar}
            <input
              ref={entrada}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => aoEscolher(e.currentTarget.files?.[0] ?? undefined)}
            />
          </label>
          {temFoto && !confirmandoRemover ? (
            <button
              type="button"
              onClick={() => setConfirmandoRemover(true)}
              className="inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-ink-4 hover:text-danger"
            >
              <Trash2 size={14} aria-hidden />
              {m.remover}
            </button>
          ) : null}
        </div>
        {erro ? (
          <p role="alert" className="pt-1 text-[12px] font-semibold text-danger">
            {erro}
          </p>
        ) : null}
      </div>

      {confirmandoRemover ? (
        <ConfirmaRemover
          titulo={m.confirmarRemover}
          texto={m.removerTexto}
          cancelar={t.comum.cancelar}
          confirmar={m.remover}
          removendo={removendo}
          action={acaoRemover}
          aoCancelar={() => setConfirmandoRemover(false)}
        />
      ) : null}
    </div>
  );
}

function ConfirmaRemover({
  titulo,
  texto,
  cancelar,
  confirmar,
  removendo,
  action,
  aoCancelar,
}: {
  titulo: string;
  texto: string;
  cancelar: string;
  confirmar: string;
  removendo: boolean;
  action: (formData: FormData) => void;
  aoCancelar: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="apagar-avatar"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
    >
      <div className="w-full max-w-sm space-y-4 rounded-card-lg bg-surface p-5 shadow-lg">
        <div className="space-y-2">
          <h3 id="apagar-avatar" className="text-[16px] font-bold text-ink">
            {titulo}
          </h3>
          <p className="text-[13px] leading-relaxed text-ink-3">{texto}</p>
        </div>
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" block onClick={aoCancelar}>
            {cancelar}
          </Button>
          <form action={action} className="flex-1">
            <Button type="submit" variant="danger" block disabled={removendo}>
              {confirmar}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
