import { cn } from "@/lib/utils";

/**
 * O círculo de uma pessoa: a foto de perfil, ou as iniciais quando não há foto.
 *
 * `className` traz o tamanho e a roupa das iniciais (fundo, cor, fonte) de cada
 * tela — elas continuam diferentes entre o painel, o feed e a ficha, e cada uma
 * já passou em contraste. Com foto, o fundo e a fonte ficam sem efeito.
 *
 * Sem diretiva e sem hook, de propósito: o dashboard e a agenda são componentes
 * servidor e a tabela de alunos e o feed são cliente, e uma cópia por lado é
 * como o círculo das iniciais virou treze.
 *
 * Decorativo nos dois casos (`alt=""` e `aria-hidden`): o nome da pessoa está
 * sempre escrito ao lado, e o leitor de tela o leria duas vezes.
 */
export function Avatar({
  foto,
  iniciais,
  className,
}: {
  foto?: string | null;
  iniciais: string;
  className?: string;
}) {
  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL assinada de bucket privado; o otimizador do Next a buscaria de novo a cada assinatura
      <img
        src={foto}
        alt=""
        aria-hidden
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full", className)}
    >
      {iniciais}
    </span>
  );
}
