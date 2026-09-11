"use client";

import { AvisoDeFalha } from "@/components/aviso-de-falha";
import { Logo } from "@/components/logo";

/**
 * A rede de segurança de tudo que não tem boundary mais perto.
 *
 * **Por que existe, se `/app` e `/painel` já têm o seu:** `error.tsx` não
 * envolve o `layout.tsx` do próprio segmento — só os de baixo. E é justamente
 * no layout que mora a autorização (`requireStudent`, `requireTrainer`), que é
 * a leitura mais provável de falhar no app inteiro, porque toca o Supabase em
 * toda navegação. Sem este arquivo, um Supabase fora do ar derruba o usuário
 * no `global-error`, que troca o documento inteiro e não carrega o CSS do app.
 *
 * Cobre também o que não tem boundary próprio: landing, telas de acesso,
 * convite e `/offline`.
 *
 * Traz a própria moldura porque renderiza direto no `body`, sem navegação
 * nenhuma em volta.
 */
export default function ErroGeral({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6">
      <Logo size={30} />
      <div className="mt-6">
        <AvisoDeFalha
          titulo="Não deu para carregar"
          texto="Alguma coisa falhou do nosso lado. Nada do que é seu foi perdido — é só tentar de novo."
          digest={error.digest}
          aoTentarDeNovo={retry}
        />
      </div>
    </div>
  );
}
