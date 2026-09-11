"use client";

import { AvisoDeFalha } from "@/components/aviso-de-falha";

/**
 * Falha de leitura dentro do app do aluno.
 *
 * Fica em `/app` e não na raiz porque aqui a bottom nav continua montada: o
 * aluno perde a tela, não o app. Ele consegue ir para outra aba sem recarregar.
 */
export default function ErroDoApp({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <AvisoDeFalha
      titulo="Não deu para carregar"
      texto="Alguma coisa falhou do nosso lado. Seus treinos e seu histórico continuam guardados — é só tentar de novo."
      digest={error.digest}
      aoTentarDeNovo={retry}
    />
  );
}
