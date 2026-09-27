import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * O cabeçalho de toda página do painel, como no protótipo: título e uma frase à
 * esquerda, a ação primária à direita, e uma linha fina separando do conteúdo.
 *
 * **Um componente só, e não dezessete cabeçalhos escritos à mão.** Cada página
 * tinha o seu — eyebrow, título de 28px, às vezes contagem no lugar do nome —,
 * e foi assim que o painel ficou parecido com o protótipo em estrutura e
 * diferente em tudo o resto. Com a regra num lugar, a próxima página nasce
 * igual às outras sem ninguém lembrar de copiar.
 *
 * **Componente comum, sem `async` e sem banco**, de propósito: cinco das telas
 * são componentes cliente com o botão da ação ligado ao estado delas (o
 * diálogo de novo exercício, o de nova sessão), e um cabeçalho de servidor
 * obrigaria a arrancar esse estado de dentro delas.
 *
 * **A altura é fixa (90px) e o texto não quebra linha.** O avatar do personal
 * mora no layout, e não aqui — é o único lugar que já conhece o nome dele —, e
 * fica alinhado a este cabeçalho pela altura. Uma frase que quebrasse em duas
 * linhas desalinharia os dois; ela trunca com reticências no lugar, e a frase
 * inteira continua no `title`.
 *
 * **O título é o nome da página, não uma contagem.** "24 alunos" dizia quantos,
 * mas não onde se estava; o número que importa vai na frase de apoio ou nos
 * indicadores logo abaixo.
 */
export function CabecalhoDaPagina({
  titulo,
  subtitulo,
  acoes,
  voltar,
  selo,
}: {
  titulo: string;
  subtitulo?: string;
  /** A ação primária — um só botão na maioria das páginas, como no protótipo. */
  acoes?: React.ReactNode;
  /** Páginas de detalhe: o caminho de volta, na primeira linha do conteúdo. */
  voltar?: { href: string; rotulo: string };
  /** Um selo ao lado do título ("Ativo", "Arquivado"). */
  selo?: React.ReactNode;
}) {
  return (
    <>
      {/*
        `-mx-7 -mt-0` e o `px-7` de volta: o layout dá o respiro lateral ao
        conteúdo, e o cabeçalho precisa da linha de borda a borda do cartão. É
        o cabeçalho que sangra, para as dezessete páginas não precisarem cada
        uma embrulhar o próprio corpo.
      */}
      <header className="-mx-7 mb-6 flex h-[90px] items-center justify-between gap-4 border-b border-border-soft px-7 pr-[80px]">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">
              {titulo}
            </h1>
            {selo}
          </div>
          {subtitulo ? (
            <p
              title={subtitulo}
              className="mt-[3px] truncate text-[13px] font-medium text-ink-4"
            >
              {subtitulo}
            </p>
          ) : null}
        </div>
        {acoes ? (
          <div className="flex shrink-0 items-center gap-3">{acoes}</div>
        ) : null}
      </header>

      {voltar ? (
        <Link
          href={voltar.href}
          className="-mt-1 mb-5 inline-flex min-h-8 items-center gap-1.5 text-[13px] font-medium text-brand transition hover:text-brand-hover"
        >
          <ArrowLeft size={14} aria-hidden />
          {voltar.rotulo}
        </Link>
      ) : null}
    </>
  );
}
