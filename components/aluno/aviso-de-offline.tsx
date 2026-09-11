"use client";

import { CloudOff } from "lucide-react";
import { useOffline } from "next/offline";

/**
 * Barra de "sem conexão" no app do aluno.
 *
 * O `useOffline` do Next 16 detecta a queda por evento do navegador **e** por
 * requisição que falhou — o segundo caso é o que pega a internet da academia,
 * onde o aparelho acha que está conectado e nada chega.
 *
 * A mensagem diz o que continua funcionando, não só que caiu: registrar série é
 * local, e o aluno precisa saber que pode seguir treinando.
 */
export function AvisoDeOffline() {
  const offline = useOffline();

  if (!offline) return null;

  return (
    <p
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-warning-bg px-4 py-2 text-[12.5px] font-semibold text-warning"
      style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
    >
      <CloudOff aria-hidden size={14} />
      Sem conexão. Pode treinar: as séries vão quando o sinal voltar.
    </p>
  );
}
