---
description: Triagem e correção de um bug - cria o card com pacote de contexto e roda a esteira automaticamente (junior/pleno); senior espera o plano aprovado.
argument-hint: <descrição do bug: o que acontece, onde, como reproduzir>
---

Correção de bug no produto atual.

Relato do usuário:
$ARGUMENTS

Roteiro:

1. **Acione o `tech-lead`** para triagem: ele sincroniza (`git pull`), lê `CLAUDE.md` +
   `docs/LEARNINGS.md` (o bug pode ser um erro já registrado lá), localiza a área provável e
   avalia gravidade/complexidade.
2. **Crie o card de bug** em `docs/cards/` deste produto, com pacote de contexto completo:
   passos para reproduzir, comportamento esperado vs. atual, arquivos prováveis, critérios de
   aceite (incluindo **"teste de regressão que falha antes e passa depois"**) e etiqueta de
   complexidade.
3. **Esteira:** bug isolado de baixo risco pode rodar via `/implement` na branch do milestone;
   correção urgente/crítica abre um milestone corretivo de um card. Schema, auth, pagamento, dados
   sensíveis e integrações exigem checkpoint do reviewer antes da homologação. O `senior` apresenta
   plano e espera aprovação antes de codar.
4. **Resuma para o PM:** diagnóstico, o que foi corrigido e a evidência do teste de regressão. A
   PR, deploy e atualização de `LEARNINGS.md` ocorrem no fechamento aprovado do milestone.

> **Caveman:** se o modo caveman estiver ativo nesta sessão, inclua no prompt de CADA subagente
> acionado (passos 1 e 3: `tech-lead`, `dev-*`, `code-reviewer` via `/implement`): "modo caveman
> ativo: <nível> — comprima sua resposta e raciocínio de acordo." Ele não herda sozinho (lei do
> `~/.claude/CLAUDE.md`).
