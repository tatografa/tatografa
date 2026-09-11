import { NaoEncontrado } from "@/components/nao-encontrado";

export default function NaoEncontradoNoApp() {
  return (
    <NaoEncontrado
      texto="Ou ela não existe, ou não é do seu cadastro. Se o seu personal acabou de montar um treino, ele aparece na lista."
      destino="/app"
      rotuloDoDestino="Ir para o início"
    />
  );
}
