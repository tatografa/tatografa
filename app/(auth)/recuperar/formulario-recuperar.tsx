"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import { enviarLinkDeRecuperacao, type EstadoAuth } from "../actions";

const INICIAL: EstadoAuth = {};

export function FormularioRecuperar() {
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
        <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          Link enviado
        </h2>
        <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
          Se existir uma conta com{" "}
          <strong className="text-ink">{estado.campos?.email}</strong>, o link
          para criar uma nova senha chega em instantes.
        </p>
        <Link href="/entrar" className="block">
          <Button variant="secondary" block>
            Voltar ao login
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
        ← Voltar ao login
      </Link>

      <header className="space-y-2">
        <h2 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          Recuperar acesso
        </h2>
        <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
          Informe seu e-mail e enviamos um link para criar uma nova senha.
        </p>
      </header>

      <div className="space-y-4">
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@assessoria.com"
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
          {enviando ? "Enviando…" : "Enviar link"}
        </Button>
      </div>
    </form>
  );
}
