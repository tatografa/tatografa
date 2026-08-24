import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";

// Inter é a família de UI. JetBrains Mono só aparece em eyebrow, label de
// formulário, badge, timer e metadado — nunca em corpo de texto (doc 04).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Reps Club",
    template: "%s · Reps Club",
  },
  description:
    "Personal trainers montam os treinos. Alunos executam e registram carga e repetições, série por série.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  // O app do aluno roda em tela cheia no celular; a bottom nav respeita a
  // safe-area do iPhone. Definir aqui desde já evita retrabalho na fase 4.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
