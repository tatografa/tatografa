import { redirect } from "next/navigation";

/**
 * A fila de reavaliações foi morar na agenda em 27/09 (pedido do Otávio: as
 * duas numa tela só). O endereço continua de pé porque há link salvo e
 * mensagem apontando para ele. A comparação de um aluno
 * (`/painel/reavaliacoes/<aluno>`) continua aqui, e não muda.
 */
export default function ReavaliacoesPage() {
  redirect("/painel/agenda");
}
