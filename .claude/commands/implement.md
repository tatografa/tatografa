---
description: Executa UM card dentro da branch do milestone — testes e checkpoint de risco; revisão/merge ficam no fechamento do milestone.
argument-hint: <ID do card, ex: P-003, ou caminho em docs/cards/>
---

Execute o card pela esteira: $ARGUMENTS

Você é o **orquestrador da esteira** para este card. Máquina de estados, sem passos inventados:

1. **Entre na branch do milestone.** Se ela não existir, oriente usar `/milestone`; não crie uma
   branch/PR por card. Leia o Brief do Milestone e o card: critérios, etiqueta e dependências.
   Dependência não concluída (ex.: frontend sem handoff) → PARE e avise o PM.
3. **Gate:**
   - `junior` ou `pleno` → prossiga automaticamente.
   - `senior` → o `dev-senior` produz o plano em linguagem de PM e **PARE para aprovação do
     usuário**; aprovado, prossiga.
   - Sem etiqueta → trate como `pleno` e registre no card que faltou etiqueta.
4. **Implementação:** acione o subagente do nível (`dev-junior`/`dev-pleno`/`dev-senior`). Ele
   implementa, roda as verificações do card, faz commit na branch do milestone e devolve um resumo
   curto com evidência e possível aprendizado.
5. **Checkpoint seletivo:** acione `code-reviewer` somente se o card tiver checkpoint declarado ou
   tocar schema/migração, auth, pagamento, PII/dado regulado, integração externa, arquitetura ou
   contrato que desbloqueia dependente. Caso contrário, a revisão ocorre no fim do milestone.

> **Caveman:** se o modo caveman estiver ativo nesta sessão, inclua no prompt de CADA subagente
> acionado nos passos 3–5 acima: "modo caveman ativo: <nível> — comprima sua resposta e raciocínio
> de acordo." Ele não herda sozinho (lei do `~/.claude/CLAUDE.md`).
   - **PRECISA DE MUDANÇAS** → devolva os achados ao mesmo dev; máximo de 2 ciclos.
   - **APROVADO/não aplicável** → marque o card como implementado, sem merge/push de `main`.
6. **Resuma para o PM** o que ficou pronto e o próximo card; esclareça que a entrega é homologada
   e publicada quando o milestone fechar via `/milestone`.
