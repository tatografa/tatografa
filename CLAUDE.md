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
- **Piloto:** ainda não decidido se usa projeto Supabase separado (pendência do M4).

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
