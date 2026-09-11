"use client";

import { AvisoDeFalha } from "@/components/aviso-de-falha";

/** Falha de leitura dentro do painel. A barra de navegação continua montada. */
export default function ErroDoPainel({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <AvisoDeFalha
      titulo="Não deu para carregar"
      texto="Alguma coisa falhou do nosso lado. Nada do que você montou foi perdido — é só tentar de novo."
      digest={error.digest}
      aoTentarDeNovo={retry}
    />
  );
}
