# <NOME DO PRODUTO>

> CLAUDE.md do produto — gerado pelo Maverick Solo Builder. Preencha os campos `<...>`.
> **Mantenha este arquivo curto (≤ ~150 linhas):** ele é lido em toda sessão e em todo card.
> Estratégia longa vive em `docs/` e só é lida quando um card apontar para ela.

## Visão
<O que é o produto e qual problema de negócio resolve.>

## Git e ambientes
- **Repositório (GitHub):** `<URL do repo>`
- **Protocolo:** `main` = versão aprovada; `milestone/<id>-<slug>` = trabalho e backup remoto.
  Sincronizar antes do milestone; push da branch no início e antes da homologação; PR/merge/push
  em `main` só depois da aprovação funcional do PM. Nada é editado pela interface web.
- **Preview/homologação:** `<Vercel URL ou procedimento; branch que dispara preview>`.
- **Produção:** `<URL; somente main dispara deploy>`.

## Stack
- Perfil: `<web-nextjs | backend-node | mobile-expo>`
- <Detalhes específicos: libs principais, serviços externos, banco...>

## Milestones
> Atualizado pelo Tech Lead. Todo milestone é validável pelo PM (UI ou suíte de API 100%).

| # | Nome | Entrega (linguagem de negócio) | Como o PM valida | Status |
|---|---|---|---|---|
| M1 | <nome> | <o que fica testável> | <roteiro UI / comando da suíte de API> | <planejado/em andamento/validado> |

## Design System
> **Fonte de verdade do design.** Tech Lead copia estes caminhos para dentro de todo card de UI.
> Nada de cor/espaçamento "mágico" — tudo deriva dos tokens.
- **Tokens (fonte de verdade):** `<caminho dos tokens>` — formato **DTCG** (W3C Design Tokens).
  _Default `design/tokens.json` na raiz; em **monorepo**, um pacote como `packages/design-tokens/`.
  **Este caminho aqui é a referência oficial.**_
- **Build multi-plataforma:** `<comando, ex.: pnpm tokens:build>` (Style Dictionary) → variáveis
  CSS (web), tema NativeWind (mobile) e JSON (notificações/e-mail) num `build/` versionado.
- **Componentes:** `<caminho>` (shadcn/Radix + Tailwind), catalogados no Storybook.
- **Catálogo navegável (Storybook):** local `pnpm storybook` · publicado em `<URL Vercel>`.
- **Protótipos navegáveis:** `<URL Vercel do protótipo>`.
- **Acesso de stakeholders:** `<como logar — ex.: gate de login simples por usuário/senha>`.

## Convenções de código
<Padrões a seguir: estrutura de pastas, nomenclatura, estilo. O Tech Lead promove para cá as
lições recorrentes do docs/LEARNINGS.md a cada milestone.>

## Memória e handoffs
- **Aprendizados:** `docs/LEARNINGS.md` — dev lê; Tech Lead atualiza uma vez no fim do milestone.
- **Handoffs de API (backend → frontend):** `docs/handoffs/<feature>.md` — contrato que o dev de
  frontend segue para plugar as telas.

## Comandos
- Instalar: `<...>`
- Dev: `<...>`
- Testes: `<...>`
- Testes de API (validação de milestone sem UI): `<...>`
- Build: `<...>`
- Deploy: `<...>`

## Verificação
<Como provar que uma mudança funciona, sem ler código — screenshot, teste, request de exemplo.>

## Cards
- Cards: `docs/cards/` · Milestones: `docs/plan/milestones.md` · Pendências não-dev: `docs/plan/pendencias.md`
- Etiquetas de complexidade: `junior`, `pleno`, `senior` · Milestone em todo card
- Cada milestone também tem `docs/plan/<milestone>-brief.md`: contexto comum, contratos e comandos.

## Decisões de arquitetura
<Registre aqui decisões técnicas duradouras, com data e motivo.>
