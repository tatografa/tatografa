# M1-03 · Editor de treino no painel

**Etiqueta:** `senior`

**Objetivo:** o personal monta um treino escolhendo exercícios do catálogo, define séries,
repetições, descanso e ordem, e atribui a um aluno. Sem isso o aluno não tem o que executar
— é o card que desbloqueia o resto do milestone.

**Milestone:** M1 — Fatia vertical

**Brief comum:** `docs/plan/M1-brief.md`

**Checkpoint técnico:** **obrigatório antes de M1-04 e M1-05.** Este card define o contrato
de leitura da prescrição que as duas telas do aluno consomem, e mexe na cadeia
`mesocycles → workouts → workout_exercises` sob RLS. Contrato errado aqui custa refazer
dois cards.

---

## Critérios de aceite

- [ ] Buscar exercício por nome no catálogo, com filtro por grupo muscular e equipamento
- [ ] Adicionar exercício ao treino definindo séries, repetições (aceita faixa "8-10"),
      descanso em segundos, técnica e observação
- [ ] Reordenar exercícios e remover um já adicionado
- [ ] Salvar cria a cadeia `mesocycles → workouts → workout_exercises` para um aluno
- [ ] Editar um treino existente carrega a prescrição salva
- [ ] Duração estimada e total de séries aparecem no editor, vindos de `lib/domain/treino.ts`
- [ ] Estado vazio quando o personal não tem aluno: aponta para convidar
- [ ] Handoff escrito em `docs/handoffs/prescricao.md` — o contrato que M1-04 e M1-05 consomem
- [ ] `npm run typecheck && npm run lint && npm run build` limpos
- [ ] RLS verificada por SQL: personal de outra carteira não lê nem escreve este treino

## Arquivos

- `lib/queries/exercicios.ts` — **criar.** Busca no catálogo com filtro; resolve
  `exercise_source` para exibir catálogo e exercícios próprios numa lista só.
- `lib/queries/treinos.ts` — **criar.** Ler treino com exercícios prescritos (uma query,
  sem N+1), listar treinos do personal por aluno.
- `app/(personal)/painel/treinos/page.tsx` — **criar.** Lista de treinos por aluno.
- `app/(personal)/painel/treinos/novo/page.tsx` — **criar.** Editor.
- `app/(personal)/painel/treinos/[id]/page.tsx` — **criar.** Editor carregando existente.
- `app/(personal)/painel/treinos/actions.ts` — **criar.** Server Actions de salvar/excluir,
  com zod.
- `app/(personal)/painel/treinos/editor-de-treino.tsx` — **criar.** Componente cliente do
  editor.
- `components/ui/` — **estender** com o que faltar (ex.: `Select`, `Textarea`), exportando
  por `index.ts`.
- `docs/handoffs/prescricao.md` — **criar.**

## Delta técnico

O que este card acrescenta além do brief:

- **Macrotreino implícito.** O schema exige `mesocycle_id` em `workouts`, mas o M1 não tem
  tela de macrotreino (isso é M2). Ao salvar o primeiro treino de um aluno, criar um
  mesociclo padrão para ele e reusá-lo nos treinos seguintes. Nome e duração default ficam
  a critério do dev; registrar a escolha no handoff, porque M2 vai substituir isso por
  macrotreino de verdade.
- **`exercise_id` sem fk.** Ao gravar `workout_exercises`, gravar `exercise_source` junto,
  sempre. Ao ler, resolver as duas origens numa query só.
- **`reps_target` é texto.** Validar formato aceitando `"12"` e `"8-10"`; não converter
  para número.
- **Ordem.** `position` é a fonte da ordem, começando em 0 e sem buracos após remover.
- Tokens: `app/globals.css` (`@theme`) · Componentes: `components/ui/`

## Dependências

- M1-01 e M1-02 concluídos (existe personal com aluno para atribuir treino).

## Como verificar

- `npm run typecheck && npm run lint && npm run build`
- RLS e cadeia de gravação por SQL via MCP do Supabase, incluindo a tentativa de um segundo
  personal ler/escrever o treino alheio.
- Interface conferida no navegador com props fixas em rota descartável, apagada antes do
  commit. Screenshots: lista vazia, busca com filtro, treino montado, edição.

## Fora do escopo

- Reordenar por arraste (o card pede reordenar; setas ou botões bastam no M1).
- Macrotreino com rotação A/B/C/D, semana atual e treino sugerido — isso é M2.
- Exercícios próprios do personal (criar/editar) — M2. Aqui a lista já deve **ler** as duas
  origens, mas não há tela de cadastro.
- Duplicar treino e atribuir a vários alunos de uma vez — M2.
- Qualquer tela do aluno.
