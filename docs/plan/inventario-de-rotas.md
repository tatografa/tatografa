# Inventário de rotas · estados de vazio, erro e carregamento

> Escrito no M4-03. É a resposta a "o que acontece quando dá errado" para **cada**
> endereço do app. Coluna `falta` é dívida consciente, não descuido.

## Como ler

- **Vazio** — o que a tela mostra quando a consulta volta sem nada.
- **Erro** — qual boundary pega uma falha de leitura no servidor.
- **Carregando** — se existe `loading.tsx` (esqueleto) enquanto a rota resolve.

Boundary é herdado: uma rota sem `error.tsx` próprio usa o do segmento acima.
A cadeia toda termina em `app/error.tsx` e, para falha no layout raiz, em
`app/global-error.tsx`.

## A regra que define o desenho

`error.tsx` envolve `page.tsx`, `loading.tsx`, `not-found.tsx` e os `layout.tsx`
**abaixo** dele — mas **não** o `layout.tsx` do próprio segmento
(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`,
linha 96).

Isso decide tudo aqui, porque a autorização mora no layout: `requireStudent()`
em `app/(aluno)/layout.tsx` e `requireTrainer()` em
`app/(personal)/painel/layout.tsx`. Ou seja, a leitura **mais provável de
falhar no app inteiro** — a que toca o Supabase em toda navegação — passa por
cima de `app/(aluno)/app/error.tsx` e de `app/(personal)/painel/error.tsx`.

Sem `app/error.tsx`, um Supabase fora do ar derruba o usuário no
`global-error`, que troca o documento inteiro e **não carrega o CSS do app**.
Por isso `app/error.tsx` existe. Provado no navegador com um layout que estoura
de propósito: o `error.tsx` do mesmo segmento não pegou, o `app/error.tsx` pegou.

## Boundaries que existem

| Arquivo | Cobre |
|---|---|
| `app/global-error.tsx` | falha no `app/layout.tsx` (fontes, `<body>`). Documento próprio, estilo embutido — é o único lugar do projeto em que hex solto está certo, porque o CSS pode não ter carregado |
| `app/error.tsx` | todo o resto, inclusive os layouts de `(aluno)` e `(personal)` |
| `app/not-found.tsx` | 404 fora das áreas logadas, com moldura própria |
| `app/(aluno)/app/error.tsx` | falha dentro do app do aluno, com a bottom nav de pé |
| `app/(aluno)/app/not-found.tsx` | `notFound()` em `/app/**` |
| `app/(personal)/painel/error.tsx` | falha dentro do painel, com a navegação de pé |
| `app/(personal)/painel/not-found.tsx` | `notFound()` em `/painel/**` |

## App do aluno · `/app/**`

Erro: `(aluno)/app/error.tsx`. 404: `(aluno)/app/not-found.tsx`.

| Rota | Vazio | Carregando | Falta |
|---|---|---|---|
| `/app` | "Nenhum treino por aqui ainda" + frase de quem é a próxima ação; sequência some antes da 1ª sessão | — | esqueleto; a home é leve e resolve rápido |
| `/app/treinos` | "`<personal>` ainda não montou nenhum treino para você" | — | esqueleto |
| `/app/treinos/[id]` | "Este treino ainda não tem exercícios"; `notFound()` se não é do aluno | — | — |
| `/app/executar/[id]` | `notFound()` sem prescrição | — | esqueleto — mas é a tela que mais precisa de resposta imediata, e ela já abre com o dado que o aparelho guardou |
| `/app/executar/[id]/fim` | `notFound()` sem sessão | — | — |
| `/app/historico` | "Seu histórico começa no primeiro treino" + botão para os treinos; avisa quando corta em `LIMITE_DO_HISTORICO` | `loading.tsx` | — |
| `/app/historico/[sessaoId]` | `notFound()` se não é do aluno | — | — |
| `/app/progresso` | `<SemHistorico />` | `loading.tsx` | — |
| `/app/perfil` | não tem lista | — | — |

## Painel do personal · `/painel/**`

Erro: `(personal)/painel/error.tsx`. 404: `(personal)/painel/not-found.tsx`.

| Rota | Vazio | Carregando | Falta |
|---|---|---|---|
| `/painel` | "Nenhum aluno entrou ainda…"; blocos mostram traço, não zero, quando não há o que medir | `loading.tsx` | — |
| `/painel/alunos/[id]` | "`<nome>` ainda não treinou"; aviso de aluno sem programa ativo; `notFound()` se é de outro personal | `loading.tsx` | — |
| `/painel/alunos/[id]/sessoes/[sessaoId]` | `notFound()` duplo (aluno e sessão) | — | esqueleto |
| `/painel/treinos` | "Nenhum treino ainda"; por aluno, distingue sem-programa de sem-treino, cada um com seu botão | — | esqueleto |
| `/painel/treinos/novo` | `notFound()` sem programa na URL | — | — |
| `/painel/treinos/[id]` | editor vazio: "Nenhum exercício ainda. Clique em Adicionar…"; busca vazia: "Nenhum exercício com esse filtro" | — | esqueleto |
| `/painel/macrotreinos` | "Nenhum aluno ainda"; por aluno, estado de sem programa ativo | — | esqueleto |
| `/painel/macrotreinos/novo` | — | — | — |
| `/painel/macrotreinos/[id]` | `notFound()` se é de outro personal | — | esqueleto |
| `/painel/exercicios` | vazio da lista filtrada; diálogo de exclusão distingue "está em treino" de "não está em nenhum" | — | esqueleto |
| `/painel/configuracoes` | não tem lista | — | — |

## Fora das áreas logadas

Erro: `app/error.tsx`, com moldura própria. 404: `app/not-found.tsx`.

| Rota | Vazio | Carregando | Observação |
|---|---|---|---|
| `/` | — | — | estática, sem leitura de banco |
| `/entrar`, `/cadastro`, `/recuperar`, `/recuperar/nova-senha` | — | — | não leem banco na renderização; falha de envio é tratada no próprio formulário, com `errosPorCampo` |
| `/acesso` | texto fixo: conta sem personal | — | — |
| `/convite/[token]` | trata a própria falha na página: `<FalhaTecnica />` para erro de banco, `<LinkExpirado />` para token inválido — **a distinção importa**, mandar quem tem link bom para "peça outro" perde o aluno por erro nosso | — | — |
| `/convite/pronto` | — | — | — |
| `/offline` | — | — | é a única página guardada no cache do service worker; pública e sem dado nenhum, de propósito |
| `/auth/confirmar` | — | — | `route.ts`, redireciona; link ruim vira `/entrar?erro=link-invalido` |

## O que falta, em uma frase

**Esqueleto de carregamento em 8 rotas** (marcadas acima). Existe nas quatro em
que a espera é sentida — painel, ficha do aluno, histórico e progresso, que
somam consulta pesada. Nas outras a rota resolve com uma consulta só, e um
esqueleto que pisca por 80 ms é pior que nada.

Não é lacuna de erro nem de vazio: **toda** rota tem boundary de erro e **toda**
lista tem estado de vazio escrito.
