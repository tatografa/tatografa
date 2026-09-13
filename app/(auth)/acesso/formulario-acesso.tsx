"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, classesDeBotao, Input } from "@/components/ui";

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
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          Entrar
        </h1>
        <p className="text-[14px] font-medium text-ink-3">
          Use a senha que você criou quando aceitou o convite.
        </p>
      </header>

      {/*
        **A senha vem primeiro, e fora do formulário.**

        Esta é a porta de entrada do aluno: `requireStudent()` manda todo aluno
        deslogado para cá. Ele **tem** senha — criou no onboarding do convite —,
        então é a ação que sempre funciona. O link por e-mail depende de SMTP, e
        quando ele falha a tela diz "link enviado" e o aluno espera na academia
        por um e-mail que não vem. Já parou um teste de campo assim.

        O botão fica **antes** do campo de e-mail de propósito: dentro do
        formulário, quem digitasse o e-mail e clicasse aqui perderia o que
        digitou ao navegar.
      */}
      <Link href="/entrar" className={classesDeBotao({ block: true, size: "lg" })}>
        Entrar com senha
      </Link>

      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="eyebrow text-ink-5">ou</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={acao} noValidate className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-ink-3">
          Esqueceu a senha? Recebe um link de acesso por e-mail — ele vale por
          1 hora.
        </p>

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

        <Button type="submit" block variant="secondary" disabled={enviando}>
          {enviando ? "Enviando…" : "Receber link por e-mail"}
        </Button>
      </form>
    </div>
  );
}
