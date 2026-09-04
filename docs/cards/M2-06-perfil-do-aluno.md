# M2-06 · Perfil do aluno no painel

**Etiqueta:** `pleno`

**Objetivo:** o personal abre um aluno e vê o que ele fez, sem precisar perguntar. É a tela
onde ele passa mais tempo depois do editor de treino (doc 06).

**Milestone:** M2 · **Brief:** `docs/plan/M2-brief.md`

**Checkpoint técnico:** nenhum, mas **paga uma dívida do M1**: a lista de alunos virou
cartão sem link porque `/painel/alunos/[id]` não existia. Este card cria a rota e restaura
o link.

## Critérios de aceite

- [ ] `/painel/alunos/[id]` com cabeçalho: nome, objetivo, nível, contato, status
- [ ] Programa ativo com progresso de semanas
- [ ] Histórico de sessões: data, treino, duração, volume — clicável para ver série a série
- [ ] Evolução por exercício: o mesmo gráfico do app do aluno, reusando o componente do
      M2-04. **Não** reimplementar
- [ ] A lista em `/painel` volta a ser link para cá
- [ ] Aluno de outro personal responde 404, sem vazar existência
- [ ] Estado vazio: aluno que nunca treinou
- [ ] SQL: personal lê o histórico do próprio aluno e não lê o de aluno alheio

## Delta técnico

- As policies já permitem: `workout_sessions_select` libera `private.trainer_of(student_id)`
  e `session_sets_select` passa por `can_read_session`. Nada de policy nova.
- Reusar `lib/queries/historico.ts` e o gráfico do M2-04 em vez de duplicar. Denominador e
  formatação saem de uma função só (LEARNINGS, 2026-09-02).
- Tela desktop: a densidade aqui é bem-vinda, ao contrário do app do aluno (doc 06).

## Fora do escopo

- Observações privadas do personal sobre o aluno, medidas e reavaliações — M3.
- Editar o perfil do aluno pelo painel; agendar sessão.
