import { Check } from "lucide-react";

import { IDIOMAS, type Idioma } from "@/lib/domain/idioma";
import { cn } from "@/lib/utils";

/**
 * A opção de idioma do app, no perfil do aluno (pedido do Otávio, 05/10).
 *
 * Três linhas com o nome de cada idioma escrito nele mesmo, e não as siglas do
 * seletor das telas de entrada: aqui é uma configuração que se visita uma vez,
 * e "English" é reconhecido por quem não lê "Inglês".
 *
 * **Link de verdade, com recarga inteira** (`<a>`): o `?lang=` grava o cookie
 * no `proxy.ts`, e o layout do aluno — que é quem entrega o dicionário ao app —
 * só desenha de novo numa navegação completa. Sem JavaScript também funciona.
 */
export function EscolhaDeIdioma({
  idioma,
  rotulo,
  caminho,
}: {
  idioma: Idioma;
  rotulo: string;
  /** A tela onde a escolha acontece; volta para ela já no idioma novo. */
  caminho: string;
}) {
  return (
    <nav aria-label={rotulo}>
      <ul className="divide-y divide-border-soft">
        {IDIOMAS.map((i) => {
          const ativo = i.valor === idioma;
          return (
            <li key={i.valor}>
              <a
                href={`${caminho}?lang=${i.valor}`}
                hrefLang={i.lang}
                lang={i.lang}
                aria-current={ativo ? "true" : undefined}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 py-2.5 text-[14px] transition",
                  ativo ? "font-bold text-ink" : "font-medium text-ink-3 hover:text-ink",
                )}
              >
                {i.nome}
                {ativo ? <Check size={16} className="shrink-0 text-brand" aria-hidden /> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
