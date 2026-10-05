import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Card, classesDeBotao } from "@/components/ui";
import type { TextosDoPainel } from "@/lib/i18n/painel";

import { EntrarNoModoAluno } from "./entrar-no-modo-aluno";

/**
 * O cartão de "treinar como aluno", nos seus dois estados.
 *
 * Separado da página pelo mesmo motivo da lista de alunos: sem acesso a banco,
 * ele abre no navegador com props fixas — o único jeito de conferir interface
 * neste ambiente, onde o host do Supabase é bloqueado pela rede.
 */
export function CartaoDeModoAluno({
  jaSouAluno,
  textos: tr,
}: {
  jaSouAluno: boolean;
  textos: TextosDoPainel["configuracoes"]["treinar"];
}) {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      {jaSouAluno ? (
        <>
          <div>
            <p className="text-[15px] font-bold text-ink">{tr.prontoTitulo}</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-ink-3">{tr.pronto}</p>
          </div>
          <Link href="/app" className={classesDeBotao({})}>
            {tr.abrirApp}
            <ArrowRight size={15} aria-hidden />
          </Link>
        </>
      ) : (
        <>
          <div>
            <p className="text-[15px] font-bold text-ink">{tr.criarTitulo}</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-ink-3">{tr.criar}</p>
          </div>
          <EntrarNoModoAluno />
        </>
      )}
    </Card>
  );
}
