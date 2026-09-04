# Handoff · Macrotreino, rotação e treino sugerido

> Contrato escrito no card **M2-01 — Macrotreino: gestão, rotação e treino
> sugerido**. É o que os cards M2-05 (home completa) e M2-06 (perfil do aluno)
> consomem. Substitui a seção "Macrotreino: o personal nomeia no primeiro
> treino" de `prescricao.md`, que era muleta do M1.

## Onde está

| O quê | Arquivo |
|---|---|
| Janela da semana e escolha do sugerido | `lib/domain/rotacao.ts` |
| Semana para exibir ("Semana 3 de 8") | `lib/domain/treino.ts` → `semanaAtual` |
| Programas do personal | `lib/queries/macrotreinos.ts` |
| Agenda do aluno, já com o sugerido | `lib/queries/aluno.ts` → `lerAgendaDoAluno` |
| Treinos do programa ativo, por aluno | `lib/queries/treinos.ts` → `listarTreinosPorAluno` |
| Criar, editar, arquivar, ativar | `app/(personal)/painel/macrotreinos/actions.ts` |
| Textos das confirmações | `app/(personal)/painel/macrotreinos/textos.ts` |
| Migrations | `supabase/migrations/0011_*`, `0012_*` |

## O que `lerAgendaDoAluno(alunoId)` devolve

```ts
type AgendaDoAluno = {
  macrotreino: { id; name; total_weeks; started_at } | null;  // só o ATIVO
  treinos: TreinoDaAgenda[];       // ordenados por `position`
  sugerido: TreinoDaAgenda | null; // a rotação já resolvida
};
```

**Use `sugerido`, não recalcule.** A home e a lista de treinos mostram a mesma
sugestão; dois cálculos do mesmo número divergem na tela (foi o que aconteceu
com o denominador do histórico, 2026-09-02). `proximoTreino()`, do M1, não
existe mais.

`macrotreino` nulo significa **aluno sem programa ativo** — nunca montado ou
arquivado. É estado vazio, não erro.

## Como o sugerido é escolhido

O primeiro treino, por `position`, que **ainda não foi concluído nesta semana
do programa**. Todos feitos → recomeça no primeiro. Treino sem exercício
prescrito é pulado, inclusive ao recomeçar.

| Situação | Sugerido |
|---|---|
| A/B/C, fez A e B | C |
| Fez A, B e C | A |
| Fez A duas vezes, nada mais | B — "feito" é sim ou não, repetir não avança a fila |
| Nada feito | A |
| Nenhum treino tem exercício | `null` |

### A semana é do programa, não do calendário

A fronteira sai de `started_at`. Programa que começou numa quarta tem a semana 1
de quarta a terça. Decisão do PM: o número que a tela mostra e a rotação saem da
mesma conta, então nunca discordam.

- `janelaDaSemana(started_at, quando?)` devolve `{ de, ate }` — dias de
  calendário, `ate` **exclusivo**.
- `semanaCorridaDoPrograma` **não tem teto**, de propósito. `semanaAtual` trava
  em `total_weeks` porque "Semana 9 de 8" não é rótulo; a janela precisa
  continuar andando, senão o aluno que treina depois do prazo veria o treino A
  sugerido para sempre.
- Sessão **em andamento não conta**. Um treino que o aluno abriu e abandonou
  continua na fila.
- Sessão anterior ao `started_at` não conta.

## `treinos_feitos_na_semana(p_student_id, p_de, p_ate)`

RPC da migration 0011, `security invoker` (o RLS vale). Devolve
`(workout_id, total)` das sessões **concluídas** no intervalo.

A conversão de fuso acontece no Postgres, não no TypeScript:
`(started_at at time zone 'America/Sao_Paulo')::date`. `started_at` é
`timestamptz` e comparar em UTC jogaria a sessão das 21h para o dia seguinte —
o horário em que mais se treina, e o mesmo defeito que a `semanaAtual` já teve.

## Status do programa

`ativo` e `arquivado` são os únicos usados. `concluido` existe no enum desde a
0001 e continua sem uso: o programa **não** se fecha sozinho ao passar do total
de semanas — fechar sem ninguém decidir deixaria o aluno sem treino.

