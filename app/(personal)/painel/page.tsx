import type { Metadata } from "next";

import { Badge, Card, CardDescription, CardTitle } from "@/components/ui";
import { requireTrainer } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Painel" };

/**
 * Dashboard do personal. Vazio de propósito na fase 0 — o marco é conseguir
 * criar conta, entrar e chegar aqui protegido.
 *
 * Fase 1 preenche: convidar aluno, montar treino, atribuir ao aluno.
 */
export default async function PainelPage() {
  const { trainer } = await requireTrainer();

  const primeiroNome = trainer.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="eyebrow text-ink-4">Painel do personal</p>
        <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          Olá, {primeiroNome}.
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-3">
          Sua conta está pronta. Ainda não há alunos nem treinos por aqui.
        </p>
      </header>

      <Card size="lg" className="max-w-xl space-y-3">
        <div className="flex items-center gap-2">
          <Badge tone="brand">Em breve</Badge>
          <Badge>Fase 1</Badge>
        </div>
        <CardTitle>Convidar aluno e montar o primeiro treino</CardTitle>
        <CardDescription>
          O próximo passo é convidar um aluno por e-mail, montar um treino a
          partir do catálogo de exercícios e atribuí-lo a ele. O aluno abre o
          convite, executa o treino na academia e o registro aparece aqui.
        </CardDescription>
      </Card>
    </div>
  );
}
