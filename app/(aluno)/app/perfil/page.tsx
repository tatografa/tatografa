import type { Metadata } from "next";

import { BotaoSair } from "@/components/botao-sair";
import { Card } from "@/components/ui";
import { requireStudent } from "@/lib/auth/session";
import { NIVEL, OBJETIVO } from "@/lib/rotulos";

export const metadata: Metadata = { title: "Perfil" };

/**
 * Perfil do aluno — mínimo, e existe por um motivo específico: **sair**.
 *
 * Até o primeiro teste de campo o app do aluno não tinha saída nenhuma, e o
 * proxy devolve todo usuário logado que abre `/entrar`, `/cadastro` ou
 * `/acesso` para a sua própria área. Resultado: quem entrava como aluno ficava
 * preso até limpar os cookies do navegador. Num produto usado em celular
 * emprestado na academia, isso não é detalhe.
 *
 * Editar dados, foto e reavaliação continuam fora do escopo (M3/M4). Esta tela
 * mostra o que o aluno já informou e devolve a porta.
 */
export default async function PerfilDoAluno() {
  const { student, personal } = await requireStudent();

  const linhas: { rotulo: string; valor: string }[] = [
    { rotulo: "E-mail", valor: student.email },
    { rotulo: "Personal", valor: personal.name },
    {
      rotulo: "Objetivo",
      valor: student.goal ? OBJETIVO[student.goal] : "Não informado",
    },
    {
      rotulo: "Nível",
      valor: student.experience_level
        ? NIVEL[student.experience_level]
        : "Não informado",
    },
  ];

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[18px] font-bold text-ink-2"
        >
          {student.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[21px] font-extrabold tracking-[-0.02em] text-ink">
            {student.name}
          </h1>
        </div>
      </header>

      <Card>
        <dl className="divide-y divide-border-soft">
          {linhas.map((linha) => (
            <div
              key={linha.rotulo}
              className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <dt className="eyebrow shrink-0 text-ink-4">{linha.rotulo}</dt>
              <dd className="min-w-0 truncate text-right text-[13.5px] font-semibold text-ink">
                {linha.valor}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="space-y-3">
        <p className="text-[13px] leading-[1.6] text-ink-3">
          Saindo, o treino e o histórico continuam guardados. Para voltar, use o
          e-mail e a senha que você criou.
        </p>
        <BotaoSair variant="danger" size="md" block />
      </Card>
    </div>
  );
}
