import Link from "next/link";

import { Button } from "@/components/ui";
import { requireStudent } from "@/lib/auth/session";
import { langDe } from "@/lib/domain/idioma";
import { primeiroNome } from "@/lib/domain/nome";
import { partesEmVolta, preencher, TEXTOS_DO_CONVITE } from "@/lib/i18n/convite";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

/**
 * Boas-vindas depois do onboarding (doc 05, tela 1.3).
 *
 * Passa por `requireStudent()` porque só faz sentido para quem acabou de
 * entrar; quem chegar aqui sem sessão vai para /acesso. No idioma em que o
 * aluno fez o cadastro (o cookie seguiu desde o convite); o app depois disso
 * ainda é português (etapa 2 da tradução).
 */
export default async function ProntoPage() {
  const { student, personal } = await requireStudent();
  const idioma = await idiomaAtual();
  const t = TEXTOS_DO_CONVITE[idioma];
  const [antes, depois] = partesEmVolta(t.prontoTexto, "personal");

  return (
    <div
      lang={langDe(idioma)}
      className="flex min-h-dvh flex-col items-center justify-center gap-7 bg-dark-bg px-7 text-center"
    >
      <div className="flex size-[88px] items-center justify-center rounded-full bg-brand text-[40px] font-extrabold text-white shadow-halo">
        ✓
      </div>

      <div className="space-y-3">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-dark-text">
          {preencher(t.prontoTitulo, { nome: primeiroNome(student.name) })}
        </h1>
        <p className="mx-auto max-w-[260px] text-[15px] leading-[1.6] text-dark-muted">
          {antes}
          <strong className="font-bold text-dark-text-2">{personal.name}</strong>
          {depois}
        </p>
      </div>

      <Link href="/app" className="w-full max-w-[300px]">
        <Button block size="lg">
          {t.verTreinos}
        </Button>
      </Link>
    </div>
  );
}
