import Link from "next/link";

import { Button } from "@/components/ui";
import { Logo } from "@/components/logo";
import { SeletorDeIdioma } from "@/components/seletor-de-idioma";
import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { TEXTOS_DO_CONVITE, type TextosDoConvite } from "@/lib/i18n/convite";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";
import type { Idioma } from "@/lib/domain/idioma";
import { createClient } from "@/lib/supabase/server";

import { FormularioOnboarding } from "./formulario-onboarding";

/**
 * Onboarding do aluno a partir do convite.
 *
 * O visitante ainda não tem sessão, então a leitura do convite passa por
 * `convite_por_token` — função estreita, não a chave de serviço (migration 0006).
 */
export default async function ConvitePage({
  params,
  searchParams,
}: PageProps<"/convite/[token]">) {
  const { token } = await params;
  const { lang } = await searchParams;
  const idioma = await idiomaAtual(typeof lang === "string" ? lang : undefined);
  const t = TEXTOS_DO_CONVITE[idioma];
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("convite_por_token", {
    p_token: token,
  });

  // Banco fora do ar não é convite vencido. Mandar quem tem um link bom para a
  // tela de "pede outro pro seu personal" perde o aluno por um erro nosso.
  if (error) return <FalhaTecnica t={t} idioma={idioma} />;

  const convite = data?.[0];
  if (!convite) return <LinkExpirado t={t} idioma={idioma} />;

  return (
    <FormularioOnboarding
      token={token}
      nome={convite.nome}
      email={convite.email}
      personal={convite.personal}
      idioma={idioma}
      textos={t}
      aceite={TEXTOS_DA_AUTENTICACAO[idioma].aceite}
    />
  );
}

/**
 * Convite inexistente, já usado ou vencido — os três casos levam à mesma tela.
 * Distinguir "já usado" de "não existe" contaria a um estranho que aquele token
 * um dia foi válido.
 */
function LinkExpirado({ t, idioma }: { t: TextosDoConvite; idioma: Idioma }) {
  return (
    <Aviso
      icone="⏳"
      titulo={t.expiradoTitulo}
      texto={t.expiradoTexto}
      t={t}
      idioma={idioma}
    />
  );
}

/** O link pode estar ótimo — quem falhou fomos nós. O texto diz isso. */
function FalhaTecnica({ t, idioma }: { t: TextosDoConvite; idioma: Idioma }) {
  return (
    <Aviso
      icone="⚠️"
      titulo={t.falhaTitulo}
      texto={t.falhaTexto}
      t={t}
      idioma={idioma}
    />
  );
}

function Aviso({
  icone,
  titulo,
  texto,
  t,
  idioma,
}: {
  icone: string;
  titulo: string;
  texto: string;
  t: TextosDoConvite;
  idioma: Idioma;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-dark-bg px-7 text-center">
      <div className="absolute top-6 left-7 text-dark-text">
        <Logo size={26} />
      </div>
      <div className="absolute top-5 right-6">
        <SeletorDeIdioma idioma={idioma} rotulo={t.idioma} tom="escuro" />
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
        <p className="mx-auto max-w-[280px] text-[15px] leading-[1.6] text-dark-muted">
          {texto}
        </p>
      </div>

      <Link href="/" className="mt-2">
        <Button variant="secondary">{t.voltarAoInicio}</Button>
      </Link>
    </div>
  );
}
