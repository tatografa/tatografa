import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { NaoEncontrado } from "@/components/nao-encontrado";

export const metadata: Metadata = { title: "Página não encontrada" };

/**
 * O 404 de fora das áreas logadas — link velho, endereço digitado errado.
 *
 * Traz a própria moldura porque não está dentro de layout nenhum: `/painel` e
 * `/app` têm os seus, com navegação.
 */
export default function NaoEncontradoGeral() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6">
      <Logo size={30} />
      <div className="mt-6">
        <NaoEncontrado
          texto="O endereço pode ter mudado, ou o link que te trouxe aqui já venceu."
          destino="/"
          rotuloDoDestino="Ir para o início"
        />
      </div>
    </div>
  );
}
