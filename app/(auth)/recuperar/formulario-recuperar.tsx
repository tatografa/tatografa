"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import type { TextosDaAutenticacao } from "@/lib/i18n/autenticacao";

import { enviarLinkDeRecuperacao, type EstadoAuth } from "../actions";

const INICIAL: EstadoAuth = {};

export function FormularioRecuperar({
  textos: t,
}: {
  textos: TextosDaAutenticacao["recuperar"];
}) {
  const [estado, acao, enviando] = useActionState(
    enviarLinkDeRecuperacao,
    INICIAL,
  );

  if (estado.sucesso === "link-enviado") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-13 items-center justify-center rounded-[15px] bg-brand-soft text-[22px] font-bold text-brand">
          ✓
        </div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          {t.enviadoTitulo}
        </h1>
        <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
          {t.enviadoAntes}{" "}
          <strong className="text-ink">{estado.campos?.email}</strong>
          {t.enviadoDepois}
        </p>
        <Link href="/entrar" className="block">
          <Button variant="secondary" block>
            {t.voltarAoLogin}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-7">
      <Link
        href="/entrar"
        className="inline-block text-[12.5px] font-semibold text-ink-4 transition hover:text-ink-2"
      >
        <span aria-hidden>←</span> {t.voltarAoLogin}
      </Link>

      <header className="space-y-2">
        <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          {t.titulo}
        </h1>
        <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
          {t.apoio}
        </p>
      </header>

      <div className="space-y-4">
        <Input
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          defaultValue={estado.campos?.email}
          error={estado.errosPorCampo?.email}
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

        <Button type="submit" block disabled={enviando}>
          {enviando ? t.enviando : t.botao}
        </Button>
      </div>
    </form>
  );
}
