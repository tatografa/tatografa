import Link from "next/link";

import { Badge, Button } from "@/components/ui";

/**
 * Espaço reservado da landing. A landing de verdade é da fase 4 — o protótipo
 * `Landing Page.dc.html` é a referência. Aqui só existe o caminho para entrar.
 */
export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <Badge tone="brand">Fase 0 · fundação</Badge>

      <div className="space-y-3">
        <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          reps club
        </h1>
        <p className="mx-auto max-w-md text-[15px] leading-relaxed text-ink-3">
          Seu personal monta o treino. Você executa e registra carga e repetições,
          série por série.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link href="/entrar">
          <Button size="lg">Entrar como personal</Button>
        </Link>
        <Link href="/cadastro">
          <Button size="lg" variant="secondary">
            Criar conta
          </Button>
        </Link>
      </div>
    </main>
  );
}
