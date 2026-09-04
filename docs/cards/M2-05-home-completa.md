# M2-05 · Home do aluno completa

**Etiqueta:** `pleno`

**Objetivo:** a home passa a responder "como eu estou indo", não só "o que treino hoje".

**Milestone:** M2 · **Brief:** `docs/plan/M2-brief.md`

**Checkpoint técnico:** nenhum.

## Critérios de aceite

- [ ] Dois indicadores no topo (doc 05): "🔥 N / DIAS SEGUIDOS" e "N / SESSÕES TOTAIS"
- [ ] **Sequência** = dias consecutivos com ao menos uma sessão concluída (doc 03), contada
      no fuso do produto via `lib/domain/fuso.ts`
- [ ] Treinar hoje **não quebra** a sequência de ontem; um dia sem treinar quebra
- [ ] Card do próximo treino mostra o **sugerido pela rotação** (vem do M2-01)
- [ ] Link "Fazer outro treino" leva à lista, sempre — não só quando há mais de um treino
      (dívida apontada na revisão do M1)
- [ ] Aluno novo, sem sessão: indicadores em zero sem parecer erro
- [ ] Sequência e total saem de função pura em `lib/domain/`, contados no banco por
      agregação — nunca trazendo linhas para contar em memória

## Delta técnico

- `semanaAtual` e o card do macrotreino já existem; este card acrescenta os indicadores e
  troca o próximo treino pelo sugerido.
- **Sequência é a conta mais fácil de errar do milestone:** virada de dia é no fuso do
  produto, não no do servidor (LEARNINGS, 2026-09-02). Duas sessões no mesmo dia contam
  como um dia.

## Fora do escopo

- Reavaliação disponível no card condicional (doc 05, bloco 5) — é M3.
- Recorde ou referência na home — M2-03 põe na execução.
