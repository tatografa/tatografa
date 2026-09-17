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

### 1. Senha — **eu errei duas vezes aqui; leia antes de procurar**

Eu escrevi "Authentication → **Policies**, 1 minuto, zero custo". Está errado
nos dois pontos, e o segundo é o que importa:

1. **O caminho é outro.** "Policies" é onde moram as policies de RLS. A
   configuração de senha fica em **Authentication → Sign In / Providers →
   Email** (`/dashboard/project/<ref>/auth/providers?provider=Email`).
2. **A proteção contra senha vazada exige o plano Pro.** A organização `REP`
   está no **free**, então o botão não existe na tela — não é você que não
   achou. Não é "zero custo": é ~US$ 25/mês.

**Corrigido pela metade em 17/09, do lado do app.** Havia **três** regras de
senha, não uma: o cadastro do aluno exigia 8 caracteres + letra + número, e o
cadastro do personal **e a troca de senha** exigiam só o comprimento — dava para
sair de uma senha forte para "12345678" pela tela de recuperação. Agora a regra
é uma só (`lib/domain/senha.ts`), usada pelas três Server Actions e pelas três
telas. **O POST direto continua aberto** e depende do que está escrito abaixo.

**O que dá para fazer de graça, na mesma tela, e vale a pena:** subir a
exigência de força da senha. Hoje o app pede 8 caracteres, uma letra e um
número — mas **só no formulário**, em JavaScript. Quem manda um POST direto
passa com o mínimo que o Supabase aceitar. Ajustar ali é a trava de verdade:

- comprimento mínimo: **8** (o mesmo que a tela promete);
- caracteres exigidos: letras minúsculas, maiúsculas e dígitos.

Isso não substitui a checagem contra vazamento — uma senha pode ser forte e
estar em toda base vazada do mundo —, mas fecha a distância entre o que a tela
pede e o que o servidor aceita, que hoje está aberta.

**A decisão do Pro fica com o Otávio**, e ela não é só sobre senha: o item 3
abaixo (projeto de produção separado) empurra para o mesmo lugar. Se for
assinar, assinar uma vez resolve os dois.

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

## Decidido

- **[14/09] Não assinar o Pro por enquanto** (Otávio). Consequências aceitas: sem
  checagem contra senha vazada (mitigada pelas regras de força da senha, que ele
  configurou no mesmo dia) e o piloto segue no projeto `reps-club-dev`, com os
  dados de teste dentro. Reabrir quando houver mais de um aluno de verdade.

## O que **não** se decide sem o piloto

- Desacoplar `students.id` de `auth.users` (personal montar treino antes do
  cadastro) — decisão registrada no `CLAUDE.md` em 13/09
- Personal aceitar os termos ao criar conta
- M3 (feed, fotos, reavaliação física)
