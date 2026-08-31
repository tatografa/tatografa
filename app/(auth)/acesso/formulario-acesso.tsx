"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import { enviarLinkDeAcesso, type EstadoAuth } from "../actions";

const INICIAL: EstadoAuth = {};

export function FormularioAcesso() {
  const [estado, acao, enviando] = useActionState(enviarLinkDeAcesso, INICIAL);

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
          de acesso chega em instantes. Ele vale por 1 hora.
        </p>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          Entrar
        </h1>
        <p className="text-[14px] font-medium text-ink-3">
          Mandamos um link para o seu e-mail. Sem senha, sem complicação.
        </p>
      </header>

      <div className="space-y-4">
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
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
          {enviando ? "Enviando…" : "Receber link de acesso"}
        </Button>
      </div>

      <p className="text-center text-[13.5px] font-medium text-ink-3">
        É personal trainer?{" "}
        <Link
          href="/entrar"
          className="font-semibold text-brand transition hover:text-brand-hover"
        >
          Entrar com senha
        </Link>
      </p>
    </form>
  );
}
