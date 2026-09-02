# M1-04 · App do aluno: moldura, home e detalhe do treino

**Etiqueta:** `pleno`

**Objetivo:** o aluno abre o app no celular e vê o que tem para treinar hoje. É a moldura
onde a execução (M1-05) vai morar — sem ela o aluno entra pelo convite e não tem para onde ir.

**Milestone:** M1 — Fatia vertical

**Brief comum:** `docs/plan/M1-brief.md`

**Handoff obrigatório:** `docs/handoffs/prescricao.md` — leia antes de codar. É o contrato
que define o que `lerTreino` devolve e por que `position` é índice confiável.

**Checkpoint técnico:** nenhum. Card de leitura; não altera schema nem policy. A revisão
acontece no fechamento do milestone.

---

## Critérios de aceite

- [ ] Route group `(aluno)` com layout mobile-first, largura máxima ~440px centralizada
- [ ] Bottom nav fixa com as 4 abas do doc 05 — Treinar · Progresso · Feed · Perfil.
      No M1 só **Treinar** navega; as outras aparecem desabilitadas, sem link morto
- [ ] Alvo de toque ≥ 44px e `safe-area-inset-bottom` respeitado na bottom nav
- [ ] `/app` — home com saudação por horário, macrotreino ativo (nome, semana atual de N),
      e o card do próximo treino com nome, contagem de exercícios, duração estimada e
      botão "Iniciar treino"
- [ ] `/app/treinos` — lista dos treinos do macrotreino ativo, com contagem e duração
- [ ] `/app/treinos/[id]` — detalhe com as três métricas do doc 05 (exercícios, duração,
      séries) e a lista de exercícios prescritos com `sets × reps · rest`
- [ ] Selo de técnica aparece quando `technique` não é nulo
- [ ] Estado vazio quando o aluno não tem treino: diz que o personal ainda não montou,
      sem parecer erro
- [ ] `lerTreino` de treino alheio devolve `null` → a tela responde 404, não vaza existência
- [ ] `npm run typecheck && npm run lint && npm run build` limpos

## Arquivos

- `app/(aluno)/layout.tsx` — **criar.** Moldura mobile + `requireStudent()`.
- `app/(aluno)/app/page.tsx` — **criar.** Home.
- `app/(aluno)/app/treinos/page.tsx` — **criar.** Lista de treinos.
- `app/(aluno)/app/treinos/[id]/page.tsx` — **criar.** Detalhe.
- `components/aluno/bottom-nav.tsx` — **criar.**
- `lib/queries/aluno.ts` — **criar.** Leitura do lado do aluno: macrotreino ativo, treinos
  do macrotreino, próximo treino sugerido.

## Delta técnico

- **Reuse, não reescreva.** `lerTreino` já existe em `lib/queries/treinos.ts` e é legível
  pelo aluno sob as policies atuais. Se precisar de algo que ele não devolve, estenda ali
  em vez de criar uma segunda leitura.
- **Próximo treino no M1** é simplesmente o de menor `position` no macrotreino ativo.
  Rotação e "sugerido pela semana" são M2 — não invente.
- **Semana atual** sai de `semanaAtual()` em `lib/domain/treino.ts`, derivada de
  `started_at`. Nunca guardar em coluna.
- **Tema claro na home e no detalhe.** O tema escuro é só da execução (M1-05).
- Tokens: `app/globals.css` (`@theme`) · Componentes: `components/ui/`

## Dependências

- M1-03 concluído. O handoff `docs/handoffs/prescricao.md` é leitura obrigatória.

## Como verificar

- `npm run typecheck && npm run lint && npm run build`
- Interface no navegador em viewport de celular (390×844), com props fixas em rota
  descartável **apagada antes do commit**. Screenshots: home com treino, home sem treino
  (estado vazio), lista, detalhe.
- SQL: confirmar que o aluno lê o próprio treino e não lê o de aluno de outro personal.

## Fora do escopo

- A tela de execução — é o M1-05.
- Abas Progresso, Feed e Perfil: aparecem na nav, desabilitadas. Nada de página.
- Streak e total de sessões na home (o doc 05 prevê, mas dependem de histórico) — M2.
- Referência histórica "última vez: 60kg × 10" — M2.
- Reavaliação, PWA, service worker.
