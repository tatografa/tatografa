import Link from "next/link";

import { classesDeBotao } from "@/components/ui";

/**
 * O 404 do produto.
 *
 * **"Não encontramos" e não "não existe":** várias rotas deste app devolvem 404
 * para coisa que existe mas não é de quem está olhando — treino de outro aluno,
 * programa de outro personal. É deliberado (distinguir contaria a um estranho
 * que aquele id existe), e por isso o texto não pode afirmar inexistência.
 */
export function NaoEncontrado({
  texto,
  destino,
  rotuloDoDestino,
}: {
  texto: string;
  destino: string;
  rotuloDoDestino: string;
}) {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center px-1 py-10 text-center">
      <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-ink-5 uppercase">
        404
      </p>
      <h1 className="mt-3 text-[19px] font-extrabold tracking-[-0.02em] text-ink">
        Não encontramos esta página
      </h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{texto}</p>
      <Link href={destino} className={classesDeBotao({ className: "mt-5" })}>
        {rotuloDoDestino}
      </Link>
    </div>
  );
}
