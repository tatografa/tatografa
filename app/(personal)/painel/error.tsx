"use client";

import { AvisoDeFalha } from "@/components/aviso-de-falha";
import { usePainel } from "@/components/personal/idioma-do-painel";

/** Falha dentro do painel: o layout fica de pé, e o idioma chega pelo provedor. */
export default function ErroDoPainel({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = usePainel();
  return (
    <AvisoDeFalha
      titulo={t.comum.erro.titulo}
      texto={t.comum.erro.texto}
      rotuloDoBotao={t.comum.erro.tentar}
      rotuloDoCodigo={t.comum.erro.codigo}
      digest={error.digest}
      aoTentarDeNovo={retry}
    />
  );
}
