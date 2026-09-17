"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { Logo } from "@/components/logo";
import { Button, Card } from "@/components/ui";

import type { EstadoDoAceite } from "@/app/(aluno)/acoes-de-aceite";

const INICIAL: EstadoDoAceite = {};

/**
 * O que o aluno **e o personal** veem quando o texto dos documentos mudou
 * desde o aceite deles.
 *
 * **É um portão, não um aviso.** Fica no lugar do app inteiro até o aceite
 * entrar, porque é isso que a própria política promete ("avisamos no app e
 * pedimos seu aceite de novo") e porque uma faixa que se fecha não é
 * consentimento — é notificação.
 *
 * O resumo do que mudou vem por prop e não está escrito aqui: quem decide o que
 * mudou é o texto, e duas cópias da mesma frase saem de sincronia na primeira
 * revisão. **A ação também vem por prop**, pelo mesmo motivo que a escrita é
 * compartilhada e a autorização não: cada lado chama a sua, com
 * `requireStudent()` ou `requireTrainer()` dentro.
 *
 * Saiu de `components/aluno/` quando o personal passou a aceitar também
 * (decisão do Otávio, 17/09): a pasta dizia de quem era a tela, e ela é dos dois.
 */
export function PortaoDeAceite({
  versao,
  oQueMudou,
  oQueNaoMuda,
  aoAceitar,
}: {
  versao: string;
  oQueMudou: string;
  /**
   * A frase que tranquiliza, e ela é diferente para cada lado: o aluno perde o
   * sono pelo histórico, o personal pelos treinos que montou. Uma frase só
   * falaria com um e soaria estranha para o outro.
   */
  oQueNaoMuda: string;
  aoAceitar: (
    anterior: EstadoDoAceite,
  ) => Promise<EstadoDoAceite>;
}) {
  const [estado, acao, enviando] = useActionState(aoAceitar, INICIAL);

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
          <p className="text-[13px] leading-relaxed text-ink-3">{oQueNaoMuda}</p>
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
