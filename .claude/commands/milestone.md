---
description: Executa um milestone em uma branch única — testes por card, revisão consolidada, preview e validação do PM antes de merge/deploy.
argument-hint: <nome/número do milestone, ou vazio para o milestone em andamento>
---

Execute a esteira do Maverick Solo Builder para o milestone: $ARGUMENTS
(se vazio, o milestone em andamento registrado no `CLAUDE.md` do produto / `docs/plan/milestones.md`)

Você é o **orquestrador da esteira**. Siga a máquina de estados sem inventar passos:

1. **Sincronize e prepare o lote.** `git checkout main && git pull`; leia o Brief do Milestone,
   liste cards restantes na ordem de dependência e crie `milestone/<id>-<slug>`. Faça o primeiro
   push da branch como backup, sem abrir PR.

2. **Implemente os cards.** Para cada card dependente:
   a. `junior`/`pleno` seguem automaticamente; `senior` apresenta o plano curto e para pela
      aprovação do PM.
   b. O dev implementa, faz self-review, roda somente os testes/lint definidos no card, registra
      evidência local e faz commit na branch do milestone. A resposta ao orquestrador é curta:
      `feito | arquivos | testes | bloqueio/lição`.
   c. Marque o card como implementado. Não crie PR, não faça merge e não chame reviewer ainda.
   d. **Checkpoint obrigatório:** se o card tocar schema/migração, auth, pagamento, PII/dado
      regulado, integração externa, arquitetura ou contrato que desbloqueia outro card, acione
      `code-reviewer` antes do dependente. Achado bloqueante/importante volta ao mesmo dev; duas
      falhas → pare e escale ao PM.
   e. Paralelize somente cards sem dependência e sem arquivos/contratos em comum, em worktrees
      isolados; se houver dúvida, execute em sequência.

3. **Feche tecnicamente o milestone.** Rode testes integrados, build/lint/typecheck e E2E conforme
   o brief; reúna uma evidência suficiente por fluxo. Acione `code-reviewer` uma vez para o diff
   completo contra `main`, o brief e todos os cards. Corrija achados 🔴/🟡 na mesma branch e repita
   somente a verificação afetada. Faça push da branch quando estiver pronta para homologação.

4. **Homologue com o PM.** Para UI, gere/aguarde preview da Vercel da branch `milestone/*` e
   entregue URL + roteiro em linguagem de negócio. Sem UI, entregue relatório da suíte de API
   100% verde. Se reprovar, corrija na mesma branch e repita testes/revisão proporcional ao risco.

5. **Publique somente após aprovação explícita.** Crie uma PR consolidada, squash-merge em `main`,
   `git push` e confirme o deploy de produção. Então marque cards como Done, acione o Tech Lead
   para curar `LEARNINGS.md` e atualizar status do milestone em um único commit/push.

6. **Resuma ao PM:** entrega, URL/roteiro, evidências, PR consolidada e próximo milestone.

> **Caveman:** se o modo caveman estiver ativo nesta sessão, inclua no prompt de CADA subagente
> acionado (passos 2–5: `dev-*`, `code-reviewer`, `tech-lead`): "modo caveman ativo:
> <nível> — comprima sua resposta e raciocínio de acordo." Ele não herda sozinho (lei do
> `~/.claude/CLAUDE.md`).
