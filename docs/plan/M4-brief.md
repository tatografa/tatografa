# Brief do Milestone M4 · Pronto para o piloto

> Contexto comum a todos os cards do M4. O dev lê este arquivo, o card e os arquivos
> listados no card — nunca o repositório inteiro. Lacuna que muda a solução: devolver
> ao Tech Lead em vez de adivinhar.

## Por que M4 e não M3

O M3 (feed, foto do treino, reavaliação física) está marcado como **cortável** desde o
planejamento, e continua cortável. Ele adiciona valor social a um produto que ainda não
foi usado por ninguém além do Otávio.

O M4 é o que separa "funciona" de "outra pessoa consegue usar". Depois do piloto com
aluno de verdade, o M3 se decide com informação em vez de suposição.

## O que o milestone entrega

**Pronto quando:** alguém que não conhece o produto — um aluno de verdade, não o Otávio —
instala, treina e volta, sem ninguém do lado explicando.

## O que a validação em campo mudou

M1 e M2 foram validados em 10-11/09/2026 (50 de 51 passos). Os quatro defeitos
encontrados estavam **todos** em bordas de autenticação e estado de sessão, nenhum na
lógica de negócio. Isso muda a prioridade deste milestone:

- **O risco não está no cálculo.** Volume, recorde, rotação, sequência, aderência e
  progresso funcionam com dado real, e a revisão consolidada não achou furo de RLS.
- **O risco está no caminho de entrada e no que acontece quando algo dá errado.** Foi lá
  que o teste achou tudo: aluno sem saída, texto que expulsa da porta certa, sessão
  invisível, ícone sem rótulo.

Por isso o M4 pesa mais em fluxo de entrada, erro e recuperação do que em telas novas.

## Dívidas declaradas que este milestone paga

Estão escritas nos handoffs e no `CLAUDE.md`, cada uma com o "Fase 4" ao lado:

1. **A fila de séries vive só no aparelho** (`execucao.md`). Sem service worker, quem
   treina sem sinal e limpa os dados do navegador perde o que estava na fila. Hoje é
   aceitável porque o contador fica visível; deixa de ser quando houver aluno de verdade.
2. **Não há alarme de fim de descanso com a tela apagada** (`execucao.md`). O timer mostra
   o tempo certo quando o aluno olha, e só.
3. **E-mail transacional não existe.** O convite virou link copiável por causa do limite
   de ~2 e-mails/hora do Supabase, e a confirmação de e-mail está **desligada** desde o
   teste de campo. Convite, recuperação de senha e link mágico do aluno dependem de um
   provedor próprio.
4. **Termos de uso e privacidade não existem**, e o app coleta peso, altura e data de
   nascimento — dado de saúde, sob LGPD.

## O que o M1 e o M2 já entregaram e este milestone reusa

Não reescreva nada disto. Se faltar algo, estenda no lugar onde já está.

| Camada | O que existe |
|---|---|
| Domínio | `lib/domain/` — treino, prescrição, execução, histórico, fuso, rotação, recordes, progresso, sequência, atenção, id |
| Dados | `lib/queries/` — treinos, aluno, execução, histórico, exercícios, alunos, macrotreinos, recordes, progresso, painel |
| Telas do aluno | `/app`, `/app/treinos`, `/app/executar/[id]`, `/app/historico`, `/app/progresso`, `/app/perfil` |
| Telas do personal | `/painel`, `/painel/alunos/[id]`, `/painel/macrotreinos`, `/painel/treinos`, `/painel/exercicios`, `/painel/configuracoes` |
| Auth | Cadastro, login por senha (dois papéis), convite por link, link mágico, recuperação |
| Componentes | `components/ui/`, `components/aluno/`, `components/personal/` |

## Regras deste milestone

- **Nada de tela nova sem necessidade provada.** O M4 é sobre o que já existe funcionar
  para quem não foi apresentado ao produto. Card que propõe tela nova justifica no delta.
- **Todo estado de erro diz o que houve e o que fazer.** Sem "algo deu errado". A rede da
  academia cai, e o aluno precisa saber se pode continuar ou não.
- **Todo estado que o app guarda fora do caminho principal tem porta de volta visível na
  tela inicial** (LEARNINGS, 2026-09-11). Foi assim que a sessão em andamento sumiu.
- **Ícone nunca comunica estado sozinho** (LEARNINGS, 2026-09-11).
- **Service worker não pode servir HTML desatualizado do app.** Cache de asset, sim;
  cache de página autenticada, não — é como se mostra o treino de outro aluno.

## Pendências não-dev que travam o piloto

Decisões do Otávio, e **duas delas custam dinheiro**:

| O quê | Por que trava | Custa? |
|---|---|---|
| Projeto Supabase separado para produção | Hoje o piloto rodaria no `reps-club-dev`, junto com dado de teste | Free tier serve no começo |
| Provedor de e-mail (Resend ou similar) + domínio | Convite, recuperação e link mágico dependem disso | Free tier serve; domínio ~R$40/ano |
| Domínio próprio | `tatografa.vercel.app` não é endereço de produto | ~R$40/ano |
| Texto de termos de uso e privacidade | Dado de saúde sob LGPD; precisa de decisão de quem responde | Advogado, se quiser revisão |

## Comandos

```bash
rm -rf .next && npm run build && npm run typecheck && npm run lint
```

Nessa ordem: `PageProps<"/rota">` é tipo gerado, e `typecheck` antes do `build` acusa
"Cannot find name 'PageProps'" (LEARNINGS).

## Como o milestone é validado

**Não pelo Otávio.** O critério é outra pessoa: um aluno de verdade recebe o convite,
instala, treina duas semanas e volta sozinho. O Otávio observa sem ajudar — e anota cada
vez que sentir vontade de explicar alguma coisa.

Este ambiente remoto continua sem alcançar o host do Supabase; o que muda é que agora
existe deploy na Vercel a cada push, então a validação em campo é o caminho normal e não
um evento.
