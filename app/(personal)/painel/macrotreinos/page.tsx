import { redirect } from "next/navigation";

/**
 * Macrotreinos morava aqui até 27/09, quando o programa passou a ser montado
 * dentro da divisão de treino (decisão do Otávio). O endereço continua de pé
 * porque há link salvo, histórico do navegador e mensagem de WhatsApp
 * apontando para ele.
 */
export default function MacrotreinosPage() {
  redirect("/painel/treinos");
}
