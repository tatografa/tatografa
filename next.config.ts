import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /*
     * Detecção de conexão e **reenvio automático** de navegação, prefetch e
     * Server Action que falharam por rede (Next 16). É o que faz o app do aluno
     * se recuperar sozinho quando o sinal da academia volta, em vez de deixar a
     * tela travada num botão que não respondeu.
     *
     * Não substitui a fila de séries: aquela existe porque confirmar série tem
     * que ser local e imediato, e porque o reenvio dela é em lote com `upsert`.
     * Esta opção cobre o resto das idas ao servidor.
     */
    useOffline: true,

    serverActions: {
      /*
       * O padrão do Next é 1 MB, e foto de celular passa disso com folga — a
       * publicação no feed falharia em quase todo aparelho.
       *
       * É uma **rede de segurança**, não o caminho normal: `lib/imagem.ts`
       * encolhe a foto no aparelho antes de enviar, e o resultado costuma ficar
       * abaixo de 500 kB. Este teto acompanha o limite do bucket `treinos`
       * (5 MB, migration 0018) com folga para o resto do formulário, para o
       * caso de a redução falhar e o arquivo original seguir.
       */
      bodySizeLimit: "6mb",
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Impede o navegador de "adivinhar" o tipo do arquivo.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // O app não é feito para viver dentro de iframe de ninguém.
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // O service worker nunca pode vir do cache: uma versão velha dele
        // continua decidindo o que o navegador serve, e é o arquivo que mais
        // precisa poder ser corrigido rápido.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
