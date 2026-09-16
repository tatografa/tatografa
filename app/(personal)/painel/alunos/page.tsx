import type { Metadata } from "next";

import { ConvidarAluno } from "@/app/(personal)/painel/convidar-aluno";
import { TabelaDeAlunos } from "@/components/personal/tabela-de-alunos";
import { requireTrainer } from "@/lib/auth/session";
import { lerAlunosDaCarteira } from "@/lib/queries/painel";

export const metadata: Metadata = { title: "Alunos" };

/**
 * A carteira inteira em tabela, com busca e filtro (doc 06 §3).
 *
 * Tela separada do dashboard porque as duas respondem perguntas diferentes: o
 * painel diz o que mudou hoje, esta diz quem é a carteira. Enquanto a lista
 * morava no dashboard ela empurrava a atividade recente para baixo da dobra a
 * cada aluno novo — o bloco mais útil sumindo à medida que o produto dá certo.
 *
 * A ação primária do cabeçalho é convidar aluno, o mesmo diálogo do painel.
 * O doc 06 pede aqui o "assistente de novo aluno" (dados → objetivo → macro →
 * convite), que não existe: o aluno preenche o próprio perfil no onboarding, e
 * o personal não monta treino antes de ele se cadastrar (decisão de 13/09).
 * Um assistente que só coleta nome e e-mail seria o diálogo de convite com
 * mais passos.
 */
export default async function AlunosPage() {
  const { trainer } = await requireTrainer();
  const alunos = await lerAlunosDaCarteira();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-ink-4">Alunos</p>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {alunos.length === 1 ? "1 aluno" : `${alunos.length} alunos`}
          </h1>
          <p className="text-[13.5px] text-ink-3">
            Sua carteira inteira. Clique numa linha para abrir a ficha.
          </p>
        </div>
        <ConvidarAluno />
      </header>

      <TabelaDeAlunos alunos={alunos} idDoPersonal={trainer.id} />
    </div>
  );
}
