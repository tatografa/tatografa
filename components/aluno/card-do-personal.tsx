import { MessageCircle } from "lucide-react";

import { Card } from "@/components/ui";
import { iniciaisDe } from "@/lib/domain/nome";
import { linkDoWhatsApp } from "@/lib/domain/telefone";

/**
 * Quem treina o aluno, e como falar com ele (doc 05 §11).
 *
 * **Sem número, o card continua** — só perde o botão. Ele diz quem é o personal
 * do aluno, que é informação por si só, e some-lo por falta de telefone faria a
 * tela mudar de forma dependendo de um dado que não é do aluno.
 *
 * O link abre o WhatsApp sem texto pronto. Mensagem pré-escrita ("Olá, sou seu
 * aluno…") vira a frase que todo mundo manda, e quem abre o WhatsApp já sabe o
 * que quer dizer — diferente do convite, onde quem escreve é o personal e a
 * mensagem carrega o link.
 */
export function CardDoPersonal({
  nome,
  telefone,
}: {
  nome: string;
  telefone: string | null;
}) {
  const zap = linkDoWhatsApp(telefone);

  return (
    <Card className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white"
      >
        {iniciaisDe(nome)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-ink">{nome}</p>
        <p className="text-[11px] text-ink-4">Seu personal trainer</p>
      </div>

      {zap && (
        <a
          href={zap}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border border-ink px-3 text-[12px] font-bold text-ink transition hover:bg-ink hover:text-white"
        >
          <MessageCircle size={14} aria-hidden />
          WhatsApp
        </a>
      )}
    </Card>
  );
}
