import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui";
import { requireStudent } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Tudo pronto · Reps Club" };

/**
 * Boas-vindas depois do onboarding (doc 05, tela 1.3).
 *
 * Passa por `requireStudent()` porque só faz sentido para quem acabou de
 * entrar; quem chegar aqui sem sessão vai para /acesso.
 */
export default async function ProntoPage() {
  const { student, personal } = await requireStudent();
  const primeiroNome = student.name.split(" ")[0];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-7 bg-dark-bg px-7 text-center">
      <div className="flex size-[88px] items-center justify-center rounded-full bg-brand text-[40px] font-extrabold text-white shadow-halo">
        ✓
      </div>

      <div className="space-y-3">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-dark-text">
          Tudo pronto, {primeiroNome}!
        </h1>
        <p className="mx-auto max-w-[260px] text-[15px] leading-[1.6] text-ink-5">
          Sua conta está pronta e conectada à{" "}
          <strong className="font-bold text-dark-text-2">{personal.name}</strong>
          .
        </p>
      </div>

      <Link href="/app" className="w-full max-w-[300px]">
        <Button block size="lg">
          Ver meus treinos
        </Button>
      </Link>
    </div>
  );
}
