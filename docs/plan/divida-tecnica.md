# Dívida técnica conhecida

> Auditoria de 13/09/2026, com os advisors do Supabase. Lista curta de
> propósito: só o que foi **verificado**, com o custo de consertar e o momento
> certo de fazer.

## Avisos que são decisão, não defeito

O advisor de segurança aponta três, e os três estão certos em apontar e errados
em alarmar. Ficam registrados para não serem "consertados" por engano:

| Aviso | Por que fica assim |
|---|---|
| `convite_por_token` é `security definer` e executável por `anon` | **É o ponto dela.** Quem abre o link de convite ainda não tem sessão. A alternativa seria a chave de serviço, que ignoraria o RLS do banco inteiro. A função devolve três campos de um convite pendente e nada mais (decisão de 2026-08-31) |
| a mesma, executável por `authenticated` | idem — não há como liberar para anônimo e fechar para logado |
| `nomes_no_feed` é `security definer` e executável por `authenticated` | **É o ponto dela** (0020). `students_select` devolve ao aluno só a própria linha, então sem esta função todo colega aparece como "Aluno" no feed. Ela devolve `(id, name)` e nada mais, **recebe os ids** em vez de listar a turma, e segue a mesma regra de `private.pode_ver_post`. Abrir o `students_select` entregaria e-mail, peso e objetivo dos colegas |

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

### 2. ~~`auth.uid()` avaliado por linha~~ — **resolvido em 14/09, migration 0021**

Eram **30 policies**, não 20: as 27 que o advisor aponta em `public` mais as 3 de
`storage.objects`, que ele não enxerga. A do bucket é a que mais pesa na
prática — roda por arquivo, e é ela que decide se a foto de um aluno abre para
um colega.

O SQL da migration **não foi digitado**: foi gerado a partir de `pg_policy` do
banco vivo, com `pg_get_expr` devolvendo a expressão exata e um `replace` de
duas trocas (`auth.uid()` e `private.my_trainer_id()`, os dois que não recebem
nada da linha). Escrever 30 policies à mão é o tipo de tarefa em que um
parêntese fora do lugar afrouxa uma regra em silêncio.

**Provado em dois níveis:**

1. *Nenhuma regra mudou.* Snapshot das 40 policies antes, comparação depois com
   o subselect desembrulhado: 40 antes, 40 depois, **0 com expressão, comando ou
   papel diferente**, 0 desaparecidas, 0 `auth.uid()` sem embrulho.
2. *As travas continuam de pé.* 18 casos, 18 OK — dez de burla (0007, 0009,
   0010 nas quatro formas, 0018 no post **e no arquivo**, 0019, 0020) e sete de
   caminho legítimo, porque afrouxar e apertar são os dois jeitos de errar isto.
   A policy do Storage foi avaliada **pelo texto vivo dela**, contra uma linha
   sintética: o gatilho `storage.protect_delete` impede apagar objeto direto, e
   uma cópia da expressão digitada por mim provaria a cópia, não a policy.

Junto foram as três chaves estrangeiras sem índice que o advisor apontava. A que
importa é `posts(session_id)`: nada lê por ela, mas o `on delete set null` varre
`posts` toda vez que uma sessão vazia é descartada — e isso acontece **toda vez
que o aluno começa outro treino**.

O advisor agora acusa esses três índices como "nunca usados". É esperado num
banco com duas dezenas de linhas: o planejador prefere varrer a tabela inteira.
Não confundir com índice inútil.

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
