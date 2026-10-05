import { NaoEncontrado } from "@/components/nao-encontrado";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";

export default async function NaoEncontradoNoPainel() {
  const { t } = await textosDoPainel();
  return (
    <NaoEncontrado
      titulo={t.comum.naoEncontrado.titulo}
      texto={t.comum.naoEncontrado.texto}
      destino="/painel"
      rotuloDoDestino={t.comum.naoEncontrado.destino}
    />
  );
}
