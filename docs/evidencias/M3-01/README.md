# M3-01 · Camada de dados do feed social

> Migration `0018_feed_social.sql`, aplicada em 13/09/2026.
>
> **Por que começar pelo banco e não pelas telas:** aqui o dado é foto do corpo
> de uma pessoa. Uma tela feia se conserta; uma foto que vazou, não.

## O que existe agora

`posts`, `post_likes`, `post_comments` e o bucket privado `treinos`.

"Público" na v1 significa **os outros alunos do mesmo personal** — nunca a
internet. O tipo `post_visibility` carrega isso no comentário da própria coluna,
para não virar suposição de quem ler depois.

## Quem vê o quê — conferido por SQL

Cenário: dois personais; alunos **A** e **B** do personal 1, aluno **C** do
personal 2. A publica dois posts, um `personal` e um `publico`.

| Quem | post `personal` | post `publico` |
|---|---|---|
| A · autor | vê | vê |
| Personal 1 · dela | vê | vê |
| B · colega do mesmo personal | **não vê** | vê |
| C · aluno de outro personal | não vê | **não vê** |
| Personal 2 · alheio | não vê | não vê |

**A mesma matriz vale para as fotos no Storage**, conferida em separado. É o
ponto que mais importa: proteger a linha de `posts` não protege nada se a
imagem sai pela URL do Storage, que não passa pelo RLS da tabela. Por isso a
policy de leitura do bucket consulta a visibilidade do post em vez de olhar só
a pasta do dono.

Com policy baseada apenas em pasta, **B enxergaria a foto do post privado de A**
— o vazamento que este teste existe para impedir.

## Tentativas de burla

| Tentativa | Resultado |
|---|---|
| B publica post em nome de A | recusado pelo RLS |
| C curte post que não enxerga | recusado |
| B curte o post **privado** de A | recusado |
| B curte o post público de A | passou (é o esperado) |
| A transfere o próprio post para B | recusado |
| C comenta em post que não enxerga | recusado |
| Personal 1 comenta no post do aluno dele | passou (é o esperado) |
| C apaga post de A | **0 linhas** |
| Personal 1 apaga post do aluno dele | **0 linhas** |
| B edita a legenda do post de A | **0 linhas** |
| C remove a curtida de B | **0 linhas** |
| B sobe foto na pasta de A | recusado |
| A sobe na própria pasta | passou (é o esperado) |

> **Cuidado que quase passou batido:** `delete` e `update` barrados por RLS não
> levantam erro — afetam zero linhas em silêncio. O primeiro teste deu
> "PASSOU" para "C apaga post de A" só porque o comando não falhou. A prova só
> vale contando linhas afetadas, e foi assim que ficou.

## Defeito encontrado pelo próprio teste

A primeira versão revogava `execute` de `authenticated` no helper
`private.pode_ver_post`. A policy roda **como o usuário que consulta**, então
sem essa permissão ninguém via post nenhum. O que mantém o helper fora da API é
o schema `private` não ser exposto pelo PostgREST — não a revogação. Corrigido
para o mesmo padrão da migration 0005.

## Sobrou no banco

Três linhas em `storage.objects` do bucket `treinos`, metadados de teste sem
arquivo por trás. O gatilho `protect_delete` do Storage impede apagá-las por
SQL, e não tenho o papel de dono para desligá-lo. Remover pelo painel do
Supabase → Storage → `treinos`. São inofensivas.
