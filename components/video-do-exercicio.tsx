import { PlayCircle } from "lucide-react";

import { enderecoDeEmbed } from "@/lib/domain/video";
import { cn } from "@/lib/utils";

/**
 * O vídeo de um exercício, 16:9, dividido entre o painel do personal e o
 * "Como fazer" do aluno. Sem link reconhecido, a moldura fica com o ícone —
 * nunca um `<iframe>` apontando para um endereço que não é YouTube nem Vimeo.
 */
export function VideoDoExercicio({
  url,
  nome,
  titulo = "Vídeo: {nome}",
  className,
}: {
  url: string | null;
  nome: string;
  /** "Vídeo: {nome}" no idioma de quem vê; o painel ainda é só português. */
  titulo?: string;
  className?: string;
}) {
  const embed = url ? enderecoDeEmbed(url) : null;

  return (
    <div
      className={cn(
        "flex aspect-video w-full items-center justify-center overflow-hidden rounded-[14px] bg-dark-bg text-dark-muted",
        className,
      )}
    >
      {embed ? (
        <iframe
          src={embed}
          title={titulo.replace("{nome}", nome)}
          className="size-full border-0"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <PlayCircle size={46} strokeWidth={1.4} aria-hidden />
      )}
    </div>
  );
}
