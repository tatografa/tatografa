"use client";

import { useActionState, useEffect, useState } from "react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Dialog, Input } from "@/components/ui";
import { preencher } from "@/lib/i18n/texto";

import { convidarAluno, type EstadoConvite } from "./actions";

const INICIAL: EstadoConvite = {};

export function ConvidarAluno() {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(convidarAluno, INICIAL);
  const { t } = usePainel();
  const c = t.dashboard.convidar;

  return (
    <>
      <Button onClick={() => setAberto(true)}>{c.botao}</Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={estado.link ? c.pronto : c.botao}
        descricao={
          estado.link
            ? preencher(c.prontoApoio, { nome: estado.nomeConvidado ?? "" })
            : c.apoio
        }
      >
        {estado.link ? (
          <LinkDoConvite link={estado.link} aoFechar={() => setAberto(false)} />
        ) : (
          <form action={acao} noValidate className="space-y-4">
            <Input
              label={c.nome}
              name="nome"
              autoComplete="off"
              placeholder={c.nomeExemplo}
              defaultValue={estado.campos?.nome}
              error={estado.errosPorCampo?.nome}
              required
            />
            <Input
              label={c.email}
              name="email"
              type="email"
              autoComplete="off"
              placeholder={c.emailExemplo}
              defaultValue={estado.campos?.email}
              error={estado.errosPorCampo?.email}
              hint={c.emailDica}
              required
            />

            {estado.erro && (
              <p
                role="alert"
                className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
              >
                {estado.erro}
              </p>
            )}

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="secondary"
                block
                onClick={() => setAberto(false)}
              >
                {t.comum.cancelar}
              </Button>
              <Button type="submit" block disabled={enviando}>
                {enviando ? c.gerando : c.gerar}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}

function LinkDoConvite({
  link,
  aoFechar,
}: {
  link: string;
  aoFechar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const { t } = usePainel();
  const c = t.dashboard.convidar;

  useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(id);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      // Clipboard bloqueado (http, permissão negada): o link está visível e
      // selecionável no campo abaixo, então dá para copiar na mão.
      setCopiado(false);
    }
  }

  const zap = `https://wa.me/?text=${encodeURIComponent(
    preencher(c.mensagem, { link }),
  )}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-[7px]">
        <span className="eyebrow text-ink-3">{c.link}</span>
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 w-full rounded-input border-[1.5px] border-border bg-canvas-sunken px-3.5 font-mono text-[12.5px] text-ink-2"
        />
      </div>

      <div className="flex gap-2.5">
        <Button type="button" variant="secondary" block onClick={copiar}>
          {copiado ? c.copiado : c.copiar}
        </Button>
        <a href={zap} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button type="button" block>
            {c.whatsapp}
          </Button>
        </a>
      </div>

      <button
        type="button"
        onClick={aoFechar}
        className="w-full text-center text-[13px] font-semibold text-ink-4 transition hover:text-ink-2"
      >
        {t.comum.fechar}
      </button>
    </div>
  );
}
