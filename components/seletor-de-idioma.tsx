"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { IDIOMAS, comIdioma, type Idioma } from "@/lib/domain/idioma";
import { cn } from "@/lib/utils";

const semAssinatura = () => () => {};

/**
 * PT · EN · ES (pedido do Otávio, 05/10): na landing, nas telas de entrada e
 * nos documentos. Cada sigla leva o nome do idioma escrito nele mesmo
 * ("English", "Español"), que é como quem não lê português reconhece a sua.
 *
 * **Link de verdade, com recarga da página inteira** (`<a>`, não `<Link>`): a
 * moldura das telas de entrada é desenhada pelo layout, e numa navegação suave
 * o layout não desenha de novo — o formulário trocaria de língua e o painel ao
 * lado, não. O `?lang=` grava o cookie no `proxy.ts`, e daí em diante a escolha
 * segue sozinha.
 *
 * O resto da URL vai junto (`?proximo=` do login, `?para=` da landing). Ele é
 * lido do navegador depois de montar, e não por `useSearchParams`, que obrigaria
 * toda página que usa o seletor a ter uma fronteira de `Suspense`.
 */
export function SeletorDeIdioma({
  idioma,
  rotulo,
  tom = "claro",
}: {
  idioma: Idioma;
  /** "Idioma" no idioma da página, para o leitor de tela. */
  rotulo: string;
  tom?: "claro" | "escuro";
}) {
  const caminho = usePathname();
  const busca = useSyncExternalStore(
    semAssinatura,
    () => window.location.search,
    () => "",
  );

  return (
    <nav
      aria-label={rotulo}
      className={cn(
        "flex w-fit items-center rounded-full border p-1",
        tom === "escuro"
          ? "border-dark-border bg-dark-surface"
          : "border-border bg-surface",
      )}
    >
      {IDIOMAS.map((i) => {
        const ativo = idioma === i.valor;
        return (
          <a
            key={i.valor}
            href={comIdioma(caminho, busca, i.valor)}
            hrefLang={i.lang}
            lang={i.lang}
            aria-label={i.nome}
            title={i.nome}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex h-8 min-w-9 items-center justify-center rounded-full px-2 text-[11.5px] font-bold tracking-[0.02em] transition",
              tom === "escuro"
                ? ativo
                  ? "bg-surface text-ink"
                  : "text-dark-text-2 hover:text-dark-text"
                : ativo
                  ? "bg-ink text-white"
                  : "text-ink-3 hover:text-ink",
            )}
          >
            {i.sigla}
          </a>
        );
      })}
    </nav>
  );
}
