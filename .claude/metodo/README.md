# Maverick Solo Builder

Fábrica de software multi-agente para Claude Code: de briefings de negócio a software entregue, com
custo de tokens otimizado e qualidade consistente. Para quem tem ideias de produto mas não programa.

## Os comandos (obrigatórios para todo trabalho de dev)
| Comando | Atividade |
|---|---|
| `/new-product <briefing>` | Criar um produto do zero (esqueleto + GitHub + milestones + cards) |
| `/feature <descrição>` | Planejar uma feature (milestones + cards autossuficientes) |
| `/bug <relato>` | Triagem e correção de bug pela esteira |
| `/milestone [nome]` | **Executar a esteira**: todos os cards do milestone, em ordem, até a validação do PM |
| `/implement <card>` | Executar UM card pela esteira completa |
| `/design <briefing>` | Design system / protótipos navegáveis |
| `/review <PR ou vazio>` | Revisar projeto / código / PR |

## Como funciona (a esteira)

**Planejar:** o Tech Lead (Opus) recebe o briefing → fatia em **milestones testáveis pelo PM** →
cria um Brief do Milestone (contexto comum) e cards locais concisos (delta, arquivos e critérios),
ordenados **backend antes de frontend**.

**Executar (por milestone):** uma branch `milestone/*` → dev do nível certo implementa cards
dependentes com testes focados e commits locais → testes integrados/E2E + evidência →
**code-reviewer revisa o diff consolidado** → preview na Vercel → teste funcional do PM → PR,
squash-merge na main e `git push`. Checkpoints antecipados só para risco alto ou contratos que
desbloqueiam outros cards.

**Validar (por milestone):** com UI → roteiro de teste passo a passo para o PM; sem UI → suíte de
testes de API com relatório **100%**. O Tech Lead cura o `docs/LEARNINGS.md` (memória evolutiva)
promovendo lições recorrentes ao `CLAUDE.md` do produto.

**Gate por milestone:** `junior` e `pleno` rodam automáticos; `senior` mostra o plano e espera
aprovação. O PM só é acionado na aprovação de planos `senior` e na validação de milestones.

**As 6 leis** (git/GitHub como fonte de verdade, esteira como máquina de estados, gate por
milestone, backend-first + handoff, contexto empacotado, memória evolutiva) estão em
[`global-claude.md`](global-claude.md) — instalado como `~/.claude/CLAUDE.md` e válido para todos
os agentes.

## Instalação (uma vez)
```bash
# Instalar o método globalmente (fica disponível em qualquer projeto)
cd ~/Desktop/Project/mavericksolobuilder && ./install.sh
```
Após o `install.sh`, abra o Claude Code em QUALQUER pasta de projeto e os comandos já existem.

## Atualizar o método
Edite os arquivos deste repositório, rode `./install.sh` de novo e faça commit + push.

## Modelos por papel (otimização de custo)
| Papel | Modelo | Quando |
|---|---|---|
| Tech Lead | Opus | Planejamento, pacotes de contexto, curadoria de aprendizados |
| Dev Júnior | Haiku | Cards mecânicos (automático) |
| Dev Pleno | Sonnet | Maioria das features/bugs (automático) |
| Dev Sênior | Opus | Arquitetura e risco (plano aprovado antes) |
| Design Engineer | Sonnet | Design system e protótipos |
| Code Reviewer | Sonnet | Revisão consolidada do milestone e checkpoints de risco |

## Onde a economia de tokens acontece
- O Tech Lead cria um brief comum do milestone; cards carregam só o delta e devs não exploram o repo.
- Cards fatiados para caber em `junior`/`pleno` (modelos baratos executam, o caro decide risco).
- O reviewer lê um diff consolidado + brief/cards, não o projeto nem cada micro-PR.
- `CLAUDE.md` do produto curto (≤ ~150 linhas); estratégia longa fica em `docs/` sob demanda.

## Templates
- `templates/CLAUDE.product.md` — memória viva do produto (git, milestones, DS, convenções)
- `templates/task-pack.md` — pacote de contexto (corpo de todo card local em `docs/cards/`)
- `templates/handoff-api.md` — contrato backend → frontend (`docs/handoffs/`)
- `templates/LEARNINGS.md` — memória evolutiva dos agentes (`docs/LEARNINGS.md`)
