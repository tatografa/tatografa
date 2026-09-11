import { NaoEncontrado } from "@/components/nao-encontrado";

export default function NaoEncontradoNoPainel() {
  return (
    <NaoEncontrado
      texto="Ou ela não existe, ou é de outro personal. Aluno, treino e programa só aparecem para quem os criou."
      destino="/painel"
      rotuloDoDestino="Voltar ao painel"
    />
  );
}