- **Arquivar é mudar o status.** Nenhum treino, prescrição ou série é tocado.
- **Só um ativo por aluno**, garantido pelo índice parcial
  `mesocycles_um_ativo_por_aluno_idx`. Não é convenção de código.
- **Ativar troca na mesma transação** (`ativar_macrotreino`, migration 0012):
  arquiva o anterior e ativa este. Em dois passos, uma falha no meio deixaria o
  aluno sem programa nenhum.
- **O programa novo nasce `arquivado`** e só então é ativado pela RPC. Nascer
  ativo esbarraria no índice, e arquivar o antigo antes de ter o novo pronto
  abriria a mesma janela sem treino.
- **Programa com sessão executada não se apaga** (`mesocycles_delete`): o delete
  levaria `workouts` → `workout_exercises` → `session_sets` por cascata. Sem
  histórico, continua apagável — lixo criado por engano não fica preso.
- **Sessão em andamento sobrevive ao arquivamento.** O aluno termina e salva.

## O que mudou para quem já consumia isto

1. **`listarTreinosPorAluno` devolve só o programa ativo** (dívida nº 2 do
   brief do M2). Antes trazia todos os mesociclos sob o nome do ativo.
2. **`macrotreinosAtivos()` não existe mais.** Quem precisa do programa usa
   `lerMacrotreino(id)` ou `listarProgramasPorAluno()`.
3. **O editor de treino recebe o programa pela URL**
   (`/painel/treinos/novo?programa=<id>`) e não pergunta mais aluno, nome do
   programa nem semanas. A Server Action confere o dono do programa de novo:
   URL é palpite fácil.
4. **Treino novo só entra em programa ativo.** Editar treino de programa
   arquivado continua valendo.

## Segurança verificada (SQL, com dois personais)

Os dois lados de cada regra — ataque bloqueado **e** uso legítimo intacto.

- Personal de outra carteira: não lê programa nem treino alheio (0 linhas), não
  renomeia, não arquiva, não troca o `trainer_id` para si, não apaga (0 linhas
  afetadas em cada um), e não cria programa para aluno alheio (recusado pelo
  RLS). A RPC `ativar_macrotreino` responde "não encontrado" — mesma regra de
  `lerTreino`: id inexistente e sem permissão são a mesma coisa para quem olha.
- `treinos_feitos_na_semana` de aluno alheio: 0 linhas.
- O índice recusa o segundo programa ativo (`unique_violation`).
- A troca funciona nos dois sentidos e deixa exatamente 1 ativo.
- Apagar programa com histórico: 0 linhas; as 5 sessões sobreviveram. Sem
  histórico: apagou.
- Depois de arquivar: 3 treinos e 5 sessões continuam no banco, e o aluno
  concluiu normalmente a sessão que estava aberta.
- Rotação nas datas de virada: sessão de **21h da terça** (último dia da semana
  1) entra na semana 1 e **não** na 2; a da véspera do `started_at` cai na
  janela anterior; a em andamento não aparece.

## Lições que valem para os próximos cards

- **Função exportada de módulo `"use client"` não pode ser chamada pelo
  servidor** — só renderizada como componente. Texto ou regra compartilhada
  entre um diálogo cliente e uma página servidor vive num **módulo neutro**
  (aqui, `textos.ts`), senão vira duas cópias da mesma frase.
- **Contagem que decide o que a tela mostra tem duas versões: a com teto e a
  sem.** `semanaAtual` (rótulo) e `semanaCorridaDoPrograma` (janela) parecem a
  mesma função e não são. Travar a janela no total congelaria a rotação.
- **Ordem de escrita é decisão de produto quando há índice no meio.** Criar
  arquivado e ativar depois não é rodeio: é o que garante que o aluno nunca
  fique com zero programas por causa de uma falha entre dois passos.
- **Confirmação destrutiva cuja consequência acontece na tela de outra pessoa
  precisa dizer isso.** O personal arquiva e não vê nada mudar; quem abre o app
  sem treino é o aluno.
