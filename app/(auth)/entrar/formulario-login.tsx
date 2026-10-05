"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import type { TextosDaAutenticacao } from "@/lib/i18n/autenticacao";

import { entrar, type EstadoAuth } from "../actions";

const INICIAL: EstadoAuth = {};

/**
 * O que muda entre a porta do personal (`/entrar`) e a do aluno (`/acesso`):
 * só as palavras e para onde se vai depois. O formulário é um só — duas cópias
 * de um login divergem no primeiro ajuste de validação ou de erro.
 *
 * O destino padrão do aluno é `/app`. Se quem entrar por uma porta for do outro
 * papel, o layout de lá desvia (`requireStudent()` manda o personal ao painel,
 * `requireTrainer()` manda o aluno ao app), então errar de porta não prende
 * ninguém.
 */
/** Para onde vai quem entra por esta porta, se a URL não disser outra coisa. */
const DESTINO_PADRAO = { personal: undefined, aluno: "/app" } as const;

export function FormularioLogin({
  para = "personal",
  proximo,
  aviso,
  textos: t,
}: {
  para?: "personal" | "aluno";
  proximo?: string;
  aviso?: string;
  textos: TextosDaAutenticacao["login"];
}) {
  const [estado, acao, enviando] = useActionState(entrar, INICIAL);
  const textos = t[para];
  const destino = proximo ?? DESTINO_PADRAO[para];

  return (
    <form action={acao} noValidate className="space-y-7">
      <header className="space-y-2">
        {/*
          Não é só do personal: o aluno define senha no onboarding, e esta é a
          tela que a usa. Chamar de "entrar como personal" mandava o aluno
          embora da única porta que funcionava sem esperar e-mail — foi o que
          travou o primeiro teste de campo.
        */}
        <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          {textos.titulo}
        </h1>
        <p className="text-[14px] font-medium text-ink-3">{textos.apoio}</p>
      </header>

      {aviso && (
        <p className="rounded-[9px] bg-warning-bg px-3 py-2.5 text-[12.5px] font-semibold text-warning">
          {aviso}
        </p>
      )}

      <div className="space-y-4">
        {destino && <input type="hidden" name="proximo" value={destino} />}

        <Input
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={textos.placeholder}
          defaultValue={estado.campos?.email}
          error={estado.errosPorCampo?.email}
          required
        />

        <Input
          label={t.senha}
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={estado.errosPorCampo?.senha}
          required
          labelAction={
            <Link
              href="/recuperar"
              className="text-[12.5px] font-semibold text-brand transition hover:text-brand-hover"
            >
              {t.esqueci}
            </Link>
          }
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
          {enviando ? t.entrando : textos.botao}
        </Button>
      </div>

      {para === "aluno" ? (
        // O aluno não cria conta sozinho: ela nasce do convite do personal.
        <p className="text-center text-[13.5px] font-medium text-ink-3">
          {t.alunoSemConta}
        </p>
      ) : (
        <p className="text-center text-[13.5px] font-medium text-ink-3">
          {t.semConta}{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-brand transition hover:text-brand-hover"
          >
            {t.criarConta}
          </Link>
        </p>
      )}
    </form>
  );
}
