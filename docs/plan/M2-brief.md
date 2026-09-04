# Brief do Milestone M2 · Utilidade contínua

> Contexto comum a todos os cards do M2. O dev lê este arquivo, o card e os arquivos
> listados no card — nunca o repositório inteiro. Lacuna que muda a solução: devolver
> ao Tech Lead em vez de adivinhar.

## O que o milestone entrega

O que transforma o app de demonstração em ferramenta de uso semanal.

**Pronto quando:** um aluno usa o app por duas semanas seguidas sem que falte nada
essencial, e o personal acompanha sem precisar perguntar nada ao aluno.

## O que o M1 já entregou e este milestone reusa

Não reescreva nada disto. Se faltar algo, estenda no lugar onde já está.

| Camada | O que existe |
|---|---|
| Domínio | `lib/domain/` — `treino.ts` (duração, séries, volume, semana, saudação), `prescricao.ts` (reps, ordem), `execucao.ts` (série ativa, progresso), `historico.ts` (estados da série, formatação), `fuso.ts` (`FUSO`, `diaLocal`) |
| Dados | `lib/queries/` — `treinos.ts` (`lerTreino`, `listarTreinosPorAluno`), `aluno.ts`, `execucao.ts`, `historico.ts`, `exercicios.ts` (busca nas duas origens), `alunos.ts` |
| Telas do aluno | `/app`, `/app/treinos`, `/app/treinos/[id]`, `/app/executar/[id]`, `/app/historico` |
| Telas do personal | `/painel`, `/painel/treinos` (+ editor) |
| Auth | Convite, onboarding, senha, **link mágico em `/acesso`** (item do roadmap, já feito) |
| Componentes | `components/ui/` e `components/aluno/`, `components/personal/` |

## Contratos já escritos

- `docs/handoffs/prescricao.md` — o que `lerTreino` devolve; `position` é índice confiável;
  `exercise_id` resolve por `exercise_source`.
- `docs/handoffs/execucao.md` — o que a execução grava; `set_number` é posição prescrita,
  não contador; série pulada existe no banco; `load_kg` chega como **string**.

## Dívidas do M1 que este milestone paga

1. **`/painel/alunos/[id]` não existe.** No M1 a lista virou cartão sem link, porque a rota
   é daqui. O card do perfil do aluno restaura o link.
2. **`listarTreinosPorAluno` traz treinos de todos os mesociclos**, mas o cabeçalho mostra
   só o `ativo`. Latente no M1 (um programa por aluno); com gestão de macrotreino vira
   lista errada. Corrigir no card do macrotreino.
3. **Macrotreino implícito.** O M1 pede nome e semanas ao salvar o primeiro treino do
   aluno. O card M2-01 substitui por gestão de verdade — e o programa criado no M1 é uma
   linha normal de `mesocycles`, então **não há dado a migrar**.

## Regras deste milestone

- **Nada de coluna derivada.** PR, volume, streak, semana e aderência são calculados na
  leitura, em `lib/domain/`. O doc 03 é explícito: "nada disso é coluna no banco".
- **Toda contagem que decide algo é agregada no banco**, não trazida para contar em
  memória — o corte de página do PostgREST é silencioso (LEARNINGS, 2026-09-01).
- **Policy nova confere o relacionamento no `insert` e no `update`.** Foi o mesmo furo três
  vezes; a convenção está no `CLAUDE.md`.
- **Gráfico sem biblioteca.** SVG à mão, com os tokens do projeto. Um gráfico de linha com
  pontos clicáveis não paga uma dependência de ~100 kB, e o doc 05 pede coisas que
  biblioteca genérica atrapalha: linha de borda a borda, datas na horizontal, mais recente
  primeiro. Decisão técnica registrada aqui para não ser rediscutida por card.

## Tabelas que o M2 acrescenta

Nenhuma. Tudo sai do que já existe: `mesocycles`, `workouts`, `workout_exercises`,
`workout_sessions`, `session_sets`, `exercises`. `exercises` (exercícios do personal) foi
criada na migration 0001 e nunca teve tela.

## Comandos

```bash
rm -rf .next && npm run build && npm run typecheck && npm run lint
```

Nessa ordem: `PageProps<"/rota">` é tipo gerado, e `typecheck` antes do `build` acusa
"Cannot find name 'PageProps'" (LEARNINGS).

## Como o milestone é validado

Roteiro para o Otávio simulando duas semanas de uso: montar macrotreino com A/B/C,
executar treinos em dias diferentes, ver o sugerido mudar, bater um recorde, e conferir o
progresso e o painel.

**Limite do ambiente remoto:** o host do Supabase é bloqueado (403 no CONNECT). Lógica de
banco se valida por SQL via MCP; interface com props fixas em rota descartável, apagada
antes do commit.
