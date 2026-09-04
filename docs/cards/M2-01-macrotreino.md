# M2-01 · Macrotreino: gestão, rotação e treino sugerido

**Etiqueta:** `senior`

**Objetivo:** o personal cria e gerencia o programa do aluno com vários treinos (A/B/C/D),
e o aluno vê qual é o próximo da rotação. Substitui o macrotreino implícito do M1, que era
uma muleta para o schema.

**Milestone:** M2 · **Brief:** `docs/plan/M2-brief.md`

**Handoff obrigatório:** `docs/handoffs/prescricao.md`

**Checkpoint técnico:** **obrigatório.** Muda a cadeia `mesocycles → workouts` que o M1
inteiro consome, e é contrato que desbloqueia M2-05 e M2-06.

## Critérios de aceite

- [ ] `/painel/macrotreinos` — lista por aluno, com status e progresso de semanas
- [ ] Criar programa: nome, total de semanas, data de início, aluno
- [ ] Editar e **arquivar** programa; arquivar não apaga treino nem histórico
- [ ] Um aluno pode ter só um programa `ativo`; ativar outro arquiva o anterior
- [ ] O editor de treino passa a receber o programa em vez de pedir nome e semanas
- [ ] `/app` e `/app/treinos` mostram o programa ativo com semana atual de N
- [ ] **Treino sugerido:** o próximo da rotação por `position` que ainda não foi feito
      nesta semana (doc 05). Todos feitos → sugere o primeiro de novo
- [ ] `listarTreinosPorAluno` deixa de misturar treinos de programas diferentes
      (dívida do M1 registrada no brief)
- [ ] Estado vazio: aluno sem programa
- [ ] SQL: personal não lê nem escreve programa de aluno alheio; policies novas conferem o
      relacionamento no insert **e** no update

## Delta técnico

- **Semana atual** vem de `semanaAtual()` em `lib/domain/treino.ts`, que já usa
  `lib/domain/fuso.ts`. Não recalcular nem guardar em coluna.
- **"Feito nesta semana"** é semana do programa, não semana do calendário — deriva de
  `started_at`, mesma origem de `semanaAtual`.
- **Migração de dado:** nenhuma. O programa criado no M1 já é linha normal de `mesocycles`.
- Se acrescentar coluna (ex.: `archived_at`), migration reversível no padrão das 0007/0010.

## Fora do escopo

- Duplicar programa inteiro entre alunos — fica para depois do piloto.
- Definir dias da semana de cada treino (segunda = A) — a rotação do M2 é por ordem.
- Qualquer tela do aluno além de mostrar o programa e o sugerido.
