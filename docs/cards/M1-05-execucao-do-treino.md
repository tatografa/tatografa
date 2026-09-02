# M1-05 · Execução do treino, série por série

**Etiqueta:** `senior`

**Objetivo:** o aluno executa o treino na academia registrando carga e repetições a cada
série. É a tela mais importante do produto — o histórico inteiro nasce aqui, e é o único
momento em que o app é usado de pé, suado, com uma mão só.

**Milestone:** M1 — Fatia vertical

**Brief comum:** `docs/plan/M1-brief.md`

**Handoff obrigatório:** `docs/handoffs/prescricao.md`

**Checkpoint técnico:** **obrigatório.** Grava o dado que o produto inteiro existe para
guardar, sob rede instável. Perda silenciosa aqui é irrecuperável — não há de onde
reconstruir o que o aluno levantou.

---

## Critérios de aceite

- [ ] `/app/executar/[id]` em tema escuro, com barra de progresso por exercício concluído e
      cronômetro da sessão
- [ ] Série ativa com stepper de carga (passo de 2,5 kg) e de repetições, e botão de
      confirmar
- [ ] Exercício com `is_bodyweight` **não pede carga** — mostra "peso corporal"
- [ ] Três estados visuais distintos por série: ativa, concluída, pendente
- [ ] Timer de descanso **por timestamp**, não por contador: sobrevive à tela bloqueada.
      Opção de pular e de somar 30s
- [ ] Pular exercício e avançar para o próximo
- [ ] Concluir treino grava `finished_at` e `duration_seconds` reais
- [ ] Tela de conclusão com duração, número de séries e volume total (`volumeDaSessao`)
- [ ] **Sessão em andamento é retomada ao reabrir o app**, com as séries já confirmadas
- [ ] Iniciar treino com sessão pendente de outro treino oferece retomar ou descartar —
      o índice único parcial só permite uma sessão aberta por aluno
- [ ] Série confirmada sobrevive a falha de rede: fila local, reenvio, e nada perdido
- [ ] Reenviar a mesma série é upsert, não duplicata (`unique (session_id,
      workout_exercise_id, set_number)`)
- [ ] `npm run typecheck && npm run lint && npm run build` limpos
- [ ] SQL: aluno não grava série em sessão alheia; personal não grava série nenhuma

## Arquivos

- `app/(aluno)/app/executar/[id]/page.tsx` — **criar.**
- `app/(aluno)/app/executar/[id]/execucao.tsx` — **criar.** Componente cliente.
- `app/(aluno)/app/executar/[id]/fim/page.tsx` — **criar.** Conclusão.
- `app/(aluno)/app/executar/actions.ts` — **criar.** Iniciar, registrar série, concluir,
  descartar.
- `lib/domain/execucao.ts` — **criar.** Estado puro da execução: qual série é a ativa,
  progresso, quando o exercício acabou.
- `components/aluno/` — steppers e timer.

## Delta técnico

O que este card acrescenta além do brief e do handoff:

- **`session_sets` referencia `ExercicioPrescrito.id` (`workout_exercises.id`), nunca o id
  do catálogo.** Está no handoff, item 1. Errar aqui quebra a fk.
- **Estado local é a fonte durante o treino.** Confirmar série atualiza a tela na hora e
  enfileira a gravação; a rede é assíncrona. `localStorage` guarda a fila para o app
  sobreviver a recarregar a página no meio do treino.
- **Timer por timestamp.** Guardar o instante em que o descanso começou e derivar o
  restante, em vez de decrementar um contador — `setInterval` para quando o celular
  bloqueia a tela.
- **Upsert por `(session_id, workout_exercise_id, set_number)`.** Reenvio da fila não pode
  virar série duplicada.
- **Uma sessão aberta por aluno**, garantido por índice único parcial. Tratar o conflito
  como caso normal, não como erro inesperado.
- Tokens escuros: `--color-dark-*` em `app/globals.css`.

## Dependências

- M1-04 concluído (a moldura `(aluno)` e a navegação existem).
- Handoff `docs/handoffs/prescricao.md` lido.

## Como verificar

- `npm run typecheck && npm run lint && npm run build`
- **SQL, os casos de burla:** aluno gravando série em sessão de outro aluno; personal
  tentando gravar série; duas sessões abertas para o mesmo aluno; mesma série enviada duas
  vezes.
- **Navegador**, viewport de celular, com props fixas em rota descartável apagada antes do
  commit. Provar: confirmar série muda o estado; timer conta e sobrevive a alternar de aba;
  recarregar a página no meio retoma a sessão; concluir mostra o resumo certo.
- Screenshots: série ativa, série concluída, timer de descanso, peso corporal, conclusão.

## Fora do escopo

- Recordes pessoais na conclusão — M2 (o doc 05 prevê, mas depende de histórico acumulado).
- Referência "última vez: 60kg × 10" — M2.
- Foto do treino e post no feed — M3.
- Bottom sheet do menu (trocar exercício, ver histórico do exercício) — M2.
- Service worker e sincronização offline completa — Fase 4. Aqui é só fila em
  `localStorage` com reenvio.
