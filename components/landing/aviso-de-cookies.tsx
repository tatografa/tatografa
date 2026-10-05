"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  COOKIE_DO_CONSENTIMENTO,
  VALIDADE_DO_CONSENTIMENTO,
  consentimentoDe,
  type Consentimento,
} from "@/lib/domain/cookies";

/*
 * A escolha mora num cookie, e quem a lê é `useSyncExternalStore`: no servidor
 * e na hidratação o valor é "ainda não sei" e o aviso não desenha nada; depois
 * ele lê o cookie de verdade. Sem isso, quem já escolheu veria o aviso piscar
 * a cada visita, ou o HTML do servidor discordaria do da hidratação.
 */
const ouvintes = new Set<() => void>();

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

function gravar(valor: Consentimento | null) {
  document.cookie =
    valor === null
      ? `${COOKIE_DO_CONSENTIMENTO}=; path=/; max-age=0; samesite=lax`
      : `${COOKIE_DO_CONSENTIMENTO}=${valor}; path=/; max-age=${VALIDADE_DO_CONSENTIMENTO}; samesite=lax`;
  ouvintes.forEach((avisar) => avisar());
}

function useConsentimento(): Consentimento | null | "carregando" {
  return useSyncExternalStore(
    assinar,
    () => consentimentoDe(document.cookie),
    () => "carregando" as const,
  );
}

/**
 * O aviso de cookies da landing (pedido do Otávio, 05/10).
 *
 * **"Recusar" e "Aceitar" têm o mesmo tamanho e o mesmo peso**: recusar não
 * pode dar mais trabalho que aceitar, senão a escolha não é livre. E o aviso
 * não tranca a página — não é diálogo modal: quem só quer ler continua lendo,
 * e sem escolha nada opcional carrega (`aceitouMedicao`).
 *
 * O texto diz a verdade de hoje: só há cookies essenciais. Medição de uso entra
 * só com "Aceitar", e publicidade nunca — a mesma frase da política de
 * privacidade, seção "Cookies".
 */
export function AvisoDeCookies() {
  const consentimento = useConsentimento();
  if (consentimento !== null) return null;

  return (
    <section
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-50 rounded-[20px] border border-dark-border-2 bg-dark-surface p-5 text-dark-text shadow-vitrine sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-[440px]"
    >
      <p className="mb-1.5 text-[15px] font-extrabold tracking-[-0.01em]">
        Cookies
      </p>
      <p className="mb-4 text-[13.5px] leading-[1.6] text-dark-text-2">
        Usamos cookies essenciais para o site funcionar e manter você
        conectado. Cookies de medição de uso só entram se você aceitar — e
        nunca usamos cookies de publicidade.{" "}
        <Link
          href="/privacidade#cookies"
          className="font-semibold text-dark-text underline underline-offset-2 hover:text-dark-text-2"
        >
          Saiba mais
        </Link>
      </p>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => gravar("recusado")}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-[1.5px] border-dark-border-2 px-5 text-[14px] font-bold text-dark-text transition hover:border-dark-muted"
        >
          Recusar
        </button>
        <button
          type="button"
          onClick={() => gravar("aceito")}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand px-5 text-[14px] font-bold text-white transition hover:bg-brand-hover"
        >
          Aceitar
        </button>
      </div>
    </section>
  );
}

/**
 * Link do rodapé para mudar de ideia: apaga a escolha e o aviso volta.
 * Retirar o consentimento tem de ser tão fácil quanto dar.
 */
export function PreferenciasDeCookies({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => gravar(null)} className={className}>
      Cookies
    </button>
  );
}
