import type { MetadataRoute } from "next";

/**
 * Manifest do PWA, pela convenção do Next 16 (`app/manifest.ts`).
 *
 * `start_url` é `/app` e não `/`: quem instala na tela inicial é o **aluno**, e
 * a raiz é a landing. O personal usa computador e não instala nada.
 *
 * As cores são as do tema escuro da execução (`app/globals.css`), que é onde o
 * app passa mais tempo quando está instalado — abrir com fundo claro e trocar
 * para escuro na primeira tela é o flash que faz PWA parecer site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reps Club",
    short_name: "Reps Club",
    description:
      "Seu treino, série por série. Registre carga e repetições e veja sua evolução.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["health", "fitness", "sports"],
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icone-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
