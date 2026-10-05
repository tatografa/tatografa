"use client";

import { useMontado } from "@/lib/usar-montado";

import { useIdioma } from "./idioma-do-app";

/**
 * A hora de um instante no fuso **do aparelho do aluno**.
 *
 * Formatar no servidor daria o fuso do servidor: um treino começado às 18h20
 * apareceria como 21h20 para o aluno. E formatar já no render de hidratação
 * faria o HTML dos dois lados discordar. Por isso o texto só aparece depois de
 * montar — o resto da frase é escrito para fazer sentido sem ele.
 *
 * `prefixo` existe por causa disso: quem escreve "Hoje · 19h30" precisa que o
 * separador **suma junto** com a hora, senão o card aparece como "Hoje · " até
 * hidratar, com o ponto pendurado no fim.
 */
export function HoraLocal({
  iso,
  prefixo,
  className,
}: {
  iso: string;
  prefixo?: string;
  className?: string;
}) {
  const montado = useMontado();
  const { idioma } = useIdioma();
  if (!montado) return null;

  const data = new Date(iso);
  // "18h20" é jeito brasileiro de escrever hora; em inglês e espanhol, "18:20".
  const separador = idioma === "pt" ? "h" : ":";
  const hora = `${String(data.getHours()).padStart(2, "0")}${separador}${String(data.getMinutes()).padStart(2, "0")}`;

  return (
    <>
      {prefixo}
      <time dateTime={iso} className={className}>
        {hora}
      </time>
    </>
  );
}
