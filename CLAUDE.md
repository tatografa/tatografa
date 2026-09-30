@AGENTS.md

# Reps Club

> CLAUDE.md do produto, no formato do Maverick Solo Builder (`.claude/metodo/`).
> Curto de propósito: é lido em toda sessão e em todo card. Estratégia longa vive
> em `docs/` e só é lida quando um card apontar para ela.

## Visão

Plataforma onde **personal trainers montam treinos** e **alunos executam na academia**,
registrando carga e repetições série por série. O valor está no histórico: o aluno vê a
própria evolução por exercício, o personal vê o que o aluno de fato fez.

Dois produtos, um sistema, um projeto Next.js:

| Papel | Interface | Contexto de uso |
|---|---|---|
| Aluno | Web mobile-first (PWA) | Celular, na academia, entre séries, internet ruim |
| Personal | Web desktop | Computador, sentado, montando treinos |

Interface inteira em **português do Brasil**.

## Git e ambientes

- **Repositório:** `github.com/tatografa/tatografa`
- **Branch de trabalho atual:** `claude/reps-club-fase-0-aebdup`.
  _Desvio consciente da lei 1 do método:_ as sessões deste projeto são abertas com uma
  branch designada pelo harness. Enquanto isso valer, ela faz o papel da branch de
  milestone. Não trocar de branch sem o Otávio pedir.
- **Preview/produção:** **Vercel conectada** em `tatografa.vercel.app`, publicando a
  branch de trabalho. Todo push vira deploy. O Supabase é o `reps-club-dev`.
  O domínio é **`repsclub.com.br`** (Hostinger), e desde 13/09 **a raiz aponta para a
  Vercel** (`A @ → 76.76.21.21`; `www` é CNAME que segue a raiz). O site que morava ali
  desde nov/2025 saiu do ar por decisão do Otávio — é o site que este app substitui.
  Apontar não exigiu mudança de código: `getSiteOrigin()` deriva do host da requisição.
  E-mail do domínio (MX, SPF, DKIM, DMARC) e os subdomínios do VPS (`n8n`, `easypanel`,
  `evolutionapi`, `wahaapi`) **não foram tocados**.
  Roteiro e quem faz o quê: `docs/plan/configurar-dominio-e-email.md`.
- **Piloto:** **usa o mesmo projeto** `reps-club-dev` (decisão do Otávio, 17/09). A
  pendência do M4 fecha aqui. O limite aceito e conhecido: dado de aluno real convive com
  o dado de teste que já está lá, e é nesse mesmo projeto que eu aplico migration e rodo
  prova de burla. Nada mistura entre carteiras — o RLS separa por personal —, mas os
  números do painel somam os alunos de teste, e apagar lixo exige saber o que é lixo.

## Stack

Perfil: `web-nextjs` (`.claude/profiles/web-nextjs.md`), com três desvios deliberados —
o perfil descreve o caminho padrão, e mudar isso agora seria reescrever a Fase 0 sem
ganho de produto:

| Perfil diz | Aqui é | Motivo |
|---|---|---|
| pnpm | **npm** | Projeto nasceu com npm; trocar não entrega nada ao usuário |
| shadcn/ui | **Componentes próprios** em `components/ui/` | Doc 04 define um design system próprio; shadcn traria outro |
| Tokens DTCG + Style Dictionary | **Tailwind v4 `@theme`** em `app/globals.css` | Alvo único (web); build de tokens multiplataforma é peso sem uso |

- **Framework:** Next.js 16 (App Router) + TypeScript. **Não é o Next que você conhece** —
  `proxy.ts` no lugar de `middleware.ts`, APIs de request assíncronas. Ler
  `node_modules/next/dist/docs/` antes de escrever código.
- **Banco e auth:** Supabase (Postgres + Auth + Storage), RLS em todas as tabelas.
- **Estilo:** Tailwind CSS v4.
- **Validação:** zod v4 (a API de mensagem mudou: `error`, não `errorMap`).
- **Ícones:** lucide-react.

## Milestones

Fatias verticais do `docs/plan/milestones.md`. Todo milestone é validável pelo Otávio.

| # | Fase | Entrega | Status |
|---|---|---|---|
| M0 | Fase 0 · Fundação | Conta de personal, login, `/painel` protegido | validado |
| M1 | Fase 1 · Fatia vertical | Convite → treino → execução → histórico | **validado em campo** |
| M2 | Fase 2 · Utilidade contínua | Macrotreino, PRs, progresso, painel completo | **validado em campo** |
| M3 | Fase 3 · Social e reavaliação | Feed, fotos, reavaliação física, agenda | **validado em campo** |
| M4 | Fase 4 · Pronto para o piloto | PWA, estados vazios/erro, e-mails, termos | **feito · piloto em curso** |

> **O M3 foi validado em campo em 15-16/09/2026**, em duas rodadas: 106 de 115 passos
> na primeira e 27 de 27 no reteste. Os dois defeitos reais estavam em **caminho que
> existe mas não parte de onde o usuário está** — nenhum na lógica de negócio nem nas
> policies. Registro em `docs/plan/milestones.md`.
>
> **M1 e M2 foram validados em campo em 10-11/09/2026** — 50 dos 51 passos do roteiro,
> com Supabase de verdade, treino executado no celular e conferência no painel.
> Os quatro defeitos encontrados estavam todos em **bordas de autenticação e estado de
> sessão**, nenhum na lógica de negócio. Registro em `docs/plan/milestones.md`.

## Design System

**Fonte de verdade do design.** Nada de cor ou espaçamento mágico — tudo sai dos tokens.
Hex solto em componente reprova na revisão.

- **Tokens:** `app/globals.css`, bloco `@theme`. Marca, tema claro, tema escuro
  (execução do treino), semânticas, tipografia, raios, sombras.
- **Componentes base:** `components/ui/` — Button, Input, Card, Badge, Dialog,
  EscolhaCards. Exportados por `components/ui/index.ts`.
- **Utilitário `eyebrow`:** label mono maiúsculo, definido em `globals.css`.
- **Tipografia:** Inter na interface toda; JetBrains Mono só em eyebrow, label, badge e timer.
- **Referência visual:** `docs/design/` — o handoff original, com os specs das 12 telas do
  aluno (`05-telas-aluno.md`), das 10 do painel (`06-telas-personal.md`) e os protótipos
  `.dc.html`. Os protótipos são **referência, não código**: reconstruir em React, nunca
  copiar o HTML. Onde o handoff e este arquivo discordarem, **este vence** — ele registra
  o que foi decidido depois, com o produto na mão.

## Convenções de código

- **Regra de negócio fica em `lib/domain/`**, como função pura, testável sem banco.
  Cálculo de PR, volume, streak, semana do macrotreino, rotação, duração estimada.
- **Texto ou regra que um componente cliente e uma página servidor dividem vive num
  módulo neutro.** Função exportada de módulo `"use client"` não pode ser *chamada*
  pelo servidor, só renderizada como componente — e duplicar a frase para contornar
  isso é como duas cópias de um texto aprovado saem de sincronia.
- **Acesso a dado fica em `lib/queries/`**, tipado, com `import "server-only"`.
- **Nada de N+1.** Buscar em lote e agrupar em memória, mesmo com poucos registros.
- **Autorização de verdade mora no layout** (`requireTrainer()`, `requireStudent()`),
  não no `proxy.ts` — o proxy é otimista, só evita render à toa.
- **Policy de escrita confere o relacionamento, não só o dono da linha — e no
  `UPDATE` também.** Foi o mesmo furo três vezes (migrations 0007, 0009, 0010).
  Toda coluna que aponta para o relacionamento (`student_id`, `workout_id`,
  `trainer_id`) precisa estar no `with check` do insert **e** do update: um
  `insert` bem trancado não vale nada se o update reescreve a mesma coluna.
- **Nunca confiar em metadado de usuário para papel.** Metadado é editável pelo próprio
  usuário; a checagem é a existência da linha em `trainers` / `students`.
- **Helper de RLS vive no schema `private`.** O PostgREST publica como RPC toda função de
  `public`; helper de autorização exposto é superfície de ataque sem ganho.
- **Server Action valida com zod** e devolve `errosPorCampo` para o formulário. Todo
  formulário leva `noValidate` — a validação nativa do navegador aparece em inglês.
- **Módulo `"use server"` só exporta função assíncrona.** Uma constante exportada no
  meio das ações **zera as exportações do arquivo inteiro**, e o erro do build aponta
  para as ações que sumiram, não para a constante. Valor compartilhado entre a ação e o
  formulário vai para `lib/domain/`.
- **Comentário explica o porquê, não o quê.** Em português.
- **Segredo nunca vai ao git.** `.env.local` é ignorado; `.env.example` é o template.

## Memória e handoffs

