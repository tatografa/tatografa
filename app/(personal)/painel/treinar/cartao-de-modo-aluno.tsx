import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Card, classesDeBotao } from "@/components/ui";

import { EntrarNoModoAluno } from "./entrar-no-modo-aluno";

/**
 * O cartão de "treinar como aluno", nos seus dois estados.
 *
 * Separado da página pelo mesmo motivo da lista de alunos: sem acesso a banco,
 * ele abre no navegador com props fixas — o único jeito de conferir interface
 * neste ambiente, onde o host do Supabase é bloqueado pela rede.
 */
export function CartaoDeModoAluno({ jaSouAluno }: { jaSouAluno: boolean }) {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      {jaSouAluno ? (
        <>
          <div>
            <p className="text-[15px] font-bold text-ink">
              Seu perfil de aluno está pronto
            </p>
            <p className="mt-1 text-[13px] leading-[1.6] text-ink-3">
              Você aparece na sua lista de alunos como qualquer outro — é por lá
              que se monta o seu macrotreino. Para treinar, abra o app do aluno;
              a volta para cá fica no topo da tela.
            </p>
          </div>
          <Link href="/app" className={classesDeBotao({})}>
            Abrir o app do aluno
            <ArrowRight size={15} aria-hidden />
          </Link>
        </>
      ) : (
        <>
          <div>
            <p className="text-[15px] font-bold text-ink">
              Criar seu perfil de aluno
            </p>
            <p className="mt-1 text-[13px] leading-[1.6] textetc-ink-3">
              Usa o nome e o e-mail que já estão na sua conta. Depois disso você
              aparece na sua própria lista de alunos, e é de lá que sai o seu
              macrotreino.
            </p>
          </div>
          <EntrarNoModoAluno />
        </>
      )}
    </Card>
  );
}
