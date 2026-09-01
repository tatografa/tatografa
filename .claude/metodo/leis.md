# Gate obrigatório — agentes exploratórios/exploradores

**Proibido disparar agentes exploratórios/exploradores** (ex.: `Explore`, `general-purpose` usado
pra vasculhar código, `caveman:cavecrew-investigator`, ou qualquer subagente cujo papel seja
explorar/investigar repositório) **em qualquer fluxo, pipeline ou sessão — regular ou não.** Vale
pra TODOS os agentes/subagentes, sem exceção, mesmo dentro dos comandos do Maverick Solo Builder
(`/new-product`, `/feature`, `/bug`, `/milestone`, `/implement`, `/design`, `/review`) e mesmo na
Fase 1 (Exploração) do Plan Mode.

Antes de qualquer disparo desse tipo: perguntar ao usuário exatamente **"DESEJA INICIAR AGENTES
EXPLORADORES?"** e só prosseguir se a resposta for **"SIM"**. Sem essa confirmação explícita,
investigar sozinho com Read/Grep/Glob diretos em vez de delegar a um agente explorador.

# Regra de trabalho global — Maverick Solo Builder

> Este arquivo é instalado como `~/.claude/CLAUDE.md` e carregado em toda sessão do Claude Code.
> Método versionado em https://github.com/eumaverick/mavericksolobuilder

**Regra obrigatória:** todo trabalho de desenvolvimento de software deve passar pelo fluxo do
**Maverick Solo Builder**. Use o comando correspondente à atividade — não improvise um fluxo paralelo:

| Atividade | Comando |
|---|---|
| Novo projeto / produto / software | `/new-product` |
| Nova feature | `/feature` |
| Correção de bug | `/bug` |
| Executar a esteira (todos os cards do milestone) | `/milestone` |
| Implementar um card específico | `/implement` |
| Criação de design system / protótipo | `/design` |
| Revisão de projeto / código / PR | `/review` |

## As 6 leis do método (valem para TODOS os agentes, sem exceção)

1. **`main` é a versão aprovada; a branch do milestone é o backup de trabalho.** Todo trabalho
   começa no clone local com `git checkout main && git pull`. Abra `milestone/<id>-<slug>`, publique
   a branch no início e antes da homologação. Só após aprovação do PM faça PR, merge em `main` e
   `git push`. Nunca edite pela interface web do GitHub.
2. **A esteira trabalha por milestone, não por cerimônia de card.** Branch do milestone → cards
   por dependência → self-review + testes focados por card → testes integrados/E2E → revisão
   consolidada → preview → validação do PM → PR/merge/push. Cards mecânicos não abrem PR nem têm
   revisão isolada. Checkpoint técnico antecipado é obrigatório para schema/migração, auth,
   pagamento, PII/dados regulados, integração externa, contrato que desbloqueia frontend ou
   alteração arquitetural. E2E antecipado só para esses riscos.
3. **Gate por milestone e escalonamento sem cascata automática.** Cards `junior` (Haiku) e `pleno`
   (Sonnet) rodam automáticos; `senior` (Opus) mostra plano curto e espera aprovação antes de
   codar. Se testes, self-review ou checkpoint falharem, o mesmo dev corrige uma vez; na segunda,
   PARE e peça ao PM autorização para escalar. O PM valida no fim do milestone pela UI/preview ou
   pelo relatório de API 100% verde.
4. **Backend primeiro, frontend depois.** Todo card de backend cujo resultado será consumido por
   uma tela termina com um handoff escrito em `docs/handoffs/` (endpoints, payloads, erros,
   exemplos). O card de frontend correspondente só começa com esse handoff pronto.
5. **Contexto em duas camadas, não redundante.** O Tech Lead cria um Brief do Milestone com
   contratos, convenções e comandos comuns; cada card contém só objetivo, arquivos, delta técnico,
   dependências e verificação. O dev lê o brief, o card e os arquivos listados — nunca o repo
   inteiro. Lacuna que muda a solução = devolver ao Tech Lead.
6. **Memória evolutiva, escrita em lote.** Todo produto tem `docs/LEARNINGS.md`. O dev consulta o
   arquivo e reporta uma lição não óbvia no handoff, sem editá-lo por padrão. No fim do milestone o
   Tech Lead seleciona, promove regras recorrentes ao `CLAUDE.md` e atualiza o arquivo uma vez.

## Princípios inegociáveis

- **Planejamento primeiro.** O Tech Lead (Opus) recebe o briefing, esclarece dúvidas, agrupa o
  trabalho em **milestones testáveis pelo PM** e cria cards em `docs/cards/` com pacote de
  contexto, critérios de aceite e etiqueta de complexidade (`junior`/`pleno`/`senior`) **antes**
  de codar.
- **Cards são locais, sempre.** Fonte de verdade é `docs/cards/` + `docs/plan/milestones.md`,
  versionados no repositório do produto — sem tracker externo, sem custo de MCP por card.
- **Design system é lei.** A seção **Design System** do `CLAUDE.md` do produto aponta tokens e
  componentes; toda UI consome só de lá. Cor/espaçamento hardcoded reprova na revisão.
- **Toda branch de milestone carrega testes e evidência consolidados** (screenshot ou saída de
  teste). Segredos nunca vão ao git.
- **Gaste o modelo caro pensando, o barato digitando.** Specs boas reduzem retrabalho e tokens.
- **Se o modo caveman estiver ativo na sessão do PM, propague-o.** Ao acionar qualquer subagente
  (`tech-lead`, `dev-junior`, `dev-pleno`, `dev-senior`, `code-reviewer`, `design-engineer`),
  instrua explicitamente o modo/nível caveman ativo — ele não herda sozinho. PRs, commits e docs
  do produto continuam em prosa normal (persistidos, lidos por humanos); só a comunicação
  orquestrador↔subagente↔PM se comprime.
- **`/code-review ultra` só para mudança sensível** (auth, pagamento, dado clínico, migração).
  É revisão multi-agente na nuvem, cara — nunca padrão para PR comum.

## Ambientes e publicação

- **GitHub não é deploy:** branch remota é backup/PR; `main` é o histórico aprovado.
- **Vercel preview é homologação:** configure preview para `milestone/*` ou faça deploy manual ao
  fim do milestone; preview por card não é necessário.
- **Vercel produção acompanha `main`:** somente depois da aprovação funcional explícita do PM.

Agentes em `~/.claude/agents/`, perfis de stack em `~/.claude/profiles/`, templates em
`~/.claude/templates/`. Para produtos regulados (saúde, financeiro): segurança e auditoria por
padrão, nada de PII/CPF em log ou URL, integrações reguladas atrás de adapter; decisões
clínicas/jurídicas são humanas — sinalize em vez de assumir.