- **Aprendizados:** `docs/LEARNINGS.md` — ler antes de codar; curar ao fim do milestone.
- **Handoffs:** `docs/handoffs/<feature>.md` — contrato de dado que a tela consome.
  Hoje: `prescricao.md` (o que a execução lê), `execucao.md` (o que o histórico lê) e
  `macrotreino.md` (programa, rotação e treino sugerido).

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build
```

Migrations em `supabase/migrations/`, aplicadas pelo MCP do Supabase. Depois de mudar o
schema, regerar `types/database.ts`.

## Verificação

Provar que funciona sem o Otávio ler código:

1. `npm run typecheck && npm run lint && npm run build` — os três limpos.
2. Lógica de banco (RLS, gatilho, constraint) testada por SQL, incluindo os casos de burla.
3. Interface conferida no navegador, com screenshot dos estados: vazio, erro, carregando, sucesso.
4. **Limite conhecido deste ambiente remoto:** o host do Supabase é bloqueado pela política
   de rede (403 no CONNECT). Fluxo que depende de sessão real só é validável na máquina do
   Otávio. Interface que precisa de dado se confere com props fixas numa rota descartável.

## Cards

`docs/cards/` · milestones em `docs/plan/milestones.md` · brief por milestone em
`docs/plan/<milestone>-brief.md`. Etiquetas: `junior`, `pleno`, `senior`.

## Decisões de arquitetura

- **[2026-08-23]** Um projeto Next.js serve as duas interfaces, com route groups
  `(marketing)`, `(auth)`, `(personal)`, `(aluno)`. Não são dois apps.
- **[2026-08-23]** Linha de `trainers` criada por gatilho no banco, não pelo cliente: com
  confirmação de e-mail ligada o `signUp` não devolve sessão, e um insert do cliente
  esbarraria no RLS.
- **[2026-08-31, corrigido em 2026-09-13]** Convite do aluno chega por **link copiável**
  (WhatsApp), não por e-mail. A decisão continua valendo; **o motivo registrado estava
  errado.** Não era "~2 e-mails/hora": o serviço de e-mail embutido do Supabase
  **só entrega para endereços da equipe do projeto** e recusa todo o resto com
  `Email address not authorized`. Não é limite de volume, é lista de convidados — e
  nenhum aluno de verdade jamais receberia nada. O motivo bom do link copiável é outro
  e é de produto: aluno de academia abre WhatsApp, não abre e-mail.
- **[2026-09-13]** **E-mail transacional sai pelo SMTP da Hostinger** (`smtp.hostinger.com`,
  remetente `contato@repsclub.com.br`), que o Otávio já paga, não por provedor novo.
  Ligado e validado em 13/09: `/recuperar` entrega de verdade. Limite da caixa: 100
  e-mails por dia. Recuperação de senha e link mágico são os únicos fluxos
  que dependem de e-mail — não há como um terceiro gerar esses links sem a chave de
  serviço do banco, e guardá-la na Vercel ampliaria o estrago de um vazamento para o
  banco inteiro. O convite segue no WhatsApp.
- **[2026-09-13]** **O personal não monta treino antes de o aluno se cadastrar, e por ora
  fica assim.** `students.id` **é** o id de `auth.users`, então a linha do aluno não pode
  existir antes da conta — e o macrotreino pendura em `student_id`. A ordem é convite →
  aceite → montar → abrir. O enum tem `status = 'convidado'` como padrão da tabela e
  ninguém o usa: resquício de um desenho em que o personal preparava antes; a permissão
  existe (`students_insert` aceita o personal), a chave estrangeira é que fecha.
  **Não desacoplar agora** (decisão do Otávio, 13/09): `students.id` é usado por
  `mesocycles`, `workout_sessions` e por toda policy que compara `id = auth.uid()`, e
  mexer na camada de acesso inteira às vésperas do primeiro aluno real custa mais do que
  entrega. O piloto decide se importa: com um aluno por vez, dez minutos de espera não é
  problema; com dez, vira.

- **[2026-09-27, pedido do Otávio]** **O painel do personal segue o layout do protótipo**
  (`Painel do Personal - Dashboard.dc.html`), medido no código dele: fundo cinza com dois
  cartões brancos de canto 20px (navegação e página), **um cabeçalho só para as dezessete
  páginas** (`CabecalhoDaPagina`: título 22px, subtítulo, ações à direita, fio embaixo) e
  o avatar do personal fixo no canto, levando às configurações. O dashboard virou **duas
  colunas** — números, alerta, convites e gráficos à esquerda; Top 10 e treinos recentes
  num trilho de até 340px à direita —, todos no mesmo `CartaoDoPainel` (selo de ícone,
  título, apoio, linhas com fio). Um componente para os seis blocos porque o que faz a
  tela parecer ferramenta é **repetição**, e seis cópias do cabeçalho divergiriam.
- **[2026-09-27]** **O que ficou diferente do protótipo, cada um com motivo.**
  *Rolagem:* no protótipo rola o cartão de dentro; aqui rola a janela e a navegação fica
  `sticky` — rolagem interna faria o voltar do navegador e o Ctrl+F errarem de contêiner.
  *Busca global, sino, "Plano Pro", "Modo escuro":* já descartados em 18/09, pelo mesmo
  motivo. *Pílula de variação nos números ("+12%"):* compara com o mês anterior, e o
  painel não guarda nenhum dos quatro números do mês anterior — seria número inventado no
  lugar mais visível. *Receita, ticket, churn, renovações e "Distribuição por plano":* não
  há cobrança nem plano no modelo de dados (decisão de 18/09 continua). *Progressão em
  percentual e não em quilos:* em quilos o agachamento ganha de toda rosca todo mês (18/09).
  *"Painel" e não "Dashboard" no título:* é o nome do item no menu, e a interface é inteira
  em português. *Paleta:* a cinza-azulada do protótipo não entrou; os tokens continuam os
  que passaram em AA.
- **[2026-09-27]** **O traço vermelho do item ativo saiu da navegação.** Estava lá desde
  18/09 porque "cor sozinha não é sinal"; o protótipo marca o ativo com fundo preenchido e
  peso de fonte, e isso **também não é só cor** — é forma mais peso. A regra de
  acessibilidade continua atendida; mudou o jeito.
- **[2026-09-27]** **Colunas por container query, não por ponto de quebra da janela.** Com
  a navegação aberta ou recolhida a largura útil muda 184px, então quem decide se o trilho
  da direita cabe (e se os quatro números vão numa linha ou em duas) é a largura da
  coluna, não a da janela. A primeira versão usava `flex-wrap` e `auto-fit`: o trilho
  descia preso aos 340px e ficava órfão num canto, e os quatro números caíam em três mais
  um sobrando. Os dois só apareceram no screenshot a 1100px, nenhum no de 1440.
- **[2026-09-27, decisão do Otávio]** **"Treinos" virou a divisão de treino do protótipo,
  e "Macrotreinos" saiu do menu.** Uma tela por aluno: à esquerda o aluno, o painel de
  macrociclos, o objetivo, a frequência, os nomes dos dias e o volume da semana; à direita
  um cartão por treino, lado a lado, num quadro pontilhado com zoom. `/painel/macrotreinos`,
  `/painel/treinos/novo` e `/painel/treinos/<id>` continuam de pé como **redirect** para o
  programa certo — há link salvo e mensagem de WhatsApp apontando para eles. Aluno e
  programa vão na **URL** (`?aluno=&programa=`), não em estado: o link recarrega e se cola
  numa conversa sem perder onde se estava, e id torto cai no padrão sem virar erro.
- **[2026-09-27, decisão do Otávio]** **RIR é por exercício, não por série.** O protótipo
  prescreve série a série (Aquecimento, Preparatória, Work, Drop, Falha, cada uma com reps
  e RIR); isso mudaria a execução e o histórico inteiros e ficou fora. Entrou
  `workout_exercises.rir_target` (migration 0037): texto, "2" ou "0-2", de 0 a 10, com
  `check` no banco — mesma razão de `reps_target` ser texto. Nulo = não prescrito, que é
  todo treino anterior a hoje. **Para o aluno o RIR vai em palavras** ("Pare com 0 a 2
  repetições sobrando", `rirEmPalavras`), com a sigla entre parênteses: RIR é a língua de
  quem prescreve, e quem lê está entre uma série e outra. No lugar das "séries detalhadas"
  o cartão abre os campos que o editor antigo tinha: séries, reps, RIR, descanso, técnica e
  observação.
- **[2026-09-27, decisão do Otávio]** **A rotação continua; o cartão diz "Treino A", não
  "Segunda".** O protótipo prende cada treino a um dia da semana. Aqui o aluno faz o
  próximo da rotação (decisão de 04/09): quem falta na segunda faz o A na terça. Por isso a
  **frequência semanal é o número de treinos da divisão** — 4x são 4 cartões, e o volume
  "semanal" é a soma deles — e os botões 1x…7x acrescentam ou tiram cartões, como no
  protótipo. Tirar cartão com treino salvo passa por confirmação que diz o que some.
- **[2026-09-27, decisão do Otávio]** **O objetivo mora no programa, não no aluno**
  (`mesocycles.goal`, enum `training_goal`). O mesmo aluno faz um bloco de força e depois
  um de hipertrofia; guardar no aluno reescreveria o passado a cada troca. É outro campo
  que `students.goal` ("o que eu quero da vida"), e os rótulos vivem separados
  (`OBJETIVO_DO_PROGRAMA`). Nulo é "não informado", sem sexto valor — mesma regra do
  perfil biológico. Salva na escolha, sem botão.
- **[2026-09-27]** **Salvar é um botão só, e salva cartão por cartão, não numa
  transação.** "Enviar para o aluno" (programa ativo) ou "Salvar rascunho" (arquivado), no
  cabeçalho. Cada treino é independente, e um cartão com erro não deve impedir os outros
  seis de chegar ao aluno; o que falhou fica marcado **no próprio cartão**. Sem redirect —
  o editor antigo redirecionava, e aqui isso levaria embora a edição dos cartões ao lado.
  Trocar de aluno, de programa ou ativar/arquivar pergunta antes se há cartão por salvar,
  e fechar a aba dispara o aviso do navegador.
- **[2026-09-27]** **A ação devolve os ids das linhas na ordem da tela, e sem isso o
  segundo "Salvar" apagaria histórico.** O editor antigo redirecionava e relia tudo do
  banco. Sem redirect, o cartão continuaria com as linhas novas sem id; o salvar seguinte
  as mandaria como novas outra vez — `gravarPrescricao` criaria cópias e **apagaria as
  originais**, levando por cascata qualquer série que o aluno registrasse no meio. Achado
  lendo o fluxo antes de escrever a tela, não em campo.
- **[2026-09-27]** **Programa arquivado aceita treino novo — a regra de 04/09 foi
  revogada.** "Treino novo só em programa ativo" nasceu quando arquivado era só passado.
  Desde a duplicação (17/09) o arquivado é também o rascunho: a cópia nasce arquivada e
  "quase sempre leva um ajuste antes de ativar". Recusar treino novo ali obrigava a ativar
  primeiro e montar com o aluno já vendo o programa pela metade. O quadro marca
  "Arquivado · o aluno não vê", e o botão diz "Salvar rascunho".
- **[2026-09-27]** **As abas do painel de macrociclos são Atual, Histórico e Novo**, não
  as Ativos, Inativos e Rascunhos do protótipo. O modelo não tem rascunho separado (o
  arquivado é o rascunho), e "o programa na tela" nem sempre é o ativo — o personal pode
  estar ajustando um arquivado antes de ativar. Uma aba só (aluno sem programa) não
  desenha abas: vai direto ao formulário.
- **[2026-09-27]** **Coluna nova em tabela que uma função copia coluna por coluna precisa
  entrar na função.** `duplicar_macrotreino` e `duplicar_treino` listam as colunas de
  `workout_exercises` uma a uma; sem reescrevê-las na 0037, duplicar um programa **apagaria
  em silêncio** o RIR e o objetivo da cópia. Provado: a cópia leva `goal = forca` e as
  linhas com `0-2`. Quinze provas no banco — sete de burla (outro personal e o aluno
  tentando mudar RIR e objetivo, contar séries de programa alheio, anon executando) e oito
  de caminho legítimo, incluindo o `check` recusando "11" e "até falha".
- **[2026-09-27]** **O "Volume insights" divide por grupo muscular, não por tipo de
  série.** Sem tipo por série não há o que o protótipo divide; a pergunta que sobra, e que
  o personal faz a um treino, é "estou pondo peito demais?". Reps somam faixa **pelo
  meio** (8-12 vale 10, `repeticoesDaSoma`): o piso subestimaria toda faixa e o teto
  contaria como feito o que é limite. A tela diz isso no `title` do número.
- **[2026-09-27]** **Zoom por `zoom`, não por `transform: scale`.** O scale encolhe o
  desenho e deixa a caixa do tamanho original — a rolagem do quadro continuaria do
  tamanho de 100%, metade vazia.
- **[2026-09-27]** **Quinto `primeiroNome`, e dessa vez virou um só** (`lib/domain/nome.ts`).
  Cinco cópias idênticas em cinco telas, a mesma história das iniciais de 18/09. A tela
  nova precisava de uma sexta.
- **[2026-09-27, pedido do Otávio]** **O Feed do painel segue o protótipo:** uma coluna
  de 680px, a faixa escura "Reps Club · N publicações", os filtros "Todos os alunos" e
  "Todo o período" (agora com 90 dias, e "todo o período" como padrão — o recorte de 30
  escondia justamente o post antigo que ficou sem resposta), e cada post com foto, **o
  treino que a gerou exercício por exercício** ("Supino reto · 4x8 · 62 kg"), curtidas,
  a conversa com o selo PERSONAL e o campo "Adicionar comentário…". A faixa soma "N sem
  sua resposta": é o motivo de o personal abrir a tela, e o protótipo não diz.
- **[2026-09-27]** **No painel o post mostra cada exercício; no feed do aluno, só o
  total — e a diferença é deliberada.** Lá o leitor pode ser um colega, e quanto o outro
  levantou não é assunto da turma (14/09). Aqui o leitor é o personal, que já vê cada série
  na ficha. As reps de "4x8 · 62 kg" são **as da série mais pesada**, não média: o par
  "8 com 62" precisa ter acontecido, e é o mesmo critério do recorde. Exercício todo
  pulado aparece como "pulado", não some. Três idas para o lote inteiro, sem N+1.
- **[2026-09-27]** **Do feed do protótipo, três coisas não entraram.** *"+ Publicar
  aviso":* o personal não publica no feed (`posts_insert` é do aluno; quem quer postar
  vira aluno de si mesmo, 13/09). *Post "Conquista do aluno"* (macrociclo iniciado ou
  terminado, com fotos de antes e depois): não existe no modelo — seria um tipo de post
  novo, não um desenho novo. *Moldura 4:3 de "sem foto":* ficou com 96px; 450px de caixa
  vazia empurravam para fora da tela o treino, que é o conteúdo daquele post.
- **[2026-09-27, decisão do Otávio]** **Exercício ganhou vídeo, descrição e instruções de
  segurança, e o aluno vê** (migration 0038, nas duas tabelas). A tela de exercícios
  virou a biblioteca do protótipo: lista por grupo muscular com busca e filtros à esquerda,
  o exercício à direita — vídeo 16:9, descrição, grupo, execução e segurança —, e o
  formulário **no próprio painel**, não num diálogo: com três campos longos o cadastro não
  cabia numa caixa. Na execução, o aluno ganha **"Como fazer"**, uma folha de baixo com o
  vídeo e os textos — folha e não tela nova, para não tirar o aluno do meio da série e do
  cronômetro. Sem conteúdo, o botão não aparece.
- **[2026-09-27]** **Vídeo só de YouTube ou Vimeo, e quem decide é `enderecoDeEmbed`.** O
  link vira `<iframe>` na tela do aluno, e um endereço qualquer ali seria uma página
  arbitrária aberta dentro do app. Duas camadas: o `check` do banco confere https e o
  domínio (recusa `youtube.com.evil.com` e `http://`), e `lib/domain/video.ts` extrai o
  id do vídeo — o que ela não reconhece nunca vira iframe. O YouTube toca por
  `youtube-nocookie.com`: abrir "Como fazer" não deve plantar cookie de rastreio no
  aparelho do aluno. O link é guardado como o personal colou; a conversão é na leitura.
- **[2026-09-27, decisão do Otávio]** **O catálogo ganhou as mesmas colunas, vazias, e o
  conteúdo dele vem do Otávio por migration.** Continua só-leitura pela API (não há policy
  de escrita, e a ausência é a trava — provado: personal tentando gravar vídeo no catálogo
  afeta 0 linhas). **Um grupo muscular por exercício continua**, também decisão dele:
  recorde, progresso e volume por grupo contam por um grupo só. Quatorze provas no banco,
  nove de burla.
