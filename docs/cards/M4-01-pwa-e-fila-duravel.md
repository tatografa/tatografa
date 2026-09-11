# M4-01 · PWA: instalar, funcionar sem sinal e avisar o descanso

**Etiqueta:** `senior`

**Objetivo:** o app vira app. Instala com ícone, abre sem barra de navegador, e a fila de
séries para de depender de o aluno não limpar os dados do navegador.

**Milestone:** M4 · **Brief:** `docs/plan/M4-brief.md`

**Handoff obrigatório:** `docs/handoffs/execucao.md`

**Checkpoint técnico:** **obrigatório.** Service worker decide o que o navegador serve, e
serving errado de página autenticada mostra o treino de um aluno para outro. Checkpoint
antes de qualquer estratégia de cache que toque rota autenticada.

## Critérios de aceite

- [ ] `manifest.webmanifest` com nome, ícones (192, 512, maskable), cor de tema e
      `display: standalone`
- [ ] Instalável no iOS (Safari → Adicionar à Tela de Início) e no Android (Chrome)
- [ ] Aberto como app instalado, **não mostra a barra do navegador**
- [ ] Service worker registrado, com estratégia declarada por tipo de recurso
- [ ] **Nenhuma rota autenticada é servida do cache** — nem `/app`, nem `/painel`
- [ ] Asset estático (fonte, ícone, JS, CSS) é servido do cache e sobrevive a ficar offline
- [ ] A fila de séries sobrevive a fechar o app e reabrir sem sinal
- [ ] Alarme sonoro (ou vibração) no fim do descanso, **com a tela apagada**
- [ ] Atualização de versão não deixa o aluno preso numa versão velha: nova versão assume
      no próximo abrir, sem ação dele
- [ ] Offline de verdade: com o app aberto e sem rede, a execução continua registrando
- [ ] `npm run build && npm run typecheck && npm run lint` limpos (nessa ordem, após `rm -rf .next`)

## Delta técnico

- **A fila hoje vive em `localStorage`**, chaveada por `sessionId`
  (`usar-fila-de-series.ts`). O limite declarado no handoff é que limpar os dados do
  navegador apaga o que não foi enviado. Avaliar migrar para IndexedDB, que não é apagado
  pelos mesmos gestos — e manter a chave por sessão.
- **O timer é por timestamp, não por contador** (handoff). O alarme não pode reintroduzir
  contador: agenda-se o instante, e o service worker (ou a Notifications API) dispara.
- **Next 16 tem caminho próprio para PWA.** Ler `node_modules/next/dist/docs/` antes de
  escolher biblioteca — `next-pwa` e similares podem não acompanhar esta versão.
- iOS limita notificação em PWA: o alarme pode precisar de vibração + som pela página,
  não notificação de sistema. Declarar o que não der.

## Fora do escopo

- Sincronização em background (Background Sync API) — o reenvio ao voltar a ter rede já
  existe e funciona com o app aberto.
- Push notification de qualquer tipo.
- Modo offline para o painel do personal: ele usa computador, sentado.
