import type { NextConfig } from "next";

const emDesenvolvimento = process.env.NODE_ENV !== "production";

/*
 * O que a página pode carregar, e de onde. O que ela tranca de verdade:
 * script de outro domínio (um `<script src>` injetado não roda), a página
 * dentro de iframe alheio, `<object>`, `<base>` trocado e formulário postando
 * para fora.
 *
 * `'unsafe-inline'` em script e estilo é o preço de não usar nonce: o Next
 * injeta scripts inline para hidratar, e nonce obrigaria toda página a ser
 * dinâmica. Sem `dangerouslySetInnerHTML` no projeto, o inline que sobra é o
 * do próprio Next.
 *
 * O Supabase entra em imagem (URL assinada das fotos) e em conexão; o iframe
 * só abre YouTube sem cookie e Vimeo, os mesmos de `lib/domain/video.ts`.
 */
const POLITICA_DE_CONTEUDO = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${emDesenvolvimento ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${emDesenvolvimento ? " ws:" : ""}`,
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  /*
   * O indicador do Next (o "N" preto, só em desenvolvimento) nasce no canto
   * inferior esquerdo — exatamente em cima do pé da barra lateral do painel,
   * onde ficam o nome e o botão de sair. No canto direito ele não cobre nada.
   */
  devIndicators: { position: "bottom-right" },

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
          { key: "Content-Security-Policy", value: POLITICA_DE_CONTEUDO },
          // Nada do produto usa câmera por API, microfone, localização nem
          // pagamento: a foto entra pelo seletor de arquivo, que não pede isso.
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // Sem `includeSubDomains`: os subdomínios do VPS (n8n, easypanel…)
          // não são deste app, e a regra valeria para eles também.
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
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
