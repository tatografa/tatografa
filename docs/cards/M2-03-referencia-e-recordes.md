# M2-03 · Referência histórica na execução e recordes na conclusão

**Etiqueta:** `pleno`

**Objetivo:** o aluno vê com quanto peso fez esse exercício da última vez, e é avisado
quando bate um recorde. É o momento em que o histórico deixa de ser arquivo e começa a
servir para alguma coisa.

**Milestone:** M2 · **Brief:** `docs/plan/M2-brief.md`

**Handoff obrigatório:** `docs/handoffs/execucao.md`

**Checkpoint técnico:** nenhum. Card de leitura; não altera schema nem policy.

## Critérios de aceite

- [ ] Na execução, cada exercício mostra a pílula "última vez: 60kg × 10" (doc 05)
- [ ] A referência vem da **última sessão concluída** com aquele exercício, e usa a série
      de maior carga daquela sessão
- [ ] Exercício nunca feito não mostra pílula nenhuma — nada de "0kg" nem "—"
- [ ] Exercício de peso corporal mostra reps, sem carga
- [ ] Na conclusão, recordes batidos na sessão aparecem destacados: exercício,
      carga anterior → nova carga (doc 05)
- [ ] **Sem recorde, nada aparece.** O doc 05 é explícito: "não invente celebração vazia"
- [ ] Primeira vez num exercício não conta como recorde
- [ ] `npm run build && npm run typecheck && npm run lint` limpos (nessa ordem, após `rm -rf .next`)

## Delta técnico

**Definição de recorde — decisão do PM, e ela contraria o doc 03.**

O doc 03 define recorde como "maior carga com pelo menos as reps alvo". O Otávio decidiu
o contrário: **recorde é a maior carga levantada naquele exercício, independente das
repetições**.

Motivo dele: é o que o aluno entende como recorde sem precisar de explicação.
Limite aceito, e registrado para não ser "corrigido" por engano: premia quem reduz
repetição para pôr mais peso, e a curva de evolução por carga fica otimista em relação ao
esforço real. Se no piloto isso aparecer como problema, a mudança é numa função pura.

- Série **pulada não conta** para referência nem para recorde.
- `load_kg` chega como **string** (`numeric` no Postgres). `Number()` antes de comparar,
  senão `"9"` > `"80"` na comparação de texto.
- Cálculo em `lib/domain/`, função pura. Leitura em lote, sem N+1: uma consulta para o
  histórico de todos os exercícios do treino, não uma por exercício.

## Fora do escopo

- Gráfico e planilha de progresso — é o M2-04.
- Recorde de volume, de repetições ou de sequência.
- Notificação ou compartilhamento do recorde.
