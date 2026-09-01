---
description: Revisa um projeto, código ou Pull Request — correção, segurança, convenções e testes — pelo agente revisor.
argument-hint: <número do PR (ex: 42) ou vazio para revisar o diff atual>
---

Revisão de código/PR.

Alvo: $ARGUMENTS

Roteiro:

1. **Acione o subagente `code-reviewer`.**
   - Se um número de PR foi informado, revise esse PR (`gh pr view <n>`, `gh pr diff <n>`).
   - Se vazio, revise o diff atual do branch (working tree / `git diff`).
2. O revisor avalia correção contra os critérios do card, segurança/dados sensíveis, uso do design
   system (nada hardcoded), handoff de API quando aplicável, convenções do `CLAUDE.md`, testes e
   simplicidade — lendo só o diff + card, não o projeto inteiro.
3. Para mudanças sensíveis (auth, dados clínicos, pagamento, migração), eleve o rigor (considere Opus).
4. Apresente os achados por severidade (🔴/🟡/🟢) com `arquivo:linha` e correção sugerida, e um veredito final. Se o usuário pedir, poste como comentários no PR.
