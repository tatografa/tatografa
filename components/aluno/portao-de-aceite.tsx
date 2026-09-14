"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { Logo } from "@/components/logo";
import { Button, Card } from "@/components/ui";

import {
  aceitarAtualizacao,
  type EstadoDoAceite,
} from "@/app/(aluno)/acoes-de-aceite";

const INICIAL: EstadoDoAceite = {};

/**
 * O que o aluno vê quando o texto dos documentos mudou desde o aceite dele.
 *
 * **É um portão, não um aviso.** Fica no lugar do app inteiro até o aceite
 * entrar, porque é isso que a própria política promete ("avisamos no app e
 * pedimos seu aceite de novo") e porque uma faixa que se fecha não é
 * consentimento — é notificação.
 *
 * O resumo do que mudou vem por prop e não está escrito aqui: quem decide o que
 * mudou é o texto, e duas cópias da mesma frase saem de sincronia na primeira
 * revisão.
 */
export function PortaoDeAceite({
  versao,
  oQueMudou,
}: {
  versao: string;
  oQueMudou: string;
}) {
  const [estado, acao, enviando] = useActionState(aceitarAtualizacao, INICIAL);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col justify-center px-5 py-8">
      <div className="mb-6 flex justify-center text-ink">
        <Logo size={28} />
      </div>

      <Card size="lg" className="space-y-5">
        <div className="space-y-3">
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand"
          >
            <ShieldCheck size={20} />
          </span>

          <h1 className="text-[19px] font-extrabold tracking-[-0.02em] text-ink">
            Atualizamos a política de privacidade
          </h1>
          <p className="text-[13.5px] leading-relaxed text-ink-2">{oQueMudou}</p>
          <p className="text-[13px] leading-relaxed text-ink-3">
            Seu treino, seu histórico e seus recordes continuam exatamente como
            estavam. Para seguir usando o app, confirme que você leu o texto
            novo.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-semibold">
          <Link
            href="/privacidade"
            className="text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            Ler a política de privacidade
          </Link>
          <Link
            href="/termos"
            className="text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            Ler os termos de uso
          </Link>
        </div>

        <form action={acao} className="space-y-3">
          {estado.erro ? (
            <p
              role="alert"
              className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
            >
              {estado.erro}
            </p>
          ) : null}

          <Button type="submit" size="lg" block disabled={enviando}>
            {enviando ? "Registrando…" : "Li e aceito"}
          </Button>

          <p className="text-center font-mono text-[10px] tracking-[0.06em] text-ink-5 uppercase">
            Versão {versao}
          </p>
        </form>
      </Card>
    </div>
  );
}
