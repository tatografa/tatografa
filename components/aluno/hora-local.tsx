"use client";

import { useMontado } from "@/lib/usar-montado";

/**
 * A hora de um instante no fuso **do aparelho do aluno**.
 *
 * Formatar no servidor daria o fuso do servidor: um treino começado às 18h20
 * apareceria como 21h20 para o aluno. E formatar já no render de hidratação
 * faria o HTML dos dois lados discordar. Por isso o texto só aparece depois de
 * montar — o resto da frase é escrito para fazer sentido sem ele.
 */
export function HoraLocal({ iso }: { iso: string }) {
  const montado = useMontado();
  if (!montado) return null;

  const data = new Date(iso);
  const hora = `${String(data.getHours()).padStart(2, "0")}h${String(data.getMinutes()).padStart(2, "0")}`;

  return <time dateTime={iso}>{hora}</time>;
}
