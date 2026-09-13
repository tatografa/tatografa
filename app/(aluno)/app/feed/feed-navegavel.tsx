"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { TelaFeed } from "@/components/aluno/tela-feed";
import type { AbaDoFeed, PostDoFeed } from "@/lib/queries/feed";

/** O caminho de cada aba. A aba padrão não carrega parâmetro na URL. */
function caminhoDaAba(aba: AbaDoFeed): string {
  return aba === "personal" ? "/app/feed?aba=personal" : "/app/feed";
}

/**
 * A casca de cliente do feed: só sabe **trocar de aba**.
 *
 * A aba vive na URL, não em estado, porque quem busca os posts é o servidor —
 * é lá que o RLS decide o que o aluno pode ver, e duplicar essa decisão no
 * cliente seria uma segunda fonte de verdade para a mesma pergunta.
 *
 * `replace` e não `push`: com duas abas, empilhar histórico faria o botão
 * voltar do celular passear pelas abas em vez de sair do feed.
 *
 * Enquanto a navegação corre, a aba escolhida acende na hora e a lista vira
 * esqueleto. Esperar a resposta deixaria o toque sem retorno; manter a lista
 * antiga sob o rótulo novo mostraria os posts errados com o nome certo.
 */
export function FeedNavegavel({
  posts,
  aba,
  nomeDoPersonal,
  idDoPersonal,
}: {
  posts: PostDoFeed[];
  aba: AbaDoFeed;
  nomeDoPersonal: string;
  idDoPersonal: string;
}) {
  const router = useRouter();
  const [pendente, iniciarTroca] = useTransition();
  const [desejada, setDesejada] = useState<AbaDoFeed>(aba);

  // Fora da troca quem manda é a URL: assim o botão voltar e um link colado
  // acendem a aba certa sem passar por este estado.
  const escolhida = pendente ? desejada : aba;

  return (
    <TelaFeed
      posts={posts}
      aba={escolhida}
      carregando={pendente}
      nomeDoPersonal={nomeDoPersonal}
      idDoPersonal={idDoPersonal}
      aoTrocarAba={(proxima) => {
        if (proxima === escolhida) return;
        setDesejada(proxima);
        iniciarTroca(() => {
          router.replace(caminhoDaAba(proxima), { scroll: false });
        });
      }}
    />
  );
}