- **[2026-09-27, pedido do Otávio]** **Agenda e reavaliações viraram uma tela só**
  (`/painel/agenda`), no layout da tela "Reavaliações" do protótipo: quatro números,
  calendário de semana ou de mês, e à direita a próxima sessão e as filas (sessões
  esperando marcação, reavaliações esperando o aluno, respondidas recentemente). As duas
  respondem à mesma pergunta — "o que eu tenho com cada aluno e o que está esperando" — e
  em duas telas o personal olhava metade dela de cada vez. O menu tem um item, "Agenda",
  aceso também em `/painel/reavaliacoes/<aluno>` (a comparação continua com endereço
  próprio). `/painel/reavaliacoes` virou **redirect**, pelo mesmo motivo de
  `/painel/macrotreinos`: há link salvo apontando para lá.
- **[2026-09-27]** **Reavaliação não tem hora, então vai numa faixa no alto do dia**, não
  na grade: um chip no dia em que foi liberada e outro no dia em que foi respondida.
  Pôr num horário inventado faria dela um encontro marcado, que ela não é — o aluno
  responde quando mede.
- **[2026-09-27]** **A grade de horas voltou, revendo a decisão de 15/09** ("sete linhas,
  não uma grade de horas", que morava no comentário da tela antiga). O motivo de lá
  continua certo — carteira de piloto tem duas ou três sessões por dia —, mas o protótipo
  pede a grade, e ela mostra o que a lista escondia: sessão sobreposta e buraco no dia. O
  vazio foi contido de dois jeitos: a faixa é 6h–22h (esticada só se houver sessão fora
  dela) e a grade **rola dentro do cartão** até 560px, com foco de teclado, para a página
  não virar uma parede de linhas.
- **[2026-09-27]** **Do protótipo, três coisas não entraram.** *Semana começando no
  domingo:* a agenda continua na segunda (15/09). *Tipo "Bioimpedância" e situações
  "Confirmado/Pendente":* o modelo tem sessão e reavaliação, e `agendada / realizada /
  faltou / cancelada` — confirmação seria o fluxo de aceite descartado em 15/09, e tipo
  novo é coluna nova. **Os quatro números** são: sessões nos próximos 7 dias,
  reavaliações esperando o aluno, sessões esperando a marcação do personal e
  comparecimento no mês (`realizadas / (realizadas + faltou)`; cancelada não conta —
  desmarcar com antecedência não é falta —, e sem nenhuma das duas o número é "—", não 0%).
- **[2026-09-27]** **O evento abre num `<details>`, e a grade não tem JavaScript.** Veio,
  Faltou e Cancelar moram no próprio popover, então marcar presença não exige sair do
  calendário; e a tela inteira continua componente servidor — os únicos pedaços cliente
  são os botões que já existiam.
- **[2026-09-28, pedido do Otávio]** **Alunos segue o protótipo:** os quatro números em
  ladrilho cinza, a busca com o botão "Filtros" que abre os filtros avançados em chips
  (Status, Programa, Tempo sem treino), a tabela com avatar, pílula de status com ponto e
  "Último treino" em vermelho com triângulo para quem passou do limiar, e o rodapé
  "Mostrando N de M alunos". **As colunas de cobrança viraram as perguntas que sobram
  delas:** "Plano" → **Programa** (nome e semana), "Vencimento" → **Aderência**,
  "Tipo biológico" entrou como **Perfil biológico**. O filtro "Vencimento" não tem
  equivalente e saiu; "Plano" virou "com programa / sem programa".
- **[2026-09-28]** **Do protótipo de Alunos, três coisas não entraram.** *Caixinha de
  seleção por linha:* não existe ação em lote, e caixa que se marca sem nada para fazer
  com a marcação é controle mentindo. *Paginação de seis em seis:* carteira de piloto
  cabe numa página, e paginar esconde do Ctrl+F e da ordenação o aluno que se procura —
  quando a carteira passar de uma página de consulta, a busca vira filtro do servidor e a
  paginação vem junto. *Avatar colorido por aluno:* cor por nome não carrega informação
  e pediria seis tokens novos sem contraste medido; ficou o `brand-soft` do feed.
  *Inativo* é cinza, não vermelho: arquivar é decisão do personal, não problema — o
  vermelho da tabela é o do "último treino", que é o alerta.
- **[2026-09-28]** **"Precisam de atenção" virou botão que liga o filtro "N+ dias" da
  própria tabela**, com `aria-pressed`, e o degrau do filtro é o limiar configurado, não
  o "4+ dias" fixo do protótipo: o número do ladrilho e o tamanho da lista que ele abre
  saem da mesma função (`precisaDeAtencao`). **E o arquivado deixou de contar** — o
  indicador somava quem o personal arquivou de propósito, ao contrário do alerta do
  dashboard, que sempre o pulou. Só apareceu com o triângulo vermelho na linha de um
  inativo, no screenshot.
- **[2026-09-28]** **Terceiro ladrilho de número, e virou um só** (`NumeroDoTopo`):
  painel, agenda e alunos tinham cada um a sua cópia, e a da agenda já tinha um selo que
  as outras não sabiam desenhar. O conteúdo é `span`, não `p`, porque o mesmo ladrilho
  vira `<button>`.
- **[2026-09-28, pedido do Otávio]** **O perfil do aluno segue o protótipo em três
  colunas:** quem é o aluno (avatar, status, sessões e dias seguidos, os dados e a meta de
  peso num cartão à parte), a **atividade** no meio (faixa escura "Reps Club · Atividade
  de…" e um cartão por treino) e o **programa atual** à direita, com as abas Planilha e
  Gráfico. Colunas por container query: três a partir de 1040px de conteúdo, duas
  (identidade + programa em cima da atividade) a partir de 680, uma abaixo disso.
  **As laterais são percentuais (26% e 37%, pedido do Otávio, 28/09)**, e a atividade
  fica com o que sobra: a primeira versão tinha 230 e 350px fixos, e a 1440px o feed
  ocupava 45% da largura — a coluna que se lê rolando era a maior, e as duas que se
  consultam num relance ficavam espremidas.
- **[2026-09-28]** **Na atividade o cartão nasce da sessão, e o post pendura nela pelo
  `session_id`** (`montarAtividade`, `lib/domain/atividade.ts`). É o treino que o
  personal vem conferir; a foto é o que às vezes veio junto. Post avulso vira cartão
  próprio. O cartão é o **mesmo** do feed do painel (`CartaoDeAtividade`) — duas cópias
  divergiriam, e a moldura de "sem foto" já tinha mudado uma vez. A sessão que não virou
  post **não** desenha "Sem foto nesta execução": ela não ficou sem foto, ela não foi
  publicada; e não tem curtida nem comentário, porque não há post onde comentar. Embaixo
  do treino vai o que o histórico antigo mostrava numa linha — duração, "14 de 16
  séries", volume, a observação do aluno e **"Série a série"**. Quinze cartões; o resto
  das cinquenta sessões continua em "Treinos anteriores", compacto. O bloco escuro das
  sessões sem post é buscado **só para os quinze cartões**: as séries vêm numa consulta
  só, e o corte de página do PostgREST é silencioso.
- **[2026-09-28, revisto no mesmo dia a pedido do Otávio]** **O "Gráfico" do programa é
  em barras, como no protótipo** — por treino (o primeiro abre sozinho), um gráfico por
  exercício com as seis sessões mais recentes e as métricas Carga, Repetições e Volume.
  A primeira versão reaproveitava a linha do app do aluno para os dois não conversarem
  sobre números diferentes; **isso continua garantido pelo número, não pelo desenho**: a
  barra de Carga é a carga máxima da sessão, o mesmo ponto da linha e o mesmo critério do
  recorde (`barrasDoExercicio`, `lib/domain/planilha-do-aluno.ts`). No peso corporal a
  "carga" vira repetições, e o cabeçalho diz "em reps". "Loads" do protótipo virou
  **Volume**: é a palavra que o resto do produto usa para carga × repetições.
- **[2026-09-28]** **Abrir um exercício na Planilha mostra o que o aluno fez nele**, como
  no protótipo: o proposto (séries × reps, RIR, descanso, técnica), o **recorde** — a
  maior carga já levantada, o mesmo da tela de recordes — e cada sessão, **por data ou
  por série** (a série 1 de cada dia, depois a 2…, que é como se vê a última série caindo
  semana a semana). O destaque de cada bloco diz "maior", e não "Recorde" como no
  protótipo: recorde neste produto é um número só, o de todos os tempos, e chamar de
  recorde o melhor de um dia faria o painel ter dez recordes para um exercício. Um
  exercício aberto por vez. A prescrição casa com o histórico pela chave
  `(origem, id)` (`chaveDe`), que a consulta agora também usa — duas cópias do formato da
  chave seriam o jeito de elas pararem de casar.
- **[2026-09-28]** **O coração continua coração.** O protótipo curte com 🔥 no painel; o
  aluno curte com coração no app, e o mesmo gesto com dois ícones faria o personal achar
  que são duas coisas. Última reavaliação e anotações privadas continuam abaixo do
  programa (o protótipo não as desenha), e o "Falar no WhatsApp" desceu para o fim do
  cartão de identidade, depois dos dados.
- **[2026-09-30, do teste de campo]** **A barra recolhida mora num cookie, não mais no
  `localStorage`.** O servidor não enxerga o `localStorage`: todo F5 chegava com a barra
  aberta e só recolhia depois da hidratação — um relance de barra larga, com o item ativo
  piscando na troca (passo 10 do roteiro do redesenho). Com o cookie
  (`reps_painel_barra_recolhida`, caminho `/painel`), o layout lê a preferência e o HTML
  já sai do jeito que o personal deixou. Isso também aposenta o `useMontado()` + troca de
  `key` da barra, registrado em 18/09. Quem recolheu antes da mudança recolhe uma vez de
  novo: a preferência antiga fica no `localStorage` e ninguém mais a lê.
- **[2026-09-28, pedido do Otávio]** **A barra lateral recolhe e expande com um clique em
  qualquer lugar livre dela**, não só na seta. Link e botão continuam fazendo o que
  fazem — o clique neles não alterna (`closest("a, button, …")`). **A seta fica**: é o
  caminho do teclado e do leitor de tela, porque um `<aside>` clicável não recebe foco
  nem se anuncia; o clique na barra é atalho de mouse, não o único jeito. O pé da barra
  virou um cartão com as iniciais, o nome e "Sua conta" (levando às configurações) e a
  saída como ícone ao lado; **recolhida, a saída continua lá**, embaixo das iniciais —
  antes a faixa de ícones mostrava só as iniciais, e sair exigia expandir primeiro. O
  indicador de desenvolvimento do Next foi para o canto direito: no esquerdo ele cobria
  exatamente esse pé.
- **[2026-09-28, pedido do Otávio]** **Configurações segue o protótipo:** o cartão
  "Perfil" em cima (iniciais, nome, e-mail e WhatsApp), com "Editar perfil" no
  cabeçalho da página, e embaixo dois cartões — **Alerta de inatividade** no lugar de
  "Plano e assinatura" (não há cobrança no modelo, 18/09) e **Segurança** com trocar
  senha e sair da conta. **O personal passa a editar o próprio nome**, que nenhuma tela
  editava: é o nome que o aluno vê no app. O **e-mail não se edita**: é o login em
  `auth.users`, e a tela mostra esse, não a cópia de `trainers.email`.
- **[2026-09-28]** **Trocar senha pede a senha atual**, conferida por
  `signInWithPassword` com o e-mail de `auth.users`. O Supabase aceitaria só a sessão,
  e o painel roda em computador de academia e notebook aberto: quem achar a sessão
  esquecida não deve conseguir trancar o dono fora da conta. A regra de força é a de
  `lib/domain/senha.ts`, e as senhas nunca voltam no estado da ação.
- **[2026-09-28]** **Do protótipo de Configurações, quatro coisas não entraram, e uma
  delas porque é falsa.** *"Nome da consultoria":* coluna nova que nenhuma tela leria.
  *2FA:* o Supabase tem, mas é um fluxo inteiro (cadastro do fator, desafio no login,
  recuperação); um interruptor que não protege nada é pior que nenhum. *"Última
  alteração há 3 meses":* o Supabase não guarda quando a senha mudou. *"Sua conta está
  protegida por criptografia de ponta a ponta":* **não é verdade** — o banco lê os
  dados, é assim que o personal vê o treino do aluno —, e tela de segurança é o último
  lugar para uma frase falsa.
- **[2026-09-26, decisão do Otávio]** **Aluno inativo perde o acesso ao app.** O dado
  histórico fica — não se apaga nada —, mas o login é limitado até ele voltar a pagar.
  Duas camadas: o **banco** tranca a escrita (migration 0036) e a **tela** explica
  (`(ativo)/layout.tsx` + `AcessoPausado`). A trava de verdade é a primeira; um POST
  direto não passa por layout nenhum.
- **[2026-09-26]** **Perfil e histórico ficam abertos, e não por esquecimento.** A
  política de privacidade publicada promete, em "Seus direitos", que "seu perfil e seu
  histórico estão todos lá, o perfil é editável" — corrigir dado errado sobre si e ver o
  que se levantou são direitos da LGPD, não itens de assinatura. Trancá-los faria do
  texto publicado uma mentira, que é o mesmo defeito de 14/09 de cabeça para baixo: lá o
  texto prometia o que a tela não fazia, aqui a tela tiraria o que o texto promete.
- **[2026-09-26]** **Route group `(ativo)`, e não um `if` em cada página.** A autorização
  mora no layout — mas não podia morar no layout **de cima**, porque `/app/perfil` e
  `/app/historico` são irmãos das rotas fechadas e continuam abertos. `(ativo)` não muda
  nenhuma URL: é uma cerca em volta do que é produto. O `requireStudent()` do layout de
  dentro não custa consulta a mais: ele é `cache()` por requisição desde o M0.
- **[2026-09-26]** **A trava do treino é só no `insert`, e isso é deliberado.** Quem for
  arquivado com um treino aberto no celular precisa conseguir fechá-lo e mandar as séries
  que ficaram na fila do aparelho — bloquear o `update` transformaria a trava em perda de
  dado **dele**, e o que se quer é que ele pare de treinar, não que perca o que levantou.
  Sem poder abrir sessão nova, isso acontece no máximo uma vez. É a única exceção à regra
  de "insert e update juntos", e ela existe porque as duas escritas fazem coisas
  diferentes aqui: uma começa, a outra encerra.
- **[2026-09-26]** **`private.aluno_ativo()` é escrita sobre `minha_turma()`**, e não com
  um `status = 'ativo'` de novo. Duas cópias da mesma condição divergem no dia em que
  "ativo" deixar de ser o único valor que vale — e aí uma policy liberaria o que a outra
  recusa, em silêncio. Mesma razão de `pode_ver_post` e `nomes_no_feed` dividirem a regra
  desde a 0020.
- **[2026-09-26]** **O personal continua comentando e curtindo o post do aluno
  arquivado.** `post_comments_insert` e `post_likes_insert` ganharam
  `aluno_ativo() or trainer_of(dono do post)`: a trava é sobre quem **é** aluno, e o
  personal não é aluno de ninguém. Sem o segundo ramo, arquivar um aluno calaria o
  personal embaixo das fotos que ele já tinha comentado.
- **[2026-09-26]** **A tela não diz "arquivado", não diz por quê, e não é beco sem
  saída.** "Arquivado" e "inativo" são palavras do painel — do lado do aluno soam como
  punição e não explicam nada; "pausado" diz o que é: interrompido e reversível. E o
  produto **não sabe** o motivo (não há cobrança no modelo de dados), então chutar "sua
  mensalidade venceu" seria inventar um fato sobre a vida de alguém. Quem sabe é o
  personal, e é para ele que o botão aponta. As duas portas que continuam abertas
  aparecem como link, porque tela que tranca sem mostrar a porta faz o usuário achar que
  perdeu tudo.
- **[2026-09-26, do screenshot de novo]** **Personal sem WhatsApp cadastrado transformava
  a tela de pausa em beco sem saída.** O `CardDoPersonal` perde o botão quando não há
  número — regra certa desde 15/09 —, mas nesta tela, cujo assunto inteiro é "fale com
  ele", perder o botão é perder a saída. A frase de apoio passa a dizer que o caminho
  existe fora do app. Segunda vez na mesma semana que o defeito aparece **no par de
  estados**, não no estado que eu fui escrever: ver os dois lado a lado é o que mostra.
- **[2026-09-26]** **O portão dos termos vem antes do portão da pausa**, porque ele está
  no layout de cima. É a ordem certa: o aluno pausado continua lendo o próprio histórico e
  o próprio perfil, e ler dado sob termos que ele não aceitou seria pior que a estranheza
  de aceitar termos de um app que está pausado. Registrado porque parece errado à primeira
  vista.
- **[2026-09-26]** **`students.status` existia em três valores e o feed nunca olhou para
  ele.** O personal arquivava um aluno — a carteira mostrava "Inativo", o dashboard parava
  de contá-lo, o alerta de inatividade o pulava — e no app dele **nada mudava**: continuava
  vendo foto, legenda e comentários de toda a turma, e continuava publicando para ela. Não
  era decisão antiga que ficou para trás; era uma pergunta que nenhuma tela e nenhuma
  policy chegaram a fazer. A política de privacidade, publicada e aceita por três pessoas,
  já dizia o contrário: "**os outros alunos do seu personal**, e apenas eles". Migration
  0035.
- **[2026-09-26]** **Filtra quem OLHA, não quem escreveu** — e a assimetria é o ponto. O
  arquivado deixa de ver a turma; os posts que ele **já publicou** continuam visíveis para
  quem já os via. Filtrar pelo autor apagaria da tela dos colegas um post que eles viram
  ontem, comentaram e curtiram: a promessa da política foi feita a eles também, e
  histórico não some porque um terceiro mudou de status. Provado nos dois sentidos —
  arquivado vê 0 posts e 0 nomes da turma, e o colega ativo continua vendo o post antigo
  dele **com o nome**.
- **[2026-09-26]** **A trava nova é função nova, e é por isso que ela não quebrou nada.**
  A tentação era pôr `status = 'ativo'` dentro de `private.my_trainer_id()`. Aquela função
  sustenta `students_update` (**no `with check`**), `trainers_select` e `exercises_select`:
  com ela devolvendo nulo, o arquivado perderia a edição do próprio perfil e deixaria de
  enxergar a linha do próprio personal — trava certa no lugar errado, estragando telas que
  funcionavam. `private.minha_turma()` é estreita e só responde "qual é a minha turma
  agora", usada por `pode_ver_post` e `nomes_no_feed`, que precisam concordar (0020).
  Consertar `pode_ver_post` consertou de graça **cinco** outros lugares que passam por ela,
  inclusive a policy de leitura do bucket `treinos` — ou seja, a foto também.
- **[2026-09-26]** **Sétima vez do mesmo formato, e a primeira em que eu criaria o furo.**
  Trancar só `posts_insert` deixaria o arquivado gravar como `personal` e virar `publico`
  por `update` na linha seguinte. Depois de 0007, 0009, 0010, 0019, 0022 e 0030, a regra
  agora é reflexo: **toda coluna que a trava lê precisa estar no `with check` dos dois.**
  Provado: publicar para a turma recusado, falar só com o personal permitido, virar público
  por update recusado, comentar e curtir post da turma recusados.
- **[2026-09-26]** **Isto NÃO subiu a versão dos documentos, e a razão importa.** A regra
  escrita em `documentos.ts` manda subir quando muda "com quem se compartilha" — e aqui
  mudou: o compartilhamento **encolheu**. Consentimento dado cobre o alcance maior; exigir
  re-aceite por uma restrição de privacidade seria um portão cobrando concordância para
  algo que protege quem concorda. Sobe a versão o que amplia; o que aperta não.
- **[2026-09-26, do screenshot]** **A frase errada não era a que eu fui corrigir.** Ao
  acrescentar o terceiro estado vazio do feed ("A turma não aparece mais"), a frase da aba
  **privada** continuou dizendo "a não ser que você escolha mostrar para a turma" — escolha
  que o compositor tinha acabado de parar de oferecer. Eu só vi porque tirei os quatro
  vazios num screenshot só, lado a lado. É a mesma lição de 17/09 com outra cara: caminho
  novo não transforma em mentira **um** estado vazio, transforma todos os que ele alcança —
  e ler o código não mostra isso, ver as telas juntas mostra.
- **[2026-09-18, decisão do Otávio]** **`students` ganhou telefone, cidade/UF, meta de
  peso e perfil biológico** (migration 0034), os quatro informados **pelo aluno**. O
  perfil biológico (natural / reposição / hormonizado) é **dado de saúde sensível pela
  LGPD**: guardar isso obriga a declarar, então a política de privacidade e os termos
  passam a descrever os quatro campos, `VERSAO_DOS_DOCUMENTOS` foi para `2026-09-18` e
  todo mundo passa pelo portão de re-aceite. **Não existe valor `nao_informado` no enum**
  — "não informado" é a ausência do dado, e é isso que `null` quer dizer; um quarto valor
  faria o banco guardar uma afirmação onde só há silêncio, e as duas coisas se contariam
  separado no dia em que alguém somar.
- **[2026-09-18]** **`students_update` sempre deixou o personal escrever na linha do
  aluno, e isso passou a importar.** O ramo `trainer_id = auth.uid()` existe desde a 0001
  e é o que permite arquivar e reativar; já valia para peso e altura e ninguém tinha
  reparado. Com o perfil biológico a consequência muda de tamanho: um personal registrando
  sozinho que alguém faz reposição hormonal é **uma suposição sobre o corpo de outra
  pessoa gravada como fato**. O gatilho `students_dado_do_corpo` recusa a mudança de
  `biological_profile` e de `weight_goal_kg` quando quem escreve não é o dono da linha —
  e o personal continua editando o resto. É a mesma regra de
  `student_measurements_insert` ("o número tem que vir de quem mediu") e o **terceiro
  gatilho pelo mesmo motivo de sempre**: o `using` do RLS vê a linha antiga e o
  `with check` a nova, e nenhum dos dois diz "esta coluna não pode **mudar** a não ser
  que…". Provado com nove casos, dois deles de burla direta — o personal tentando escrever
  cada uma das duas colunas, recusado com 42501.
- **[2026-09-18]** **A barra da meta de peso mede do peso inicial até a meta, não do
  zero.** "75 de 70 kg" não é 107% de nada: o que importa é quanto do caminho combinado já
  foi andado, e o caminho começa onde a pessoa estava. O inicial sai da **reavaliação mais
  antiga** que trouxe peso — e sem consulta nova, porque a lista já está na tela —, com o
  peso de cadastro como reserva. Quem anda para o lado errado fica em 0 e quem passou da
  meta fica em 1: barra negativa não existe, e barra cheia é a resposta certa para
  "chegou". **E não é pintada de verde nem de vermelho**, pela mesma razão da variação da
  medida (15/09): perder dois quilos é vitória para um objetivo e prejuízo para outro.
- **[2026-09-18]** **Os quatro indicadores da carteira não são de cobrança, e o quarto
  mudou de pergunta.** O protótipo mostra "Renovações · vencendo nos próximos 7 dias" e
  "24 de 40 vagas do plano"; não há plano, preço nem pagamento no modelo, e o "40" seria
  inventado — número falso no lugar mais visível da tela é o oposto do que um indicador
  serve. No lugar entra **quem precisa de atenção**, com o limiar que o personal
  configurou, e é o único dos quatro que vira link, porque é o único que é fila de
  trabalho. `novosNoMes` é contado **no servidor**: é dia de calendário no fuso do produto,
  e a tabela é componente cliente — a mesma razão de `dias_sem_treinar`.
- **[2026-09-18]** **Ordenação de tabela: o que não tem valor vai para o fim nas duas
  direções, e o primeiro clique entra pela ordem mais útil da coluna.** "Nunca treinou" e
  "sem aderência" não são zero nem infinito, são a ausência do número; jogá-los no topo do
  crescente abriria a tabela com quem não dá para avaliar. E em "última sessão" e
  "aderência" o primeiro clique desce, não sobe: quem interessa é o extremo ruim — quem
  está sumido há mais tempo e quem está treinando menos. `localeCompare` com `pt-BR` no
  nome, senão "Ângela" cai depois de "Zeca".
- **[2026-09-18]** **Botão que manda para outra tela precisa que a outra tela saiba
  disso.** "Agendar sessão" na ficha do aluno leva a `/painel/agenda?aluno=<id>` — e a
  agenda não lia esse parâmetro. Seria a quarta vez do mesmo defeito ("promessa de tela
  sem tela"), só que em silêncio: o link funcionaria, abriria a agenda, e o personal
  escolheria o aluno de novo num seletor de trinta nomes. Agora a página confere o id
  **contra a carteira que o RLS devolveu** e abre o diálogo já preenchido; id torto ou de
  estranho não pré-seleciona ninguém e não vira erro — uma URL errada não deve explodir na
  cara de quem só clicou num botão.
- **[2026-09-18]** **`telefoneDoPersonal` virou `telefoneOpcional` no dia em que o aluno
  ganhou telefone.** O nome antigo empurraria a segunda tela a escrever a própria cópia da
  regra — que é exatamente como as iniciais do nome viraram quatro. O esquema é um só, e
  a coluna nova nasceu com `check` no banco (`^[0-9]{10,15}$`), que `trainers.phone` nunca
  teve: lá a regra vive só no zod desde 2026-08-23.
- **[2026-09-18]** **Os três gráficos do dashboard agregam no banco, não em memória**
  (migration 0033: `alunos_por_mes`, `sessoes_por_dia`, `progressoes_da_carteira`). O
  motivo não é desempenho: é que o **corte de página do PostgREST é silencioso**, e as
  progressões varrem `session_sets` da carteira inteira. Uma página perdida faria a barra
  desenhar menos treino do que aconteceu — número errado com cara de certo, sem erro
  nenhum aparecer. As três são `security invoker` e **nenhuma recebe id de personal**,
  como `sessoes_na_semana`: quem define "a carteira" é o RLS, e um id vindo do cliente
  seria uma segunda fonte de verdade sobre de quem é o dado. Onze provas no banco — cinco
  de burla (outro personal e o aluno em cada função) e seis de caminho legítimo, três
  delas com dado sintético dentro de transação desfeita.
- **[2026-09-18]** **Progressão é comparação de par `(aluno, exercício)`, ordenada por
  percentual.** Em quilos, o agachamento ganharia de toda rosca direta todo mês e o "top
  10" viraria um ranking de exercício pesado em vez de um de evolução. A carga de cada
  sessão é a **série mais pesada** — o mesmo critério do recorde pessoal (decisão do
  Otávio, 02/09) —, porque duas contas para "quanto ele evoluiu" fariam o painel discordar
  da tela que o aluno vê. Quatro exclusões, cada uma com motivo: série pulada e carga nula
  (peso corporal não tem carga para comparar), par com uma sessão só (não há de onde para
  onde), carga inicial zero (seria aumento infinito) e **quem caiu** — uma lista chamada
  "as maiores progressões" que mostra quedas quando faltam dez mente pelo título, e o
  vazio diz a verdade melhor. **Agrupa por `(exercise_source, exercise_id)`**, nunca por
  `workout_exercise_id`: provado com uma segunda prescrição do mesmo exercício em outro
  programa, que virou **uma** linha de três sessões e não duas de uma.
- **[2026-09-18]** **O crescimento da carteira é o acumulado ao fim de cada mês, e o eixo
  começa no zero.** Duas decisões opostas à do gráfico do aluno, e as duas pela mesma
  razão: a pergunta é outra. "Novos alunos por mês" desenharia uma queda em abril só
  porque ninguém entrou, quando ninguém saiu; e cortar o eixo entre o mínimo e o máximo —
  que no gráfico de carga é justamente o que torna a evolução visível — aqui
  transformaria 12 alunos virando 13 numa escalada. **Contagem se desenha a partir do
  zero.** O mês vazio entra por `generate_series` e repete o total anterior, senão o eixo
  pula de janeiro para março e a inclinação da linha mente.
- **[2026-09-18, revisto em 2026-09-27]** **Os gráficos ficam abaixo do que é decisão de
  hoje, ao contrário do protótipo, que os põe no topo.** _Com o layout de duas colunas
  (27/09) isto encolheu para o mínimo: os gráficos voltaram para a coluna da esquerda,
  como no protótipo, e só o alerta "Precisam de atenção" fica entre eles e os números —
  sem ninguém parado ele não desenha nada e os gráficos sobem. O resto do raciocínio
  abaixo continua valendo._ É a aplicação direta da lição de 16/09: o dashboard
  responde "o que mudou hoje" — quem parou, o que aconteceu, quem está devendo reavaliação
  —, e foi por empurrar isso para fora da dobra que a lista de alunos saiu daqui. Tendência
  é a camada seguinte: útil, e nunca urgente.
- **[2026-09-18]** **Gráfico de leitura não vira componente cliente por causa de uma
  dica de mouse.** Os três são servidor, sem uma linha de JavaScript no navegador; o que o
  ponteiro revela é `group-hover` do CSS. O painel abre em toda navegação, e hidratar três
  gráficos em toda visita seria peso por um recurso que o teclado não usa. Por isso **o
  que o mouse revela nunca é a única via para o número**: cada bloco imprime em texto o
  que desenha, e o SVG leva a frase inteira no `aria-label` ("6 treinos concluídos em 3
  dos últimos 30 dias; o dia mais cheio foi qua, 09/09, com 3"). axe-core sem violação
  nem incompleto.
- **[2026-09-18]** **Rótulo de eixo se posiciona na fração do item que nomeia, não por
  `justify-between`.** Com trinta barras e sete rótulos, espaçar por igual põe "09/09"
  debaixo de outra barra — e um eixo que aponta para o dia errado é pior que não ter
  eixo. A conta muda com a forma: a barra ocupa uma faixa e o rótulo vai no meio dela
  (`(i + 0,5) / n`); o ponto da linha é uma coordenada e o rótulo vai em cima dele
  (`i / (n - 1)`). Achado olhando o screenshot, não lendo o código.
- **[2026-09-18]** **O toco do dia sem treino não é dado, é a marca de que existe um dia
  ali.** Ele fica em `border-strong`, que não alcança os 3:1 da WCAG para objeto gráfico —
  e não precisa: quem carrega informação é a barra, em `brand` sobre `surface` (5,38). O
  que diz "ninguém treinou" é o buraco entre as barras e a frase acima delas, não o tom do
  toco.
- **[2026-09-18]** **A navegação do painel é lateral e colapsável, e a barra do topo
  saiu.** Não é preferência de gosto: as duas navegam as mesmas dez páginas, e a barra
  horizontal dava ao painel a silhueta de um *site* onde o protótipo desenha uma
  *ferramenta* — é a diferença de acabamento que mais salta ao comparar, e a única grande
  que **não depende de dado novo nenhum**. A preferência de recolher mora no aparelho
  (`reps:painel:sidebar-colapsada`), lida no inicializador do `useState` com o padrão
  `useMontado()` + troca de `key`: ler no render de hidratação daria HTML diferente do
  servidor, e ler em efeito é `setState` em efeito, que o lint recusa.
  **Quatro detalhes que só aparecem depois de medir no navegador:**
  (1) o marcador de 3px do item ativo é **fora do fluxo** (`absolute`) — em fila, ele
  empurrava o ícone 3px para fora do centro da faixa de 68px, e o desalinhamento é
  visível justamente no estado em que só o ícone identifica a página;
  (2) `LayoutGrid` e `LayoutDashboard` desenham **a mesma grade de quatro quadrados**, e
  na faixa recolhida não há rótulo para desempatar — "Exercícios" virou `Library`;
  (3) o item ativo é a **rota mais específica** que casa, senão "Painel" ficaria aceso em
  toda tela, porque toda rota do painel começa por `/painel`;
  (4) o marcador é retângulo em `brand`, não a cor do texto: cor sozinha não é sinal para
  quem não distingue vermelho. Conferido no navegador: 236/68px, preferência sobrevivendo
  ao recarregar, foco percorrendo os dez itens, **axe-core sem violação nem incompleto**.
- **[2026-09-18]** **Terceiro par de iniciais, e o comentário que previa isso estava
  escrito no arquivo certo.** O pé da sidebar recolhida mostra as iniciais do personal, e
  eu escrevi uma quarta cópia da mesma regra dentro do componente — `lib/domain/nome.ts`
  já dizia, em comentário, "o dia em que um componente cliente precisar das mesmas
  iniciais ele importa daqui". A lição não é "reusar função": é que **comentário que
  descreve um uso futuro só serve se alguém for ler o arquivo** — e quem escreve a tela
  nova não vai. O que faz a regra ser uma só é ela estar no lugar óbvio com o nome óbvio.
- **[2026-09-18]** **Três coisas da sidebar do protótipo não foram construídas, e nenhuma
  por falta de tempo.** *Busca global:* não existe busca que atravesse alunos, treinos e
  exercícios, e um campo que abre e não acha nada é pior que campo nenhum. *Card "Plano
  Pro · 24/40 alunos":* pressupõe que o Reps Club cobra do personal — não há plano, preço
  nem pagamento em lugar nenhum do modelo de dados, e o número "40" seria inventado.
  *Alternador de tema:* os tokens `dark-*` existem para a tela de execução do treino, no
  celular, na academia; modo escuro do painel é revisar cada um dos componentes, não uma
  classe no `<html>`. Registrado aqui para não voltar como "faltou".
- **[2026-09-18, decisão do Otávio]** **A fonte da interface é Inter.** O doc 04 pedia
  Archivo e deixava a escolha em aberto ("decida com o Otávio"); a Inter já estava no ar
  desde o M0, sem decisão registrada. Agora está: **Inter**, e Archivo sai do escopo.
  **O custo, medido e aceito:** a Inter é uma família de UI deliberadamente neutra e a
  Archivo é uma grotesca com personalidade — a 800/26px com `-0.02em`, que é o título de
  toda tela, a diferença entre as duas é o maior fator isolado de "as telas não parecem o
  protótipo". Não é defeito: é a escolha.
- **[2026-09-18, corrigido em 2026-09-27]** **Os protótipos `.dc.html` renderizam, sim —
  só não do jeito óbvio.** São apps React que buscam `react@18.3.1`, `react-dom@18.3.1` e
  `@babel/standalone@7.29.0` do unpkg, que a política de rede bloqueia. O registro do npm
  **não** é bloqueado: `npm pack` dos três pacotes numa pasta de rascunho e um
  `page.route("**/unpkg.com/**")` do Playwright servindo os arquivos locais fazem o
  protótipo abrir inteiro no Chromium, com fonte e tudo. O que estava registrado aqui ("não
  renderizam, e nunca renderizaram") valeu por um mês de conferências feitas só pelos
  markdown — **e foi por isso que o acabamento derrapou**: a estrutura batia porque os docs
  descrevem estrutura, e o acabamento só a imagem mostra. Desde 27/09, comparar é
  screenshot lado a lado, medido no código do protótipo.
- **[2026-09-18]** **A paleta divergiu do protótipo em exatamente cinco cores, e as cinco
  do protótipo reprovam em AA.** Medido: cinza secundário `#9a9a95` sobre branco = 2,83;
  terciário `#84847f` = 3,76; branco sobre o vermelho `#ff2a2a` = 3,74; verde `#1f9d57`
  sobre canvas = 3,17; âmbar `#d4a331` = 2,10. Os meus equivalentes dão 5,77 / 5,36 /
  5,38 / 4,55 / 4,74. **O protótipo nunca passou por auditoria de contraste**; o M4-04
  passou, e foi de 17 violações a zero escurecendo justamente estas cinco. O resto da
  paleta é idêntico byte a byte (`#0a0a0a`, `#54544f`, `#fafafa`, `#e8e8e3`, `#232323`,
  `#3a3a3a`, `#f4f4f2`, `#e7e7e2`), e raios (14/12/16) e escala tipográfica também batem.
  **A diferença não é desleixo, é uma troca** — e reverter é decisão de produto que custa
  a conformidade.
- **[2026-09-17]** **Sexta vez do mesmo formato — e a primeira em que nenhuma policy
  está errada sozinha** (migration 0030). `workout_sessions_delete` exige
  `finished_at is null`, e é essa a trava de "sessão concluída não se apaga" (02/09).
  Só que `workout_sessions_update` **não guarda `finished_at`**: o aluno zera a coluna,
  a sessão volta a "em andamento" e o delete passa. Provado no banco: recusa no primeiro
  delete, `update ... set finished_at = null` afetando 1 linha, segundo delete afetando 1
  linha, e uma sessão com 12 séries desaparecida. Não vaza dado — o aluno apaga o
  **próprio** histórico —, mas **mente para quem depende dele**: o personal abre a ficha
  e o treino ruim não está lá, sem rastro. **A lição nova:** as duas policies estão
  certas isoladamente, e o furo mora na conversa entre elas. Ao ler uma trava que depende
  de uma coluna, procurar **quem mais escreve naquela coluna**.
- **[2026-09-17]** **Congelar exige gatilho, não policy — de novo.** É a mesma razão de
  `assessments_imutavel`: o `using` do RLS enxerga a linha antiga e o `with check` a
  nova, mas nenhum consegue dizer "o valor novo não pode ser nulo **se** o antigo não
  era". Quem compara as duas é o gatilho. `workout_sessions_imutavel` congela o que é
  fato da execução e o personal lê como verdade — começo, fim, duração, treino, aluno —
  e **deixa `notes` livre**, pela mesma divisão da 0026: a observação é a voz do aluno
  sobre o próprio treino e não reescreve nenhum número que o personal usou para decidir.
- **[2026-09-17]** **`workout_sessions.notes` existia desde a 0001 e nunca recebeu uma
  linha** — terceira coluna com a intenção escrita no schema e nenhuma tela preenchendo,
  depois de `posts.session_id` e `trainers.phone`. O menu ⋮ da execução (doc 05 §5), que
  o handoff pedia e nunca existiu, passa a preenchê-la. O valor é de produto: o personal
  vê a carga cair de 60 para 40 e **não tem como saber** se foi lesão, sono ruim ou
  preguiça — e o produto inteiro existe para ele saber o que o aluno de fato fez. A
  observação é lida na **mesma tela** que os dois lados compartilham
  (`TelaSessaoDoHistorico`), com rótulo neutro: "sua observação" soaria errado para o
  personal, "observação do aluno" para o aluno.
- **[2026-09-17, decisão do Otávio]** **O personal também aceita os termos** — e o
  caminho não existia. `private.handle_new_user` gravava `term_acceptances` a partir de
  `termos_versao`, mas **dentro do ramo do aluno**, e o ramo do personal dá `return new`
  antes de chegar lá: nenhum personal jamais teve linha de aceite, embora os termos falem
  dele em cada seção. Não era policy — `term_acceptances_insert` sempre foi
  `user_id = auth.uid()`, neutro de papel. O bloco subiu para **antes** dos ramos
  (migration 0032): um lugar só, senão o papel que ficasse para trás seria descoberto por
  auditoria, não por erro de tela. O portão de re-aceite entrou no layout do painel, pelo
  mesmo motivo que está no do app: é o único lugar por onde toda tela passa.
- **[2026-09-17]** **O aceite é por `user_id`, e é isso que faz o personal que treina a
  si mesmo aceitar uma vez só.** `students.id = trainers.id = auth.users.id` na conta do
  Otávio, então o aceite que ele deu pelo app do aluno **já vale** para o painel — ele não
  vê dois portões. Não foi projetado, caiu de graça de a tabela apontar para `auth.users`
  em vez de para `students`; fica registrado porque o dia em que alguém "arrumar" a chave
  para apontar ao papel, isso quebra.
- **[2026-09-17]** **Texto com efeito jurídico não se copia entre telas.** O checkbox de
  aceite eram quarenta linhas dentro do onboarding do aluno; virou
  `components/aceite-dos-termos.tsx` antes de o cadastro do personal precisar dele. Duas
  cópias de uma frase que vincula juridicamente divergem na primeira revisão, e a
  diferença aparece numa auditoria, não numa tela quebrada. Mesmo motivo de
  `O_QUE_MUDOU` e `O_QUE_NAO_MUDA` serem **um objeto por papel** e não duas constantes
  soltas: a mudança é a mesma, a leitura é de lados opostos — para o aluno é "guardam
  algo sobre mim", para o personal é "o que eu escrevo fica registrado".
- **[2026-09-17]** **Escrita de aceite em `lib/legal/aceite.ts`, autorização em cada
  lado.** Precedente de `lib/feed/escrita.ts`: `registrarAceite(userId)` é uma só, e
  `app/(aluno)/acoes-de-aceite.ts` e `app/(personal)/acoes-de-aceite.ts` fazem
  `requireStudent()` / `requireTrainer()` antes de chamá-la. Dois arquivos `"use server"`
  e não uma função a mais no do aluno: módulo `"use server"` é fronteira de rede, e a
  autorização de cada lado mora no lado dele.

- **[2026-09-17]** **Num conjunto de caminhos que chegam ao mesmo lugar, a força real é a
  do mais frouxo.** Existiam **três** regras de senha: o cadastro do aluno exigia 8
  caracteres, uma letra e um número; o do personal e a **troca de senha** exigiam só o
  comprimento. Quem tinha senha forte podia trocá-la por "12345678" pela tela de verdade
  — e ninguém olha a tela de recuperação quando pensa em "força de senha". Uma regra só,
  em `lib/domain/senha.ts`, usada pelas três Server Actions, pelos dois textos de apoio e
  pelo medidor do onboarding. **O `SENHA_MINIMA = 8` também estava em duas cópias**, uma
  por arquivo de ação, e o comentário do onboarding já dizia (sobre os campos do perfil)
  que "duas cópias divergiriam": divergiram, só não era o perfil.
  **O que isto não resolve, e continua na dívida técnica:** a senha fraca ainda passa num
  POST direto à API do Supabase, que não conhece estas regras. Fechar aquilo é
  configuração no painel do Supabase, e a proteção contra senha vazada exige o plano Pro.

- **[2026-09-17, decisão do Otávio]** **O aluno NÃO troca o exercício prescrito.** Com a
  máquina ocupada ele **pula** ou **espera** — e só. O "trocar exercício" do doc 05 §5
  está descartado, não adiado: **não construir, e não "consertar" depois achando que
  faltou.** Quem monta o treino é o personal, e um exercício substituído pelo aluno faria
  o histórico dizer que ele fez o que foi prescrito quando fez outra coisa. O banco já
  concordava: `private.serie_no_treino_da_sessao` (migration 0009) recusa série apontando
  para fora do treino da sessão. As outras três ações do doc entraram no menu.
  **O caminho do "pulou" já existe e está certo:** "Pular exercício" grava as séries que
  faltam como `skipped` — não as some, senão o exercício voltaria como pendente e a barra
  de progresso nunca fecharia —, elas não contam para referência nem para recorde, e a
  tela de sessão mostra **"Série pulada"** como estado próprio, diferente de "Não
  registrada". O personal enxerga a diferença entre abandonar e não chegar lá; o **porquê**
  vai na observação do treino, que agora existe.
- **[2026-09-17]** **`BottomSheet` é componente à parte do `Dialog`, e a diferença não é
  de estilo.** O diálogo do painel é uma caixa centrada num desktop; a folha da execução
  encosta na borda de baixo, respeita a área segura do aparelho e se apoia no polegar —
  e roda no tema escuro, então reaproveitar o `Dialog` exigiria condicionar cada cor dele
  por uma prop. Os dois são `<dialog>` nativo pelo mesmo motivo: foco preso, Esc e o
  resto da página inerte saem de graça.
- **[2026-09-17, do teste de campo]** **Funcionalidade nova transforma em mentira um
  estado vazio que estava certo.** O card "está sem programa — e sem treino no app" foi
  escrito quando "sem programa ativo" e "sem programa nenhum" eram a mesma coisa.
  Duplicar criou um terceiro estado — tem programa, nenhum ativo — e aí, logo depois de
  copiar um programa para um aluno, a primeira coisa da seção dele **afirmava o oposto**
  e oferecia "Criar programa", refazer à mão o que estava pronto duas linhas abaixo. A
  etiqueta "Arquivado" estava lá, no DOM e acima da dobra; ninguém olhava para ela.
  Agora, com arquivado na lista, o texto diz "não tem nenhum programa **ativo** — ative um
  dos que estão logo abaixo" e o botão some. **Ao acrescentar um caminho que cria dado,
  reler os estados vazios que aquele dado agora preenche.**
- **[2026-09-17]** **Duplicar programa é uma transação só, e a cópia nasce arquivada.**
  Copiar um macrotreino é 1 `mesocycles` + N `workouts` + M `workout_exercises`
  (`duplicar_macrotreino`, migration 0029). Em passos soltos pela Server Action, uma
  falha no meio deixa um programa que **existe e parece real** — aparece na lista, abre,
  e tem dois dos cinco treinos; o personal ativa, e o aluno vai à academia sem o treino
  de quinta. Mesma decisão de `ativar_macrotreino` e de `enviar_reavaliacao`.
  **`security invoker`**, como a 0012: leitura e escrita passam pelo RLS de quem chamou,
  e a função não alarga o acesso de ninguém. Três coisas **não** se copiam, e cada uma
  por um motivo: `started_at` (a semana da rotação sai dele, então herdar faria a cópia
  nascer na semana 5 de 8), `trainer_id` (a cópia é de quem copiou) e o histórico de
  execução — `workout_sessions` é o que o aluno levantou, e trazê-lo junto daria ao aluno
  novo um passado que não é dele e ao personal um recorde inventado.
- **[2026-09-17]** **Duplicar macrotreino É o "atribuir a um ou vários alunos" do doc 06
  §5** — dar um programa a outro aluno é copiá-lo para ele, e duas telas para a mesma
  operação seriam duas. Um aluno por vez, e não uma lista de caixinhas: cada cópia nasce
  arquivada e quase sempre leva um ajuste antes de ativar, então "vários de uma vez" só
  pareceria mais rápido — a segunda metade do trabalho continuaria uma a uma. O botão
  aparece **também no programa arquivado**, que é justamente o modelo que o personal
  guardou para reusar: escondê-lo lá tiraria o caso mais comum.
- **[2026-09-17]** **A letra do treino tem duas implementações da mesma regra, e isso é
  deliberado.** `proximaLetraLivre` (`lib/domain/treino.ts`) sugere a letra no campo do
  editor; o SQL de `duplicar_treino` a atribui dentro da transação da cópia. São
  trabalhos diferentes — sugestão que o personal sobrescreve digitando, contra atribuição
  que precisa acontecer junto com o insert. Se discordarem, o pior é o campo vir com uma
  letra diferente da que a cópia escolheria; ninguém fica sem treino. É o oposto de
  `nomes_no_feed`, onde duas regras discordando faziam aparecer post sem nome — lá a
  duplicata era proibida, aqui é barata.
- **[2026-09-17]** **`no_data_found` em PL/pgSQL é `P0002`, não o `02000` do padrão SQL.**
  Duas provas da 0029 "falharam" por expectativa minha errada, não por defeito: as burlas
  recusaram certo. O código é o mesmo que `ativar_macrotreino` levanta desde a 0012.
- **[2026-09-17]** **Reordenar exercício é por setas ↑↓, não por arraste** — o doc 06 §5
  pede arraste e o editor entrega o mesmo resultado com dois botões. Divergência
  consciente: arraste exige biblioteca ou muito código próprio, e é pior para teclado e
  para leitor de tela num painel que já passou por auditoria de acessibilidade. O que o
  doc quer é reordenar; o gesto é meio.
- **[2026-09-17]** **A anotação do personal é tabela própria porque `students` é
  legível pelo aluno.** `students_select` devolve a ele a própria linha inteira, então
  uma coluna `observacoes` ali seria lida pelo app do aluno na primeira consulta — e a
  anotação profissional de quem treina alguém deixa de ser escrita com honestidade no
  segundo em que o avaliado lê. `trainer_notes` (migration 0028) não tem policy de select
  para o aluno: com RLS ligado, **a ausência é a trava**, como em `term_acceptances`.
  O nome diz de quem é a caneta — ao lado de `student_measurements` (medidas *do* aluno,
  escritas *pelo* aluno), um `student_notes` leria como anotação do aluno. Provado com 13
  casos: seis de burla (o aluno lendo, escrevendo e apagando; outro personal lendo,
  escrevendo e editando) e sete de caminho legítimo.
- **[2026-09-17]** **Apagar e editar são permitidos aqui, ao contrário de sessão e de
  reavaliação.** Lá o registro fechado é histórico de que **outra pessoa** depende: o
  aluno perde a evolução, o personal perde a comparação. Aqui ninguém mais lê e nenhum
  número do produto sai da anotação, então travar só obrigaria a esvaziar o texto para
  fingir que sumiu. A regra não é "registro não se apaga", é "não se apaga o que o outro
  já leu".
- **[2026-09-17]** **O cadeado na tela é parte da funcionalidade, não enfeite.** Um campo
  de texto numa ficha não diz a quem pertence, e o personal só escreve "não confio na
  execução dele no agachamento" se souber que o aluno não lê. Quem garante é o RLS; quem
  faz ele **confiar** é a linha "só você vê" no cabeçalho e a dica embaixo do campo. Sem
  elas o campo existe e vira lugar de elogio.
- **[2026-09-17]** **Guardar dado sobre alguém obriga a dizer que ele existe — e a regra
  de quando subir a versão já estava escrita.** `documentos.ts` diz: "mudar o que se
  coleta, com quem se compartilha ou por quanto tempo se guarda" sobe a data. A anotação
  muda o que se coleta, então `VERSAO_DOS_DOCUMENTOS` foi para `2026-09-17` e **todo aluno
  passa pelo portão de re-aceite na próxima visita**. Subir agora, com o piloto começando,
  custa quase nada; subir com trinta alunos custa trinta portões. A política declara a
  anotação em quatro lugares — o que se coleta, quem vê, o que a exclusão leva e os
  direitos —, e diz a verdade inteira: o aluno não vê pela tela, mas pode pedir o que está
  escrito. É o par da decisão de 14/09 (texto legal é contrato com a tela), agora no
  sentido inverso: **tela que coleta sem o texto declarar é o mesmo defeito de cabeça
  para baixo.**
- **[2026-09-17]** **Nem typecheck nem lint pegam `server-only` importado por componente
  cliente; só o `build`.** `LIMITE_DAS_OBSERVACOES` nasceu em `lib/queries/observacoes.ts`
  por ser o `limit()` daquela consulta, e a tela que mostra "as 50 mais recentes" é
  cliente. Terceira vez que o mesmo formato aparece, depois de `PERIODOS` e de
  `iniciaisDe`. **Dado de tela mora em `lib/domain/`, mesmo quando "pertence" à consulta.**
- **[2026-09-16]** **O dashboard responde "o que mudou hoje"; a carteira tem endereço
  próprio.** A lista de alunos saiu de `/painel` para `/painel/alunos` (doc 06 §3), com
  tabela, busca e filtro por status. Não é organização: enquanto a lista morava no
  dashboard, ela empurrava tudo abaixo dela para fora da dobra **a cada aluno novo** — o
  bloco mais útil da tela sumindo à medida que o produto dá certo. No lugar dela entraram
  os dois pedaços que o doc 06 §2 pedia desde o começo e nunca foram feitos: o quarto
  indicador (**reavaliações pendentes**, o único que vira link, porque é o único que é
  fila de trabalho) e **atividade recente**. O menu tinha nove `<Link>` iguais escritos à
  mão, e foi assim que "Alunos" continuou apontando para `/painel`; virou lista.
  **O que o doc 06 pede aqui e não foi feito:** o "assistente de novo aluno". O aluno
  preenche o próprio perfil no onboarding e o personal não monta treino antes do
  cadastro (decisão de 13/09), então o assistente seria o diálogo de convite com mais
  passos.
- **[2026-09-16]** **Busca e filtro da carteira rodam na tela, não no banco** — e é por
  isso que a conta de "há quantos dias" **não** roda junto. A lista inteira já veio para
  montar a tabela, e um `ilike` por tecla digitada seria uma ida ao banco para reduzir o
  que já está na memória (`filtrarAlunos`, `lib/domain/carteira.ts`). Mas dia de
  calendário é outra coisa: `diasSemTreinar` conta no fuso do produto, e a tabela é
  componente cliente — contar ali usaria o fuso e o relógio do aparelho, daria um número
  diferente do bloco "precisam de atenção" na tela ao lado, e ainda arriscaria divergir
  entre o render do servidor e o da hidratação. O servidor manda o número; a tela só
  conjuga a frase.
- **[2026-09-16]** **A linha da tabela é clicável pelo `::after` do link do nome**, não
  por `onClick` no `<tr>`. `<tr onClick>` daria o clique e mais nada: sem foco pelo
  teclado, sem menu de contexto, sem abrir em outra aba. E `<table>` de verdade, não
  grade de `<div>`: o cabeçalho de coluna é o que dá nome a cada célula para quem usa
  leitor de tela, e numa grade "72%" seria lido sem dizer 72% de quê.
- **[2026-09-15]** **A agenda é o registro de quem veio, não um convite.** O personal marca
  a sessão e depois marca o que aconteceu (`realizada`, `faltou`, `cancelada`); o aluno
  **lê** a própria e não escreve nada — marcar a própria presença é assinar a própria
  chamada. Quem combina horário são duas pessoas conversando, e transformar isso em fluxo
  de aceite dentro do app criaria um estado ("pendente") capaz de discordar do que já foi
  combinado no WhatsApp. A tela do personal promete que o aluno vê a próxima sessão na home
  dele, então a linha na home do aluno **faz parte da mesma fatia** — promessa de tela sem
  tela é o defeito que este projeto já cometeu três vezes.
- **[2026-09-15]** **Horário sobreposto é avisado pela tela, não impedido pelo banco.** Duas
  sessões no mesmo horário podem ser erro de digitação ou dois alunos treinando juntos, e só
  o personal sabe qual — uma constraint de exclusão recusaria o atendimento em dupla, que é
  comum, para evitar um engano que ele enxerga na hora. O aviso compara **relógio local**
  (dia + minuto do dia), nunca instante: quem avisa é componente cliente, e
  `new Date("2026-09-15T18:00")` no navegador usa o fuso **do navegador**.
- **[2026-09-15]** **A semana da agenda começa na segunda do calendário**, ao contrário da
  semana do macrotreino, que sai do `started_at` do programa. Não é inconsistência: a do
  macrotreino é uma janela de sete dias corridos daquele aluno; a agenda é um calendário, e
  "essa semana" para quem olha uma agenda começa na segunda. As duas convivem em
  `lib/domain/` com nomes diferentes (`janelaDaSemana` e `semanaDe`) para ninguém trocar uma
  pela outra.
- **[2026-09-15]** **Sessão presencial fechada não se apaga** (`appointments_delete` exige
  `status = 'agendada'`). "Faltou" é o registro mais incômodo da agenda e por isso o mais
  fácil de querer sumir depois — e é ele que dá sentido à aderência. Desmarcar de verdade é
  mudar o status para `cancelada`, que deixa rastro. Mesma decisão de
  `workout_sessions_delete`.
- **[2026-09-15]** **O WhatsApp do personal é a única via do aluno para falar com ele, e
  mora em `trainers.phone`** — coluna que existia desde a 0001 e que **nenhuma tela
  escrevia**. O app não tem mensagem e nem deveria ter: a conversa já acontece onde essas
  duas pessoas se falam. O número é guardado só com dígitos e **sem o 55**, para o mesmo
  número não entrar de duas formas e para a leitura conseguir formatar "(11) 99999-9999";
  `lib/domain/telefone.ts` recoloca o código do país ao montar o link. Personal sem número
  informado não vira botão quebrado, vira card sem botão. Sem número o card continua — ele
  diz quem treina o aluno, e sumir por falta de telefone faria a tela mudar de forma por um
  dado que não é do aluno.
- **[2026-09-15]** **A reavaliação é um formulário de mão dupla numa linha só, e ela
  congela ao ser enviada.** O personal cria a linha com `released_at` e mais nada; o aluno
  preenche peso, percentual, medidas, fotos e observação e fecha com `submitted_at`.
  **O personal não digita medida do corpo de ninguém** — o número tem que vir de quem
  mediu, e `student_measurements_insert` recusa o personal. Congelar importa porque o
  valor da reavaliação é a comparação com a anterior: resposta reescrita depois de lida
  transforma a seta "72,0 → 74,5 kg" que o personal viu em outra coisa, sem aviso. É a
  mesma regra de `workout_sessions` — registro fechado é histórico. **RLS não congela
  nada**: ele olha a linha nova, não a antiga; quem compara é o gatilho
  `assessments_imutavel`. Uma aberta por aluno é índice parcial, pelo mesmo motivo de
  `mesocycles_um_ativo_por_aluno_idx`. Responder é uma transação só
  (`enviar_reavaliacao`): N medidas mais o fechamento em passos soltos deixam metade
  gravada e a tela sem saber o que já foi.
- **[2026-09-15]** **Congelou, menos as fotos** (migration 0026). Depois do envio a única
  escrita aceita é os três caminhos de foto virarem **nulos** — trocar uma foto por outra
  não passa, nem apagar a foto e corrigir o peso na mesma escrita. O motivo é a política
  de privacidade: ela promete, para a foto do feed, que "você apaga quando quiser", e
  abrir uma segunda tela que tira três fotos do corpo sem o mesmo botão seria a terceira
  vez que o texto legal andaria à frente da tela aqui. Os números ficam: são a comparação
  que o personal usa. Com isso o `using` da policy de update largou o `submitted_at is
  null` — duas travas para a mesma regra, em lugares diferentes, é como uma afrouxa sem
  ninguém notar, e a do gatilho é a que sabe comparar com o valor antigo.
- **[2026-09-15]** **A variação da medida não é pintada de verde nem de vermelho.** Dois
  centímetros a menos na cintura é vitória para quem quer perder gordura e prejuízo para
  quem quer ganhar massa; dois a mais no braço, o contrário. Só o personal sabe o que foi
  combinado, e colorir seria o app dando um parecer que não é dele. A tela mostra a seta e
  o número; o julgamento vai no comentário.
- **[2026-09-15]** **Bucket `reavaliacoes` separado do `treinos`.** Não é organização: a
  regra de leitura é outra. No feed, a policy casa o caminho com `posts.photo_path` e a
  visibilidade do post; aqui alcança o aluno dono e o personal dele, e mais ninguém —
  nem o colega de turma. Misturar as duas regras num bucket só é como uma afrouxa a outra.
  Foto de reavaliação **nunca** vira post: são tabelas, buckets e telas separados.
- **[2026-09-14]** **A foto é oferecida no fim do treino, e o post carrega o treino que
  o gerou.** `posts.session_id` existia desde a 0018, com a intenção escrita no schema,
  e **ninguém preenchia**: o doc 05 §6 pedia "Tirar foto do treino" e "Concluir sem
  foto" na tela de conclusão, e ela só tinha "Concluir". Duas consequências. A de
  produto: o momento de maior intenção do app — acabou de terminar, celular na mão — não
  oferecia nada, e publicar exigia navegar até o Feed meia hora depois. A de identidade:
  sem a sessão, o post é uma foto com legenda como em qualquer rede; com ela, o card
  mostra "A · Peito e tríceps · 16 séries · 4.275 kg", que é a única coisa que este feed
  tem e os outros não. O resumo **não aparece para o colega**: o RLS de
  `workout_sessions` não devolve sessão alheia, e quanto o outro levantou não é assunto
  da turma. A sessão é validada **duas vezes** — na página, que decide o que a tela
  mostra, e na Server Action, que decide o que o banco grava; id inválido não derruba a
  publicação, vira post avulso, porque recusar o post puniria o aluno por uma URL torta.
- **[2026-09-14]** **Quinta vez do mesmo furo** (migration 0022): `posts_insert` conferia
  `student_id` e deixava `session_id` solto. Não tinha consequência enquanto nada
  preenchia a coluna; passou a ter no mesmo dia em que a tela de conclusão começou a
  preenchê-la. Um POST direto criava post legítimo do próprio atacante **apontando para a
  sessão de um colega** — e como o RLS protege o atacante de ler aquela sessão, o selo
  não aparecia para ele, mas **o personal lê as duas** e veria o post do aluno A rotulado
  com o treino e o volume do aluno B. Não vaza para quem não podia ver: **mente para quem
  podia**, que num produto cujo valor é o registro do que foi levantado é pior. Depois de
  0007, 0009, 0010 e 0019 — e o achado veio de uma prova de comportamento que eu escrevi
  esperando "1" e que revelou o buraco, não de uma releitura da policy.
- **[2026-09-14]** **A política de privacidade é um contrato com a tela, não só um
  texto.** Ela promete em "Seus direitos" que o perfil é editável — e `/app/perfil` era
  só leitura, com um comentário dizendo que editar estava fora de escopo. Corrigir dado
  errado sobre si é direito da LGPD, então a frase publicada fazia da tela um defeito,
  não o contrário. É a segunda vez na mesma semana: "você apaga o post quando quiser"
  também foi escrito antes de o botão existir. **Ao mexer no texto legal, conferir cada
  verbo contra uma tela que faz aquilo.** O que o perfil **não** edita: `trainer_id`
  (`students_update` recusa, e a tela nem envia — mandar para ser recusado seria um erro
  na cara do aluno por algo que nunca foi oferecido) e o e-mail, que é a identidade em
  `auth.users` e muda por fluxo de confirmação, não por update de linha; a tela diz isso
  e dá o canal.
- **[2026-09-14]** **Reescrita mecânica de policy se gera, não se digita** (migration
  0021). As 30 policies com `auth.uid()` solto passaram a `(select auth.uid())` — o
  Postgres deixa de reavaliar a identidade por linha e passa a uma vez por consulta. O
  SQL saiu de `pg_get_expr` sobre `pg_policy` do banco vivo, com duas trocas de texto;
  digitar 30 policies à mão é como o `and` da 0019 vira `or` sem ninguém notar.
  Embrulhar `private.my_trainer_id()` também vale (não recebe nada da linha); os outros
  helpers recebem uma coluna, então rodar por linha é o trabalho deles. **Prova em dois
  níveis:** um diff mecânico das 40 policies antes/depois com o subselect desembrulhado
  (0 diferenças), e 18 casos de comportamento — dez de burla e **sete de caminho
  legítimo**, porque afrouxar e apertar são os dois jeitos de errar isto. E
  `comment on policy` não sobrevive a `drop policy`: os sete comentários que guardam o
  motivo de cada trava foram reescritos na mesma migration.
- **[2026-09-14]** **`/painel/social` é a outra ponta de `visibility = 'personal'`.**
  O compositor do aluno já nascia com "só o meu personal" como padrão — e a política
  de privacidade recomenda essa opção —, mas **nenhuma tela do painel lia posts**: o RLS
  liberava e o post caía num poço. Não era escopo novo, era a metade que faltou da
  fatia anterior; achado relendo o doc 06 antes de escolher o próximo passo, não por
  bug. A tela também é o único lugar onde o personal responde sem virar aluno. Os
  comentários vêm inteiros e não contados: o valor é a conversa, e abrir post a post
  para ler duas linhas seria um toque a mais em cada um. `semResposta` (nenhum
  comentário do personal) é o que a tela destaca no cabeçalho — é a fila de trabalho
  dele.
- **[2026-09-14]** **Escrita que os dois papéis dividem vive em `lib/feed/escrita.ts`**,
  com `import "server-only"`, recebendo o id do usuário pronto. `post_comments.author_id`
  e `post_likes.user_id` apontam para `auth.users`, não para `students`, e as policies da
  0018 tratam aluno e personal igual — mas a **autorização** continua no layout de cada
  lado (`requireStudent()` / `requireTrainer()`), e cada Server Action passa adiante o id
  que ele devolveu. Sem isso seriam duas cópias da mesma regra, que é como elas divergem.
- **[2026-09-14]** **Dado de tela não mora em módulo `server-only`, nem quando "pertence"
  à consulta.** `PERIODOS` (os rótulos "7 dias/30 dias/Tudo") nasceu em
  `lib/queries/social.ts` e quebrou o build assim que um componente cliente importou o
  componente que os renderiza: `'server-only' cannot be imported from a Client Component`.
  Foi para `lib/domain/feed.ts`. A regra já estava escrita em Convenções; o que faltava
  era aplicá-la a **dado**, e não só a texto.
- **[2026-09-14]** **Documento novo exige aceite novo, e o portão mora no layout do
  app do aluno.** `term_acceptances` já guardava uma linha por (usuário, documento,
  versão), append-only (0017) — mas **nada conferia** essa versão depois do onboarding.
  Eu afirmei que o mecanismo existia; existia metade dele. Agora `aceiteEstaEmDia()`
  roda no layout, pelo mesmo motivo que `requireStudent()` roda: é o único lugar por
  onde toda tela passa, e num componente de página o portão seria contornável por uma
  URL digitada. `/termos` e `/privacidade` ficam fora do grupo de rotas do aluno de
  propósito — ler o que se está aceitando não pode depender de aceitar. O portão é
  bloqueante e não faixa dispensável: faixa que se fecha é notificação, não
  consentimento. `O_QUE_MUDOU` vive junto da versão porque quem sobe a data escreve a
  frase — portão que diz só "atualizamos os documentos" faz clicar sem ler.
- **[2026-09-13]** **Nome de quem aparece no feed sai da RPC estreita
  `nomes_no_feed`** (migration 0020), não de `students`. `students_select` devolve ao
  aluno **só a própria linha**, então buscar direto trazia um nome e deixava todo colega
  como "Aluno" — defeito encontrado por SQL, não na tela. Abrir o `students_select`
  entregaria e-mail, peso, altura e objetivo dos colegas para escrever um nome; a chave
  de serviço ignoraria o RLS do banco inteiro. A função **recebe os ids** em vez de
  listar a turma: é preciso já conhecer o id, e o único jeito de conhecê-lo é ter lido
  um post ou comentário que o RLS deixou passar. A regra de turma dela é a mesma de
  `private.pode_ver_post` — se as duas discordarem, aparece post sem nome ou nome sem
  post.
- **[2026-09-13]** **A foto do feed é reduzida no aparelho antes de subir**
  (`lib/imagem.ts`): no máximo 1600px no maior lado, JPEG a 0,82. Medido: 11,8 MB e
  4032×3024 viraram 924 kB e 1600×1200 no pior caso (ruído puro). Resolve três coisas de
  uma vez — a internet da academia, o limite de corpo da Server Action (1 MB por padrão
  no Next; o `next.config.ts` sobe para 6 MB só como rede de segurança) e o **HEIC do
  iPhone**, que não está entre os tipos do bucket e às vezes escapa do conversor do iOS:
  o canvas do Safari decodifica e devolve JPEG. Por isso o `accept` do campo é
  `image/*`, e não a lista do bucket — é a conversão que normaliza.
- **[2026-09-13]** **O personal treina virando aluno de si mesmo**, e não publicando
  "como personal". Decisão do Otávio. Uma linha em `students` com `id` e
  `trainer_id` iguais ao próprio usuário — `students.id` já é o id de
  `auth.users`, então isso sempre foi uma linha válida; faltava a permissão.
  A partir dela ele aparece na própria carteira, monta o próprio macrotreino no
  editor de sempre, executa no app do aluno e posta no feed da turma. **Nenhuma
  tela nova** foi escrita para isso, e **nenhum campo de "modo"** existe: painel e
  app são endereços diferentes, cada um com a sua autorização no layout, então
  trocar de lado é navegar. Um campo "modo atual" criaria um estado capaz de
  discordar da URL. Isso também resolve o selo "PERSONAL" do doc 05, que a
  policy `posts_insert` não permitiria de outro jeito (só aluno publica): a tela
  compara o autor do post com o `trainer_id` de quem olha, sem consulta a mais,
  porque só existe um personal por turma. O limite aceito: o personal entra na
  contagem de alunos do próprio painel e no alerta de inatividade. A linha dele
  vem marcada com "Você" na lista.
- **[2026-09-13]** **Policy de escrita confere as DUAS pontas do relacionamento,
  não só a que aponta para você** (migration 0019). `students_insert` exigia
  `trainer_id = auth.uid()` e deixava `id` livre: um personal inseria
  `students (id = <outro usuário>, trainer_id = si mesmo)` e **alistava um
  estranho na própria carteira**, sem convite — bastava a vítima não ter linha
  em `students`, o que vale para qualquer outro personal. Alistado, o atacante
  lia o perfil, as sessões e (com a 0018) os posts dela. É a quarta vez que o
  mesmo formato aparece, depois de 0007, 0009 e 0010. **Cuidado ao comparar com
  a 0010:** ela tirou desta policy um ramo `id = auth.uid()` unido por `or`, e a
  0019 recoloca `id = auth.uid()` unido por `and`. Com `or` o `trainer_id` fica
  livre e o furo da 0010 volta; com `and` as duas colunas ficam presas ao mesmo
  usuário.
- **[2026-08-31]** Leitura do convite sem sessão usa a função estreita
  `convite_por_token`, não a chave de serviço: a chave ignoraria o RLS do banco inteiro
  se vazasse do ambiente.
- **[2026-09-01]** Policy de escrita confere o **relacionamento**, não só o dono da linha.
  `mesocycles_write` exigia apenas `trainer_id = auth.uid()`, e isso deixava um personal
  qualquer criar macrotreino para aluno alheio — e empurrar treino que o aluno via.
  Migration `0007` acrescentou `private.trainer_of(student_id)`.
- **[2026-09-04]** O macrotreino tem tela própria (`/painel/macrotreinos`) e o treino
  **nasce dentro de um programa**: o editor recebe o programa pela URL e não pergunta
  mais aluno, nome nem semanas. Substitui a muleta do M1, em que o programa era
  nomeado ao salvar o primeiro treino.
- **[2026-09-04]** **Um programa ativo por aluno é índice no banco**, não convenção de
  código (`mesocycles_um_ativo_por_aluno_idx`). É por esse campo que as telas do aluno
  decidem o que mostrar: dois ativos seria a tela errada, em silêncio, e dois cliques
  simultâneos bastam para criar os dois.
- **[2026-09-04]** **Arquivar é mudar o status; apagar programa com histórico não é
  possível pela API** (`mesocycles_delete`). O delete levaria treino, prescrição e
  série por cascata. Programa sem nenhuma sessão continua apagável — lixo criado por
  engano não fica preso. Sessão em andamento sobrevive ao arquivamento: o aluno
  termina e salva.
- **[2026-09-04]** **Trocar o programa ativo é uma transação só** (`ativar_macrotreino`,
  migration 0012), e o programa novo **nasce arquivado** para depois ser ativado. Em
  dois passos soltos, uma falha no meio deixa o aluno sem programa nenhum — abrindo o
  app na academia sem treino.
- **[2026-09-04]** A **semana da rotação sai do `started_at`**, não da segunda-feira do
  calendário: programa começado numa quarta tem a semana 1 de quarta a terça. O número
  que a tela mostra e a rotação vêm da mesma conta, então nunca discordam. Cuidado com
  o par: `semanaAtual` tem teto (é rótulo), `semanaCorridaDoPrograma` não tem (é
  janela) — travar a janela congelaria a rotação depois do prazo.
- **[2026-09-01]** Editar a prescrição **atualiza** as linhas que continuam em vez de
  apagar e recriar: `session_sets` referencia `workout_exercises.id` com cascata, e
  recriar levaria o histórico do aluno junto.
- **[2026-09-02]** A execução grava por **fila local com reenvio**, não por requisição
  síncrona: confirmar série é local e imediato, o `localStorage` guarda o que falta
  enviar, e o servidor faz `upsert` em `(session_id, workout_exercise_id, set_number)`.
  Reenvio e correção passam pelo mesmo caminho e não viram duplicata. O limite aceito é
  a fila viver no aparelho até a Fase 4 — por isso o contador de pendentes fica visível
  e o botão de concluir só fecha a sessão com a fila vazia.
- **[2026-09-02]** Sessão em andamento de outro treino é **encerrada e salva**, nunca
  apagada: série que o aluno executou é histórico. Só a sessão com zero séries é
  descartada — e "zero séries" é medido **depois** de enviar a fila que o aparelho
  guarda daquela sessão, porque a contagem do servidor não enxerga um treino feito sem
  sinal. Encerrar grava `finished_at` e `duration_seconds`.
- **[2026-09-02]** Toda chave de `localStorage` que guarda dado de uma sessão é
  **chaveada pelo id da sessão**. Chave global vira apagamento: o efeito de persistência
  roda na montagem com o estado vazio e limpa o que era de outra sessão.
- **[2026-09-02]** Ler `localStorage` no cliente exige separar o **render de hidratação**
  do resto: nele a janela já existe, então `typeof window` não protege. O gate é
  `useMontado()` (`lib/usar-montado.ts`, sobre `useSyncExternalStore`) trocando a `key`
  do componente — e não `setState` em efeito, que o lint recusa.
- **[2026-09-02]** Policy de escrita de `session_sets` confere também **a que treino o
  exercício pertence**. `owns_session` sozinho deixava o aluno gravar série apontando
  para a prescrição de um treino alheio e inflar o histórico de um estranho. Migration
  `0009` acrescentou `private.serie_no_treino_da_sessao`.
- **[2026-09-01]** Repetições aceitam **só número ou faixa** (`12`, `8-10`). "Até a falha"
  e afins vão no campo de observação do exercício, que já existe. Decisão do Otávio: o
  alvo numérico garante que a tela de execução sempre tem o que mostrar no contador.
- **[2026-09-01]** Data do histórico é formatada **no servidor com fuso fixo
  `America/Sao_Paulo`**, não no fuso do aparelho. Formatar no cliente deixaria a data — que
  é o rótulo da linha — vazia até a hidratação, e a linha sem identidade. O limite aceito:
  aluno em Manaus ou Rio Branco vê a data no horário de Brasília. Para o piloto serve;
  quando houver aluno fora do fuso, guardar a preferência no perfil.
- **[2026-09-02]** O aluno **não nasce por API**: `students_insert` só aceita
  `trainer_id = auth.uid()` (o personal). O gatilho é `security definer` e não
  passa por policy, então o convite continua funcionando — e um POST direto
  deixou de valer mais que um token de 192 bits. Do mesmo jeito, o aluno não
  troca o próprio `trainer_id`: mudar de personal é decisão de quem convida.
- **[2026-09-02]** Sessão concluída não se apaga (`workout_sessions_delete`
  exige `finished_at is null`). Apagar levaria as séries por cascata, e quem
  perde a leitura é o personal. Só a sessão em andamento e vazia é descartável.
- **[2026-09-02]** Toda conta de "que dia é hoje" passa por `lib/domain/fuso.ts`
  (`America/Sao_Paulo`), nunca pelo fuso do processo: o servidor roda em UTC e
  às 21h no Brasil já virou o dia seguinte — exatamente o horário em que se
  treina. Coluna `date` ("2026-09-01") é dia de calendário e não se converte.
- **[2026-09-02]** Recorde pessoal é a **maior carga levantada**, independente das
  repetições. Decisão do Otávio, que **contraria o doc 03** ("maior carga com pelo menos as
  reps alvo") — registrada aqui para não ser "corrigida" por engano. Motivo: é o que o
  aluno entende sem explicação. Limite aceito: premia quem reduz repetição para pôr mais
  peso. Mudar isso é trocar uma função pura em `lib/domain/`.
- **[2026-09-04]** **Histórico por exercício agrupa por `(exercise_source, exercise_id)`,
  nunca por `workout_exercise_id`.** Este último é uma linha de prescrição — existe uma
  por treino e outra a cada programa novo —, então agrupar por ele faria "a última vez que
  fiz supino" recomeçar do zero a cada macrotreino. `chaveDoExercicio` monta a chave;
  `lib/domain/recordes.ts` a trata como texto opaco.
- **[2026-09-02]** Gráfico de evolução é **SVG à mão**, sem biblioteca. Um gráfico de linha
  com pontos clicáveis não paga ~100 kB de dependência, e biblioteca genérica atrapalha o
  que o doc 05 pede: linha de borda a borda, datas na horizontal, mais recente primeiro.
