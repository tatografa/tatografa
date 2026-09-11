import type { Metadata } from "next";

import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Sem conexão" };

/**
 * A tela que o service worker serve quando a navegação falha.
 *
 * Precisa ser **pública e sem dado nenhum**: é a única página que o app guarda
 * no cache do navegador, e o cache é do aparelho, não da pessoa. Qualquer coisa
 * pessoal aqui seria mostrada para quem pegasse o celular depois.
 *
 * Também precisa ser estática — sem `requireStudent()`, sem consulta. Ela é
 * servida justamente quando não há rede para consultar nada.
 */
export default function Offline() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo size={32} />

      <h1 className="mt-8 text-[22px] font-extrabold tracking-[-0.02em] text-ink">
        Sem conexão
      </h1>

      <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-relaxed text-ink-3">
        Não deu para carregar esta tela agora. Assim que a internet voltar, é só
        recarregar.
      </p>

      <div className="mt-7 max-w-[320px] rounded-card border border-border-soft bg-surface px-4 py-3.5">
        <p className="text-[13px] leading-relaxed text-ink-2">
          <span className="font-semibold text-ink">
            Se você estava treinando:
          </span>{" "}
          as séries que você confirmou estão guardadas no aparelho e vão para o
          histórico assim que houver sinal. Volte para o treino e continue —
          registrar série não depende de internet.
        </p>
      </div>
    </div>
  );
}
