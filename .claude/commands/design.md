---
description: Cria ou evolui design system e/ou protótipos navegáveis (UX/UI/acessibilidade) em código aberto — sem Figma.
argument-hint: <o que projetar: design system, telas, fluxo...>
---

Tarefa de design para o produto atual.

Briefing do usuário:
$ARGUMENTS

Roteiro:

1. Se a tarefa exigir planejamento (várias telas/fluxos), acione o `tech-lead` para quebrar em cards em `docs/cards/`. Para algo direto, vá ao passo 2.
2. **Acione o subagente `design-engineer`** para criar/evoluir:
   - **design system** — tokens **DTCG** (no caminho do produto: `design/tokens.json` ou pacote `design-tokens` em monorepo) + build multi-plataforma (`pnpm tokens:build`) + componentes acessíveis (Tailwind + shadcn/Radix), catalogados no **Storybook**; e/ou
   - **protótipos navegáveis** — telas/fluxos reais e clicáveis (páginas com roteamento), reaproveitando os tokens.
3. **Acessibilidade (WCAG 2.2 AA):** rode axe (Storybook a11y / Playwright) e Lighthouse; corrija até passar.
4. **Validação visual:** o design-engineer abre o resultado no navegador, tira screenshots por breakpoint/estado e itera.
5. **Persistir + publicar:** tokens/componentes versionados no repo; Storybook e protótipos com **deploy em URL fixa** na Vercel (gate de login simples se o acesso precisar ser restrito).
6. **Registrar:** atualize a seção **Design System** do `CLAUDE.md` do produto com os caminhos e as URLs publicadas — é de onde Tech Lead e Devs puxam os padrões (e de onde o Tech Lead copia os caminhos para dentro dos cards de UI).
7. Se fizer parte de um milestone, entregue na branch `milestone/*`: testes/a11y e evidências por
   card; uma revisão consolidada, preview e validação do PM no fim. Para design isolado, use um
   milestone de um card. PR, merge em `main` e produção só seguem a aprovação funcional do PM.
