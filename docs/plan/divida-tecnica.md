# Dívida técnica conhecida

> Auditoria de 13/09/2026, com os advisors do Supabase. Lista curta de
> propósito: só o que foi **verificado**, com o custo de consertar e o momento
> certo de fazer.

## Avisos que são decisão, não defeito

O advisor de segurança aponta dois, e os dois estão certos em apontar e errados
em alarmar. Ficam registrados para não serem "consertados" por engano:

| Aviso | Por que fica assim |
|---|---|
| `convite_por_token` é `security definer` e executável por `anon` | **É o ponto dela.** Quem abre o link de convite ainda não tem sessão. A alternativa seria a chave de serviço, que ignoraria o RLS do banco inteiro. A função devolve três campos de um convite pendente e nada mais (decisão de 2026-08-31) |
| a mesma, executável por `authenticated` | idem — não há como liberar para anônimo e fechar para logado |

## Sobreposição de policies — conferido, não é buraco

O advisor de performance aponta `X_select` e `X_write` permissivas ao mesmo
tempo para `SELECT` em `exercises`, `session_sets`, `workout_exercises` e
`workouts`. Fui ler as quatro:

| Tabela | `select` | `write` (`for all`) | Amplia leitura? |
|---|---|---|---|
| `exercises` | dono **ou** personal do aluno | só o dono | não |
| `session_sets` | `can_read_session` | `owns_session` + série no treino | não |
| `workout_exercises` | `can_read_workout` | `can_write_workout` | não |
| `workouts` | `can_read_mesocycle` | `can_write_mesocycle` | não |

**Em todos, a de escrita é mais estreita que a de leitura**, então a união é
igual à de leitura. É custo de avaliar duas policies por consulta, não acesso a
mais. Fica.

## O que vale consertar, e quando

### 1. Proteção contra senha vazada — **do Otávio, 1 minuto**

Supabase → **Authentication → Policies** → ligar *Leaked Password Protection*.
Confere a senha contra a base do HaveIBeenPwned no momento em que ela é criada.

O aluno cria senha no onboarding, e o app guarda dado de saúde sob LGPD. É a
melhoria com melhor relação custo-benefício que existe hoje aqui: zero código,
zero risco, e bloqueia a classe de senha que aparece em todo vazamento.

### 2. `auth.uid()` avaliado por linha — **20 policies, depois do piloto**

Toda policy chama `auth.uid()` diretamente, e o Postgres reavalia **por linha**
em vez de uma vez por consulta. A correção é mecânica e documentada: trocar
`auth.uid()` por `(select auth.uid())`.

**Por que não agora:** mexe nas 20 policies do banco, isto é, na camada de
acesso inteira, às vésperas do primeiro aluno real. O ganho com um aluno e 37
séries é zero — o problema aparece com milhares de linhas.

**Quando fizer:** refazer junto as provas de burla que cada migration trouxe
(0007, 0009, 0010), porque é a única forma de mostrar que a reescrita não
afrouxou nada.

### 3. Projeto Supabase de produção — **decisão do Otávio, aberta desde o M4**

O piloto vai gravar peso, altura, data de nascimento e histórico de treino de
uma pessoa real num projeto chamado **`reps-club-dev`**, que hoje tem dados de
teste dentro:

| | |
|---|---|
| personals | 3 |
| alunos | 2 |
| sessões | 4 |
| séries | 37 |
| convite pendente | 1 |

Isso não impede o piloto — nada mistura, porque o RLS separa por personal. Mas
vale decidir antes de crescer: um projeto separado para produção dá backup e
limites próprios, e tira dado real de um ambiente onde a gente aplica migration
de teste.

**Mínimo para o piloto:** saber que os dados de teste estão lá e não confundir
os números do painel com os do aluno de verdade.

## O que **não** se decide sem o piloto

- Desacoplar `students.id` de `auth.users` (personal montar treino antes do
  cadastro) — decisão registrada no `CLAUDE.md` em 13/09
- Personal aceitar os termos ao criar conta
- M3 (feed, fotos, reavaliação física)
