---
description: Planeja uma nova feature em um produto existente - o Tech Lead fatia em milestones testáveis e cards autossuficientes em docs/cards/.
argument-hint: <descrição da feature>
---

Nova feature para o produto atual.

Briefing do usuário:
$ARGUMENTS

Roteiro:

1. **Acione o `tech-lead`.** Ele segue o procedimento obrigatório dele: sincroniza com o GitHub
   (`git pull`), lê `CLAUDE.md` + `docs/LEARNINGS.md` + só o código relevante, esclarece dúvidas
   com o PM numa única rodada, e desenha a solução.
2. **Milestones + cards.** O Tech Lead fatia em **milestones testáveis pelo PM** (UI navegável ou
   suíte de API 100%), ordena **backend antes de frontend** (com handoff obrigatório entre eles) e
   cria um Brief do Milestone em `docs/plan/` e cards enxutos em `docs/cards/` — cada um com
   critérios, arquivos/delta, checkpoint de risco e etiqueta (`junior`/`pleno`/`senior`).
3. **Resumo para o PM** em linguagem de negócio: o que cada milestone entrega e como será
   validado; quais cards rodam automáticos (`junior`/`pleno`) e quais param para aprovação de
   plano (`senior`).
4. **Ofereça iniciar a esteira:** sugira rodar `/milestone` para executar o primeiro milestone de
   ponta a ponta (branch → implementação → revisão consolidada → preview → validação → merge).

> **Caveman:** se o modo caveman estiver ativo nesta sessão, inclua no prompt do `tech-lead` (passo
> 1): "modo caveman ativo: <nível> — comprima sua resposta e raciocínio de acordo." Ele não herda
> sozinho (lei do `~/.claude/CLAUDE.md`).
