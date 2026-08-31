import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";

import { FormularioOnboarding } from "./formulario-onboarding";

export const metadata: Metadata = { title: "Criar acesso · Reps Club" };

/**
 * Onboarding do aluno a partir do convite.
 *
 * O visitante ainda não tem sessão, então a leitura do convite passa por
 * `convite_por_token` — função estreita, não a chave de serviço (migration 0006).
 */
export default async function ConvitePage({
  params,
}: PageProps<"/convite/[token]">) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("convite_por_token", {
    p_token: token,
  });

  // Banco fora do ar não é convite vencido. Mandar quem tem um link bom para a
  // tela de "pede outro pro seu personal" perde o aluno por um erro nosso.
  if (error) return <FalhaTecnica />;

  const convite = data?.[0];
  if (!convite) return <LinkExpirado />;

  return (
    <FormularioOnboarding
      token={token}
      nome={convite.nome}
      email={convite.email}
      personal={convite.personal}
    />
  );
}

/**
 * Convite inexistente, já usado ou vencido — os três casos levam à mesma tela.
 * Distinguir "já usado" de "não existe" contaria a um estranho que aquele token
 * um dia foi válido.
 */
function LinkExpirado() {
  return (
    <Aviso
      icone="⏳"
      titulo="Esse link não vale mais"
      texto="Convites valem por 7 dias e só podem ser usados uma vez. Peça um novo para o seu personal."
    />
  );
}

/** O link pode estar ótimo — quem falhou fomos nós. O texto diz isso. */
function FalhaTecnica() {
  return (
    <Aviso
      icone="⚠️"
      titulo="Não conseguimos abrir seu convite"
      texto="Foi um problema nosso, não com o seu link. Tente de novo em alguns instantes."
    />
  );
}

function Aviso({
  icone,
  titulo,
  texto,
}: {
  icone: string;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-dark-bg px-7 text-center">
      <div className="absolute top-6 left-7 text-dark-text">
        <Logo size={26} />
      </div>

      <div
        aria-hidden
        className="flex size-[88px] items-center justify-center rounded-full bg-dark-elev text-[40px]"
      >
        {icone}
      </div>

      <div className="space-y-3">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-dark-text">
          {titulo}
        </h1>
        <p className="mx-auto max-w-[280px] text-[15px] leading-[1.6] text-ink-5">
          {texto}
        </p>
      </div>

      <Link href="/" className="mt-2">
        <Button variant="secondary">Voltar ao início</Button>
      </Link>
    </div>
  );
}
