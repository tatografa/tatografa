import { NaoEncontrado } from "@/components/nao-encontrado";
import { textosDoApp } from "@/lib/i18n/app/servidor";

export default async function NaoEncontradoNoApp() {
  const { t } = await textosDoApp();
  return (
    <NaoEncontrado
      titulo={t.comum.naoEncontrado.titulo}
      texto={t.comum.naoEncontrado.texto}
      destino="/app"
      rotuloDoDestino={t.comum.naoEncontrado.destino}
    />
  );
}
