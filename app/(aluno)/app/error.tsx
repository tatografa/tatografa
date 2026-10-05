"use client";

import { AvisoDeFalha } from "@/components/aviso-de-falha";
import { useIdioma } from "@/components/aluno/idioma-do-app";

/**
 * Falha dentro do app do aluno. Fica dentro do layout do aluno, então o idioma
 * escolhido no perfil chega até aqui pelo provedor.
 */
export default function ErroDoApp({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useIdioma();
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
