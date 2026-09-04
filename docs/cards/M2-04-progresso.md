# M2-04 · Progresso do aluno: planilha e gráfico

**Etiqueta:** `senior`

**Objetivo:** o aluno vê a própria evolução por exercício. É o valor central do produto
declarado no doc 01 — o resto existe para alimentar esta tela.

**Milestone:** M2 · **Brief:** `docs/plan/M2-brief.md`

**Handoff obrigatório:** `docs/handoffs/execucao.md`

**Checkpoint técnico:** nenhum risco de dado, mas é a tela que mais depende de leitura
correta do histórico. Número errado aqui mente sobre a evolução do aluno e ninguém percebe.

## Critérios de aceite

- [ ] `/app/progresso` com dois modos alternados por toggle: **Planilha** e **Gráfico** (doc 05)
- [ ] Planilha: acordeão por exercício. Fechado mostra nome + última carga; aberto mostra
      as **3 sessões mais recentes primeiro**, com série / carga / reps
- [ ] Gráfico: lista de exercícios, cada um com prévia; detalhe com linha de carga máxima
      por sessão, **de borda a borda**, datas na horizontal, mais recente primeiro
- [ ] Filtro de intervalo: 6 sessões / 12 sessões / Total
- [ ] Ponto clicável revela carga e reps de cada série daquela sessão
- [ ] Aba **Progresso** da bottom nav deixa de estar desabilitada
- [ ] Estado vazio: aluno sem histórico
- [ ] Exercício de peso corporal aparece na planilha (reps), e fica fora do gráfico de carga
- [ ] SQL: aluno lê só o próprio progresso

## Delta técnico

- **Gráfico sem biblioteca** — SVG à mão com os tokens do projeto. Decisão registrada no
  brief do milestone; não reabrir por card. Um gráfico de linha com pontos clicáveis não
  paga ~100 kB de dependência, e biblioteca genérica atrapalha o que o doc 05 pede
  (borda a borda, datas horizontais, mais recente primeiro).
- **SVG acessível:** `role="img"` e um `<title>`/`aria-label` que diga a tendência em
  palavras. Ponto clicável precisa de alvo ≥ 44px e foco visível por teclado.
- **Série histórica** = uma entrada por sessão, com a **carga máxima daquela sessão**
  (doc 03, `exerciseProgress`). Cálculo em `lib/domain/`, função pura.
- `load_kg` é string; `Number()` antes de qualquer comparação ou escala.
- Série pulada fora dos dois modos.
- Sessão em andamento fora dos dois modos.
- Leitura em lote. Um aluno com 3 meses de treino tem milhares de `session_sets`: paginar
  explicitamente por `range`, como `lib/queries/historico.ts` já faz.

## Fora do escopo

- Comparar dois exercícios no mesmo gráfico; exportar; gráfico de volume ou de frequência.
- Progresso visto pelo personal — é o M2-06.
