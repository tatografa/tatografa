# M1-06 · Histórico de sessões do aluno

**Etiqueta:** `pleno`

**Objetivo:** o aluno vê o que já treinou, série por série. É a última peça da fatia
vertical — sem ela, o registro que a execução grava não tem para onde aparecer, e o valor
central do produto ("o aluno vê a própria evolução") fica invisível.

**Milestone:** M1 — Fatia vertical

**Brief comum:** `docs/plan/M1-brief.md`

**Handoffs obrigatórios:** `docs/handoffs/execucao.md` (o que a execução grava) e
`docs/handoffs/prescricao.md` (nomes dos exercícios). Leia os dois antes de codar.

**Checkpoint técnico:** nenhum. Card de leitura; não altera schema nem policy. A revisão
acontece no fechamento do milestone.

---

## Critérios de aceite

- [ ] `/app/historico` — lista das sessões concluídas, da mais recente para a mais antiga
- [ ] Cada linha mostra data, nome do treino, duração real e volume total
- [ ] `/app/historico/[sessaoId]` — detalhe com os exercícios e, em cada um, as séries
      com carga e repetições
- [ ] Série pulada aparece como pulada, não como série feita com valores vazios
- [ ] Exercício de peso corporal mostra "peso corporal", não "0 kg"
- [ ] Sessão em andamento **não** aparece no histórico (handoff `execucao.md`, item 4)
- [ ] Treino incompleto é distinguível de completo: mostra as séries feitas contra as
      prescritas
- [ ] Estado vazio quando o aluno nunca treinou: convida a começar, sem parecer erro
- [ ] Link "Ver histórico completo" no rodapé de `/app/treinos` leva para cá
- [ ] Sessão de outro aluno responde 404, sem vazar existência
- [ ] `npm run typecheck && npm run lint && npm run build` limpos

## Arquivos

- `app/(aluno)/app/historico/page.tsx` — **criar.** Lista.
- `app/(aluno)/app/historico/[sessaoId]/page.tsx` — **criar.** Detalhe.
- `lib/queries/historico.ts` — **criar.** Leitura das sessões concluídas e do detalhe.
- `lib/domain/historico.ts` — **criar** se precisar de regra pura (agrupar séries por
  exercício, contar feitas contra prescritas). Nada de cálculo em componente.
- `components/aluno/` — cartão de sessão e lista de séries, se render justificar componente.
- `app/(aluno)/app/treinos/page.tsx` — **alterar.** Acrescentar o link do rodapé.

## Delta técnico

Tudo abaixo já está no handoff `execucao.md`; repetido aqui porque errar qualquer um
produz número errado na tela, e número errado no histórico é pior que tela quebrada:

- **`load_kg` chega como string** (é `numeric` no Postgres). Converter com `Number()` ou
  o volume vira concatenação de texto.
- **Filtrar `skipped`** ao contar séries feitas, senão treino abandonado no meio conta
  como completo.
- **Excluir sessão com `finished_at` nulo** — é o treino em andamento, não histórico.
- **`duration_seconds` é a duração real**, gravada no fechamento com o relógio do servidor.
  Não recalcular a partir de `completed_at`.
- **`set_number` é a posição prescrita, não contador.** A série 3 é a terceira mesmo que a
  2 tenha sido pulada.
- **Volume** sai de `volumeDaSessao` em `lib/domain/treino.ts`. Não reimplementar.
- **Nada de N+1:** buscar sessões, séries e exercícios em lote e agrupar em memória.
- Tokens: `app/globals.css` · Tema **claro** (o escuro é só da execução).

## Dependências

- M1-04 (moldura `(aluno)` e bottom nav) e M1-05 (o dado existe) concluídos.

## Como verificar

- `npm run typecheck && npm run lint && npm run build` — nessa ordem, com `rm -rf .next &&
  npm run build` antes se tiver apagado rota (`PageProps` é tipo gerado).
- SQL via MCP: aluno lê o próprio histórico e não lê o de outro aluno; sessão em andamento
  fica fora da listagem.
- Navegador, viewport 390×844, rota descartável **apagada antes do commit**. Screenshots:
  lista com sessões, lista vazia, detalhe com série normal, série pulada e peso corporal.
- Conferir se a fixture passaria pelo caminho real do usuário antes de tratá-la como prova.

## Fora do escopo

- Gráfico de evolução por exercício e planilha em acordeão — é a tela `/app/progresso`, M2.
- Recordes pessoais e comparação com a última vez — M2.
- Histórico visto pelo personal no painel do aluno — M2.
- Filtro por período, busca e exportação.
