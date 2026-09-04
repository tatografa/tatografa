# M2-02 · Exercícios próprios do personal

**Etiqueta:** `pleno`

**Objetivo:** o personal cadastra os exercícios que usa e que não estão no catálogo base.
Sem isso ele monta treino "do vazio" quando a academia tem aparelho diferente.

**Milestone:** M2 · **Brief:** `docs/plan/M2-brief.md`

**Checkpoint técnico:** nenhum. A tabela `exercises` e as policies existem desde a
migration 0001; este card só dá tela a elas.

## Critérios de aceite

- [ ] `/painel/exercicios` — catálogo base e exercícios próprios numa lista só, com
      marcador visual distinguindo os próprios (doc 06)
- [ ] Filtro por grupo muscular e equipamento; busca por nome sem acento
- [ ] Criar exercício: nome, grupo, equipamento, peso corporal, unilateral, descanso padrão
- [ ] Editar e excluir os próprios; catálogo base é só leitura
- [ ] **Excluir exercício usado numa prescrição avisa antes** — `workout_exercises` não tem
      fk para `exercises`, então a linha vira órfã e o handoff diz que `lerTreino` a pula
- [ ] Nome duplicado no mesmo personal é recusado com mensagem (há unique no banco)
- [ ] O editor de treino (M1-03) passa a achar os próprios na busca — já lê as duas origens
- [ ] SQL: personal não lê nem escreve exercício de outro personal

## Delta técnico

- `lib/queries/exercicios.ts` já resolve as duas origens e já filtra. Estender ali.
- `exercise_source` é `custom` para estes; `catalog` para os 117 do catálogo.
- Excluir exercício **não** apaga `workout_exercises` (não há fk). O aviso é de produto.

## Fora do escopo

- Importar exercício de planilha, foto ou vídeo do exercício, compartilhar entre personais.
