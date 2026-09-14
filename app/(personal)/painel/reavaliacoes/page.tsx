import type { Metadata } from "next";

import { requireTrainer } from "@/lib/auth/session";
import { listarAlunos } from "@/lib/queries/alunos";
import { lerReavaliacoesDaCarteira } from "@/lib/queries/reavaliacao";

import { TelaReavaliacoes } from "./tela-reavaliacoes";

export const metadata: Metadata = { title: "Reavaliações" };

/**
 * A fila de reavaliações do personal (doc 06 §9).
 *
 * Sem `comFotos`: a lista não mostra foto nenhuma, e assinar três URLs por
 * linha da carteira inteira seria pagar por imagem que ninguém vai abrir. As
 * fotos são assinadas na tela de comparação, que é onde aparecem.
 */
export default async function Reavaliacoes() {
  const { trainer } = await requireTrainer();

  const [reavaliacoes, alunos] = await Promise.all([
    lerReavaliacoesDaCarteira(trainer.id),
    listarAlunos(),
  ]);

  return <TelaReavaliacoes reavaliacoes={reavaliacoes} alunos={alunos} />;
}
