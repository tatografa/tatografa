import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui";
import { requireTrainer } from "@/lib/auth/session";

import { AjusteDeAlerta } from "./ajuste-de-alerta";

export const metadata: Metadata = { title: "Configurações" };

/**
 * Configurações do personal (doc 06).
 *
 * Hoje só o limiar de inatividade. A página existe agora, e não quando houver
 * mais ajustes, porque o número que decide quem aparece como problema no painel
 * tem que ser visível e mutável por quem responde por ele.
 */
export default async function Configuracoes() {
  const { trainer } = await requireTrainer();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/painel"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Painel
        </Link>
        <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          Configurações
        </h1>
      </header>

      <section className="space-y-3">
        <h2 className="eyebrow text-ink-4">Alerta de inatividade</h2>
        <Card size="lg" className="max-w-xl">
          <AjusteDeAlerta dias={trainer.dias_para_alerta} />
        </Card>
      </section>
    </div>
  );
}
