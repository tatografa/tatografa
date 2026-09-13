import type { Metadata } from "next";
import Link from "next/link";

import { requireStudent } from "@/lib/auth/session";

import { Compositor } from "./compositor";

export const metadata: Metadata = { title: "Novo post" };

/**
 * Publicar um treino (doc 05, tela 10).
 *
 * O nome do personal desce como prop porque ele é quem dá sentido às duas
 * opções de alcance: "só a Ana" e "a Ana e a turma" explicam a escolha sem
 * texto de apoio, e "privado"/"público" não explicariam.
 */
export default async function NovoPost() {
  const { personal } = await requireStudent();

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <Link href="/app/feed" className="eyebrow text-ink-4 transition hover:text-ink-2">
          ← Feed
        </Link>
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          Publicar treino
        </h1>
      </header>

      <Compositor nomeDoPersonal={personal.name.split(" ")[0]} />
    </div>
  );
}
