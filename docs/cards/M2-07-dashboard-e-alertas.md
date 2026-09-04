# M2-07 · Dashboard do personal com alertas de inatividade

**Etiqueta:** `pleno`

**Objetivo:** ao abrir o painel, o personal vê quem parou de treinar. Doc 06: "essa é a
lista mais útil da página — não a esconda embaixo".

**Milestone:** M2 · **Brief:** `docs/plan/M2-brief.md`

**Checkpoint técnico:** acrescenta coluna em `trainers`. Migration reversível no padrão das
0007/0010; sem policy nova (o personal já escreve a própria linha).

## Critérios de aceite

- [ ] Bloco **"Alunos que precisam de atenção"** no topo do `/painel`, acima da lista geral
- [ ] Entra quem não conclui sessão há mais de N dias, e quem nunca treinou desde que aceitou
      o convite
- [ ] Cada linha diz há quantos dias, e leva ao perfil do aluno
- [ ] Indicadores do topo: alunos ativos, treinos executados na semana, aderência média
- [ ] **N é configurável pelo personal**, padrão **7 dias** — decisão do PM
- [ ] `/painel/configuracoes` com o ajuste, em modo leitura com botão "Editar" (doc 06)
- [ ] Ninguém inativo: o bloco não aparece, em vez de mostrar lista vazia
- [ ] Personal sem aluno nenhum: segue vendo o estado vazio atual
- [ ] SQL: o ajuste de um personal não afeta o de outro

## Delta técnico

- **Coluna nova:** `trainers.dias_para_alerta`, inteiro, default 7, com `check` entre 1 e 90.
  Default no banco garante que personal antigo não fique com nulo.
- **Aderência** = sessões concluídas ÷ treinos prescritos na semana, no fuso do produto.
  Função pura em `lib/domain/`; nunca coluna.
- Contagens agregadas no banco. Uma consulta em lote para todos os alunos, não uma por
  aluno (`lib/queries/alunos.ts` já faz assim para a última sessão).
- "Há N dias" no fuso do produto (`lib/domain/fuso.ts`).

## Fora do escopo

- Notificar o aluno inativo por e-mail ou push — Fase 4.
- Alerta de reavaliação vencida (doc 06 prevê) — depende de `assessments`, que é M3.
- Agenda e atividade recente no dashboard.
