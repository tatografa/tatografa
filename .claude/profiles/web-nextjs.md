# Perfil de stack: Web (Next.js)

Use este perfil para aplicações web. É o caminho mais amigável para quem não é técnico.

## Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Estilo:** Tailwind CSS + shadcn/ui
- **Gerenciador de pacotes:** pnpm (fallback: npm)
- **Testes:** Vitest + Testing Library (unit/componentes); Playwright (e2e, opcional)
- **Lint/format:** ESLint + Prettier

## Comandos
- Instalar: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Testes: `pnpm test`
- Lint: `pnpm lint`

## Bootstrap (projeto novo)
`pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm`
Depois inicialize o shadcn/ui: `pnpm dlx shadcn@latest init`.

## Verificação (provar que funciona, sem o usuário ler código)
- Suba o app (`pnpm dev`) e abra no navegador via **Claude no Chrome**.
- Tire **screenshots** das telas afetadas e anexe ao PR.
- Confira estados: carregando, vazio, erro, sucesso; e responsividade (mobile/desktop).

## Deploy nos trilhos
- **Vercel.** Conecte o repositório; cada PR gera um *preview deploy* automático e o merge na main publica em produção. Sem configuração manual de servidor.

## Design system & acessibilidade
- **Tokens (fonte de verdade):** tokens **DTCG** no caminho registrado na seção **Design System** do `CLAUDE.md` (default `design/tokens.json`; em monorepo, um pacote `design-tokens`); `pnpm tokens:build` (Style Dictionary) gera as variáveis CSS / tema do Tailwind num `build/` versionado. Componentes e telas consomem SÓ os tokens.
- Componentes: **shadcn/ui** (sobre Radix, acessível) + Tailwind. Catálogo navegável no **Storybook**, publicado em URL fixa.
- Acessibilidade: meta **WCAG 2.2 AA**; valide com **axe-core** (addon a11y do Storybook / Playwright) e **Lighthouse**.
- Protótipos navegáveis = páginas reais; publique na Vercel (URL fixa) para navegação por URL.
- **Acesso restrito sem custo:** o plano free da Vercel não tem proteção por senha; para liberar só a stakeholders, use um **gate de login simples** (middleware Next.js conferindo usuário/senha de variável de ambiente) — fica gratuito.
