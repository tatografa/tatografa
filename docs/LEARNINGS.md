# Aprendizados — Reps Club

> Memória evolutiva dos agentes deste produto. Todo dev lê antes de codar e, se descobrir
> algo não óbvio, relata uma linha no handoff do card. A curadoria acontece ao fim do
> milestone: lição recorrente vira regra nas Convenções do `CLAUDE.md` e sai daqui;
> entrada obsoleta é apagada. Manter ≤ ~40 linhas.
>
> Formato: `- [AAAA-MM-DD] [área] <erro/descoberta> → <regra a seguir>`

## Backend

- [2026-08-23] [rls] Policy de `students` que consulta `students` se auto-invoca → helper
  `security definer` com `search_path` fixo quebra a recursão.
- [2026-08-23] [rls] O PostgREST publica como RPC toda função de `public`, inclusive os
  helpers de autorização → helper vive no schema `private`, que não é publicado.
- [2026-08-23] [supabase] `signUp` com confirmação de e-mail ligada não devolve sessão, e
  sem sessão o insert do cliente esbarra no RLS → criar a linha de perfil por gatilho em
  `auth.users`, atômico com a criação do usuário.
- [2026-08-31] [postgres] `select ... for update` no gatilho serializa duas tentativas com
  o mesmo token de convite → a segunda só vê a linha já consumida e é recusada.
- [2026-08-31] [seguranca] Convite lido sem sessão não precisa de chave de serviço → função
  `security definer` estreita (um token exato, três campos) tem raio de dano muito menor
  que uma chave que ignora o RLS inteiro.
- [2026-09-01] [rls] Policy de escrita que confere só o dono da linha
  (`trainer_id = auth.uid()`) deixa passar `student_id` alheio → conferir também o
  relacionamento, com o helper de travessia. Foi assim que um personal qualquer conseguia
  prescrever para aluno de outro (migration 0007).
- [2026-09-02] [rls] **O mesmo defeito apareceu três vezes** (0007, 0009, 0010), sempre
  achado por um ataque de cada vez e corrigido só na porta que o ataque usou → ao corrigir
  uma policy por esse padrão, varrer no mesmo commit **todas** as policies de escrita da
  tabela e das vizinhas da cadeia. Em especial: se a policy de `insert` confere o
  relacionamento, a de `update` também precisa — senão o atacante insere legítimo e depois
  troca a fk, e a checagem seguinte valida contra o dado já adulterado.
- [2026-09-02] [rls] Policy de `insert` com `or id = auth.uid()` numa tabela de vínculo
  deixa qualquer autenticado se auto-inserir na carteira alheia, contornando convite,
  token e gatilho → quem nasce por gatilho `security definer` não precisa de policy
  permissiva; o `with check` pode exigir só o dono do relacionamento.
- [2026-09-01] [postgres] Helper de RLS `stable` não enxerga a linha inserida pelo mesmo
  statement → gravar cadeia `mesocycles → workouts` em statements separados; um
  `with ... insert` encadeado é recusado.
- [2026-09-01] [postgres] Contar linhas trazendo-as para a memória trunca em silêncio
  quando o `db-max-rows` do PostgREST corta a página → agregar no banco. Contagem menor
  que chega a zero vira "sem histórico" e some com a confirmação que protegia o dado.
- [2026-08-31] [supabase] Projeto do plano gratuito **pausa sozinho** após ~7 dias sem uso,
  e a primeira query depois disso falha com timeout ou "relation does not exist" → conferir
  `status` do projeto antes de concluir que o schema sumiu.

## Frontend

- [2026-08-23] [next16] Este não é o Next.js do treinamento: `proxy.ts` no lugar de
  `middleware.ts`, `params`/`searchParams`/`cookies` assíncronos → ler
  `node_modules/next/dist/docs/` antes de escrever, não confiar na memória.
- [2026-08-23] [i18n] `required` e `type="email"` disparam validação nativa em inglês →
  `noValidate` no formulário e validação por zod na Server Action, em português.
- [2026-08-31] [zod4] A v4 trocou `errorMap` e `invalid_type_error` por `error` → mensagem
  customizada de enum, literal e coerce usa a chave nova.
- [2026-08-31] [react] `setState` dentro de `useEffect` para reagir a resultado de action
  reprova no lint e causa render em cascata → ajustar durante a renderização comparando
  com o resultado anterior (`if (estado !== ultimoEstado)`).
- [2026-08-31] [ux] Formulário multi-etapa com as etapas montadas juntas esconde o erro de
  servidor dentro da etapa oculta → validar no cliente antes de avançar e, se o erro vier
  do servidor mesmo assim, voltar para a etapa que o contém.
- [2026-08-31] [ux] Falha de rede tratada no mesmo ramo de "não encontrado" faz um convite
  válido parecer expirado → separar erro técnico de ausência de dado, com texto diferente.

## Infra / processo

- [2026-08-23] [rede] O host do Supabase é bloqueado pela política de egresso deste
  ambiente remoto (403 no CONNECT) → lógica de banco se valida por SQL via MCP; interface
  que precisa de dado se confere com props fixas numa rota descartável.
- [2026-08-31] [testes] Regex de teste procurando palavra que a aplicação não usa gera
  falso negativo → conferir a mensagem real antes de afirmar que há bug no código.
- [2026-08-31] [npm] `npm install <pkg>` para uso só de teste suja `package.json` →
  `npm install --no-save` quando a dependência não deve ser commitada.
- [2026-09-01] [html] Campo desabilitado **não é enviado** no formulário → controle que
  carrega dado obrigatório precisa de hidden separado. Passou pelo SQL e pelo build, e
  quebrou a edição inteira: o erro aparecia num campo que o usuário não podia mexer.
- [2026-09-01] [verificacao] Prova por SQL cobre a lógica e deixa o caminho da tela sem
  prova → card que altera registro existente só fecha depois de exercitar a edição pelo
  navegador, não só o insert por SQL.
- [2026-09-01] [next16] Apagar uma rota deixa o `.next/dev/types/validator.ts` com import
  da rota que sumiu, e o `typecheck` falha em arquivo gerado, não no seu código →
  `rm -rf .next` depois de apagar a rota descartável. **A ordem importa:** `PageProps<"/rota">`
  também é tipo gerado, então rodar `typecheck` logo após o `rm -rf` acusa
  "Cannot find name 'PageProps'". O certo é `rm -rf .next && npm run build && npm run typecheck`.
- [2026-09-01] [verificacao] Fixture inserida por SQL contorna a validação da Server
  Action, então o screenshot pode mostrar dado que o app não consegue produzir → conferir
  se a fixture passaria pelo formulário antes de tratá-la como prova.
- [2026-09-01] [offline] **Ramo destrutivo não pode ser decidido por medida que não enxerga
  a fila local.** As três perdas do M1-05 tinham a mesma forma: contagem no servidor,
  `removeItem` de chave compartilhada e "o lote foi aceito" — três jeitos de responder
  "não há nada aqui" sobre um lugar onde não se olhou. Antes de apagar, consultar o que o
  aparelho ainda guarda.
- [2026-09-01] [offline] Chave global de `localStorage` para dado por sessão é condição de
  apagamento, não economia → chavear por id (`prefixo:<sessionId>`) e nunca remover chave
  que não seja a da sessão montada. Celular emprestado na academia é caso real.
- [2026-09-02] [coerencia] Número derivado do mesmo dado por duas queries diferentes
  diverge na tela: a lista do histórico somava todas as linhas da prescrição e o detalhe
  pulava a órfã, mostrando "12 de 16" e "12/13" para a mesma sessão → denominador e
  formato saem de **uma função só** em `lib/domain/`; card que exibe número que outra tela
  já exibe cita a função existente no delta técnico.
- [2026-09-02] [fuso] Regra de calendário derivada com o relógio do processo vira um dia a
  mais na Vercel (UTC): `semanaAtual` mostrava "Semana 2 de 8" às 21h do sétimo dia →
  `lib/domain/fuso.ts` centraliza `FUSO` e `diaLocal`. Cuidado: coluna `date` chega como
  `"2026-09-01"` e `new Date()` a lê como meia-noite UTC — converter por fuso joga o início
  para o dia anterior; tratar o texto como dia de calendário.
- [2026-09-04] [modelagem] **Chave de escrita não é chave de leitura histórica.**
  `session_sets` aponta para `workout_exercise_id`, que é uma linha de prescrição — há uma
  por treino e outra a cada programa novo. Agrupar por ela para responder "com quanto eu
  fiz supino da última vez?" dá uma tela plausível e errada: a pílula sumiria toda vez que
  o aluno trocasse de macrotreino. A identidade do exercício é `(exercise_source,
  exercise_id)`. Antes de agrupar histórico, perguntar de que o número é "por": por linha
  gravada ou por coisa do mundo.
- [2026-09-04] [dominio] Duas leituras do mesmo histórico que se confundem à toa:
  "a última vez" (última sessão concluída) e "o recorde" (maior de todos). Trocar uma pela
  outra não estoura em lugar nenhum — a pílula passa a nunca descer depois de um dia ruim,
  e todo treino mais pesado que o anterior vira "recorde" → funções separadas, nomeadas
  pela pergunta que respondem, e teste que fixa o caso em que as duas discordam.
- [2026-09-04] [dados] Zero registrado não é zero real. Carga 0 kg é o stepper deixado
  onde abriu, e admiti-la como marca anterior faria a sessão seguinte anunciar
  "recorde: 0 kg → 20 kg" → valor de fronteira que o formulário produz sozinho não vira
  linha de base de comparação.
- [2026-09-05] [dataviz] Ordem de lista e ordem de eixo não são a mesma decisão. O doc pede
  "mais recente primeiro" e isso é verdade para as listas; aplicar ao eixo do gráfico
  inverteria o significado de uma linha subindo → num gráfico de evolução o eixo é sempre
  cronológico, e a regra de ordenação da lista fica na lista.
- [2026-09-05] [a11y] Alvo de toque de 44px em ponto de gráfico é promessa que a geometria
  não cumpre: com doze pontos numa tela de 390px cabem 32px cada, e círculos grandes o
  bastante se sobrepõem. → faixa vertical de altura inteira, uma por ponto, como **botão
  HTML sobreposto** ao SVG: não se sobrepõe nunca, dá foco de teclado e nome acessível de
  graça, e o filtro padrão (6 sessões) é escolhido para a faixa passar dos 44px.
- [2026-09-05] [verificacao] O MCP do Supabase funciona neste ambiente mesmo com o host
  bloqueado para o app: dá para criar fixture, impersonar `authenticated` com
  `request.jwt.claims` e provar RLS de verdade. Prova de leitura só vale rodando a consulta
  **sem** o filtro que a aplicação aplica — é o que um cliente forjado faz, e é o RLS que
  tem que barrar. Limpar a fixture depois: o banco de dev estava vazio e volta a ficar.
- [2026-09-05] [banco] Agregar no banco protege da paginação silenciosa, mas move a regra
  de fronteira de dia para dentro do SQL — e aí ela existe em dois lugares (`at time zone`
  na função e `FUSO` em `lib/domain/fuso.ts`). Não dá para ter os dois: ou a regra é única
  e a contagem vem para a memória, ou a contagem é segura e a regra é duplicada. Escolhida
  a segunda, com a prova rodando **no horário em que as duas poderiam discordar** (23h30
  UTC, que é 20h30 no Brasil) em vez de num horário qualquer.
- [2026-09-05] [ux] Indicador zerado não é o mesmo problema que indicador escondido.
  Esconder faz a tela mudar de forma no dia do primeiro treino, e o número aparece do nada;
  mostrar "0 dias seguidos" sozinho parece punição. O que resolve é a frase de convite ao
  lado do zero — e só enquanto o total também é zero, porque depois disso o zero é um fato
  que o usuário já sabe ler.
- [2026-09-05] [seguranca] RLS não distingue dois recursos que o mesmo usuário pode ler.
  O personal enxerga todos os alunos da carteira, então `/painel/alunos/<A>/sessoes/<sessão
  do B>` passa pela policy — o que barra é o filtro por `student_id` dentro da consulta.
  Em rota aninhada, o id do pai é uma **afirmação da URL**: reconferir que o filho pertence
  a ele, sempre. Não é redundância com o RLS; é a única trava.
- [2026-09-05] [ui] Componente compartilhado entre celular e desktop carrega o texto junto:
  "Toque num ponto" veio do app do aluno e apareceu na tela do personal, que usa mouse.
  Copy de componente reusado fala do **que acontece**, não do gesto.
- [2026-09-05] [ui] SVG com `w-full` escala a altura junto: o mesmo gráfico que ocupa 150px
  no celular passa de 480px numa tela de 1280. O limite é largura máxima no contêiner de
  quem usa, nunca no componente — senão o gráfico do celular perde a borda a borda.
- [2026-09-05] [dominio] "Semana" não é uma coisa só. A semana do programa (a partir do
  `started_at` de cada aluno) e a semana de calendário respondem a perguntas diferentes, e
  a primeira **não agrega**: cada aluno começa a dele num dia. Métrica de carteira precisa
  de uma janela compartilhada. Manter as duas, nomeadas pelo que são.
- [2026-09-05] [dominio] Divisão por zero não é zero. Aderência de um programa sem treino
  prescrito é "não dá para dizer", e engolir isso como 0% derruba a média da carteira por
  causa de um programa que o personal ainda está montando. Nulo até em cima, e "—" na tela.
- [2026-09-05] [produto] Bloco de alerta vazio treina o olho a ignorar bloco de alerta —
  por isso "precisam de atenção" some quando não há ninguém, em vez de mostrar lista vazia
  ou um card dizendo que está tudo bem.
- [2026-09-05] [banco] **Update filtrado pelo dono devolve zero linhas sem erro.** É a
  terceira variação do mesmo formato no projeto: a escrita não acontece, o Postgres não
  reclama, e a ação responde "salvo". Todo `update` com `eq` de dono pede `count: "exact"`
  e trata `count === 0` como "não encontrado" — a mensagem certa é recarregar a página, não
  tentar de novo.
- [2026-09-05] [banco] **Consulta que não decide nada hoje pode decidir amanhã.** A
  varredura sem paginação de `listarAlunos` era, no M1, um rótulo errado numa lista. O
  M2-07 pendurou o alerta de inatividade no mesmo dado, e a mesma truncagem passou a
  acusar de "nunca treinou" quem treina toda semana. Ao pendurar decisão num dado que já
  existia, reler como ele é lido — não só como ele é usado.
- [2026-09-05] [revisao] Revisor classificou como 🟢 o defeito mais grave do milestone,
  porque avaliou a consulta pelo que ela era antes e não pelo que passou a alimentar.
  Achado de revisor é hipótese: confirmar no código e reproduzir antes de aceitar **e**
  antes de descartar.
- [2026-09-11] [auth] **Redirecionar quem já está logado para longe das telas de entrada
  fecha a única saída** quando a área de destino não tem botão de sair. O app do aluno
  ficou dez cards sem `sair`, e ninguém percebeu porque em desenvolvimento se limpa cookie
  sem pensar. Toda área autenticada precisa da porta de saída **dentro** dela — e num
  produto usado em celular emprestado isso é requisito, não conforto.
- [2026-09-11] [verificacao] O primeiro teste com sessão real achou três defeitos, e os
  três estavam na **borda de autenticação** — exatamente o que o ambiente remoto nunca
  alcançou. Nenhum apareceu em revisão de código, prova por SQL ou screenshot com props
  fixas: todos os três só existem quando há um usuário logado querendo virar outro.
  O que o ambiente não alcança é onde o defeito mora.
- [2026-09-11] [ux] **Dado salvo que ninguém consegue ver é indistinguível de dado
  perdido.** A sessão em andamento tinha as 6 séries no banco, e o teste de campo a
  reportou como "não ficou salva" — porque o histórico exclui sessão sem `finished_at`
  (correto) e nenhuma tela dizia que ela existia. Todo estado que o app guarda fora do
  caminho principal precisa de uma porta de volta visível na tela inicial.
- [2026-09-11] [ux] Ícone sem rótulo não comunica estado. O contador de séries pendentes
  era `<CloudOff/>` mais um número, com o texto só em `sr-only`: o usuário viu "um ícone de
  nuvem". Era justamente o aviso que torna aceitável a fila viver no aparelho — e ele
  dependia de o usuário adivinhar o significado do desenho.

---

## Curadoria ao fim do M2 (2026-09-11)

M1 e M2 validados em campo. O padrão que atravessa as três rodadas de teste, e que vale
mais que qualquer item isolado acima:

**Os quatro defeitos encontrados com Supabase real estavam todos fora da lógica de
negócio.** Nenhum em cálculo, policy, migration ou número. Todos em **autenticação,
troca de conta e estado de sessão** — as bordas que o ambiente remoto nunca alcançou:

| Defeito | O que não o pegou |
|---|---|
| Aluno sem botão de sair | revisão de código, SQL, screenshot |
| Texto mandando o aluno embora da porta certa | idem |
| Sessão em andamento invisível | idem |
| Ícone de nuvem sem rótulo | idem |

Três consequências para os próximos milestones:

1. **Prova por SQL e screenshot com props fixas cobrem o que calculam, não o que
   acontece.** Elas acharam furo de RLS de verdade no M1 e confirmaram os números do M2.
   Nenhuma delas pode achar "o usuário não consegue sair".
2. **Fluxo de entrada e saída merece o mesmo rigor que a regra de negócio.** No M2 ele
   recebeu menos, e foi onde tudo quebrou.
3. **Deploy contínuo mudou o custo do teste.** Com a Vercel conectada, validar deixou de
   ser um evento e passou a ser o caminho normal — não vale mais empilhar milestones sem
   passar por lá.

- [2026-09-11] [pwa] **Service worker é superfície de vazamento que o RLS não cobre.** O
  banco protege a API; o cache do navegador é do aparelho, não da pessoa. Num produto onde
  o celular é emprestado, uma resposta de navegação cacheada mostra o treino de um aluno
  para o outro — e basta um `cache.put` sem conferir o `mode` da requisição. A prova é
  contar o que ficou no cache depois de navegar, não ler o código.
- [2026-09-11] [armazenamento] `localStorage` e IndexedDB são apagados pelo **mesmo**
  gesto do usuário ("limpar dados de navegação"). Migrar de um para o outro para
  "sobreviver à limpeza" é trabalho que não entrega nada. O que existe de verdade é
  `navigator.storage.persist()`, e ele só protege do descarte automático por pressão de
  disco.
- [2026-09-11] [next] **`error.tsx` não envolve o `layout.tsx` do próprio segmento** — só
  os layouts abaixo dele. Isso deixa de ser curiosidade num app onde a **autorização mora
  no layout**: `requireStudent()` e `requireTrainer()` tocam o Supabase em toda navegação,
  são a leitura mais provável de falhar, e a falha delas passa por cima do `error.tsx` que
  parece cobrir a área. Sem um `app/error.tsx` na raiz, ela cai no `global-error`, que
  troca o documento inteiro e não carrega o CSS do app. Boundary "do segmento" cobre menos
  do que o nome sugere: conferir quem está acima, não só quem está dentro.
- [2026-09-11] [verificacao] **Asserção de teste que compara texto de tela erra por causa
  do CSS.** `innerText` devolve o texto já transformado por `text-transform`, então um
  `uppercase` fez uma verificação de `digest` falhar contra o hex minúsculo que eu mesmo
  tinha passado. Gastei uma rodada investigando um componente que nunca esteve quebrado.
  Comparar sem diferenciar caixa, ou ler `textContent`, que ignora o CSS.
- [2026-09-11] [next] **O React reseta o formulário depois de uma Server Action.** Todo
  campo não controlado volta vazio, inclusive quando a falha não é culpa do usuário. Num
  onboarding de duas etapas isso obriga a redigitar tudo — foi o que aconteceu no teste de
  campo quando o limite de e-mail do Supabase estourou. A correção é devolver os valores
  no estado da ação e reaplicá-los por `defaultValue`; senha fica de fora, porque não tem
  por que viajar de volta ao navegador.
- [2026-09-11] [ambiente] **Servidor de dev órfão faz testar a versão errada.** Um
  `next-server` de sessão anterior segurava a 3000, o `npm run dev` subiu calado na 3002,
  e eu conferi um build velho. `ss -ltn` não mostrou o processo; `ps aux | grep
  next-server` mostrou. Antes de confiar num teste de navegador: conferir em que porta o
  servidor subiu, e que ele é o que acabou de subir.
- [2026-09-11] [design-system] **Uma cor de marca não serve aos dois temas.** `#ff2a2a`
  reprova como texto sobre branco (3.74) e o escurecido reprova como texto sobre preto
  (3.68). Não existe valor único que passe nos dois — a saída é dois tokens com papéis
  declarados (`brand` e `brand-on-dark`), não uma cor tentando ter duas opiniões. O mesmo
  raciocínio vale para o cinza secundário: `ink-*` é da área clara, `dark-muted` é da
  escura, e misturar foi o que criou metade dos defeitos deste card.
- [2026-09-11] [design-system] **`bg-X/15 text-X` reprova sempre.** A cor diluída em cima
  de si mesma escurece o fundo na mesma medida em que a cor já é escura, e o par estaciona
  em ~4.1 — para verde, vermelho e âmbar igualmente. Fundo claro de selo precisa ser token
  próprio (`brand-soft`, `success-soft`), nunca transparência da mesma cor.
- [2026-09-11] [acessibilidade] **O axe não enxerga contraste sobre fundo transparente.**
  Ele não resolve a cor através do elemento pai e classifica como "incompleto", que não
  aparece na contagem de violações. Foi assim que `#4a4a4a` sobre preto (2.23) passou
  batido numa auditoria "limpa". A conta de contraste feita token a token, fora do
  navegador, pega o que o axe cala — e as duas juntas custam pouco.
- [2026-09-11] [acessibilidade] **Auditoria automática não mede alvo de toque nem foco em
  fluxo.** Zero violações de axe e ainda assim havia link de 14px de altura no app usado
  de pé na academia. Medir `getBoundingClientRect()` de todo controle e percorrer a tela
  com Tab lendo o `outline` computado são cinco linhas cada, e acham o que a regra não
  cobre.
- [2026-09-11] [verificacao] **Ler estilo computado logo depois de focar mede a transição,
  não o estado.** Concluí que o foco era invisível nos campos de formulário porque li
  `borderColor` no mesmo instante do `focus()` — com `transition` na classe, o valor ainda
  era o antigo. Esperar a transição mostrou borda vermelha e halo, corretos desde sempre.
  Quase "consertei" o que não estava quebrado: com animação no elemento, medir depois.
- [2026-09-13] [banco] **Prova de aceite não mora em coluna que o aceitante pode editar.**
  `students_update` deixa o aluno alterar a própria linha, então `termos_aceitos_em` ali
  seria um registro que o próprio interessado reescreve — inútil justamente no dia em que
  alguém perguntar. Log append-only em tabela separada, com policy de select e insert e
  **nenhuma** de update ou delete: com RLS ligado, a ausência da policy é a proibição.
- [2026-09-13] [banco] **`default now()` não protege data que o cliente pode mandar.**
  Default só vale para quem **omite** a coluna, e um POST direto ao PostgREST não omite —
  manda a data que quiser, inclusive anterior a uma mudança de texto, "provando" aceite de
  algo que ainda não existia. Quem garante é gatilho `before insert` sobrescrevendo o
  campo. Provado gravando 2020-01-01 e recebendo de volta a hora do banco.
- [2026-09-13] [produto] **Pedir aceite de documento que não existe é defeito, não
  pendência.** O onboarding trazia "Aceito os termos e a política" desde o M1, sem os
  documentos e sem gravar nada. Passou por três rodadas de teste de campo sem ninguém
  reparar, porque o checkbox *parecia* funcionar. Texto de interface que promete um
  artefato precisa que o artefato exista — vale para link, para e-mail e para política.
- [2026-09-13] [dados-pessoais] **Não publicar o e-mail pessoal do dono numa página
  aberta.** Era o único endereço disponível e caberia na política sem ninguém questionar.
  Virou `[DEFINIR]` visível na tela: marcador gritante é mais difícil de esquecer que um
  endereço plausível, e escolher o que fica exposto publicamente é decisão do dono.
- [2026-09-13] [auth] **O e-mail embutido do Supabase não é "limitado", é fechado.** Ele
  entrega **só para endereços da equipe do projeto** e recusa o resto com `Email address
  not authorized` — não é cota de volume, é lista de convidados. Quem testa com o próprio
  e-mail nunca descobre, porque o próprio e-mail está na equipe. Todo fluxo de e-mail
  precisa de um teste com endereço de fora antes de contar como validado.
- [2026-09-13] [auth] **Calar erro para não vazar quem tem conta é certo; calar erro de
  envio é bug.** As duas coisas chegam pelo mesmo `error.message` e vinham tratadas
  juntas: o filtro só deixava passar `rate limit`, então `Email address not authorized`
  caía no ramo de sucesso e a tela dizia "link enviado" para um e-mail que nunca saiu. A
  regra é a origem do erro: falha **do provedor** aparece (não distingue quem tem conta,
  então não vaza), resposta **sobre o destinatário** cala.
- [2026-09-13] [processo] **Motivo registrado errado numa decisão de arquitetura sobrevive
  por meses.** O `CLAUDE.md` dizia que o convite virou link de WhatsApp por causa de "~2
  e-mails/hora" do plano gratuito. A decisão era certa, o motivo era falso — e ninguém
  reconfere um motivo que já está escrito. Vale reabrir o *porquê* quando o assunto volta,
  não só o *o quê*.
- [2026-09-13] [infra] **Antes de mandar alguém mexer em DNS, ler o DNS.** Escrevi um
  roteiro mandando sobrescrever o registro `A` de `repsclub.com.br` com o IP da Vercel.
  Ao inspecionar de verdade, a raiz já servia um site no ar desde nov/2025 — o roteiro
  teria derrubado. Subdomínio novo (`app.`) entrega o mesmo resultado sem tocar em nada.
  Registro de DNS "vazio" é suposição; `getDNSRecords` custa uma chamada.
- [2026-09-13] [infra] **Conferir o que já existe antes de mandar criar.** O roteiro
  pedia criar `contato@repsclub.com.br`; a caixa existia havia dez meses, ativa e com
  mensagens dentro. Se eu tivesse "executado" criando com senha nova, teria quebrado o
  que já usava aquela caixa.
- [2026-09-13] [ferramentas] **Ter acesso ao painel não é ter a ferramenta.** A MCP da
  Vercel permite comprar domínio, mas não adicionar domínio a um projeto; a do Supabase
  não expõe configuração de auth. Vale checar qual operação existe antes de prometer
  execução — e antes de declarar que não dá, porque eu já tinha dito que não tinha acesso
  à Vercel quando tinha.
- [2026-09-13] [infra] **Variável de ambiente que sobrepõe detecção automática envelhece
  em silêncio.** `NEXT_PUBLIC_SITE_URL` vence o cabeçalho `host` por um motivo bom — sem
  isso, forjar `Host:` faz o servidor gerar link de recuperação de senha apontando para o
  site do atacante. O preço é que trocar o domínio sem trocar a variável mantém todo link
  nascendo com o endereço antigo, e **nada na tela denuncia**: os dois endereços
  respondem. Quando um valor fixo vence um valor observado, vale comparar os dois e gritar
  na divergência — uma vez por combinação, não a cada requisição.
- [2026-09-13] [auth] **Erro de envio de e-mail se diagnostica em três logs, não em um.**
  A tela mostra a frase genérica de propósito; o motivo real está em Supabase → Auth Logs
  (`535 authentication failed` diz credencial recusada, `Email address not authorized` diz
  que o SMTP próprio nem foi ligado); e o provedor tem os dele. Cruzar os dois lados
  descarta metade das hipóteses antes de tocar em qualquer campo — foi assim que o
  "reconfigurar por cima" deixou de ser a primeira tentativa.
- [2026-09-13] [infra] **Troca de senha de caixa de e-mail não vale no mesmo minuto.** A
  API respondeu `Request accepted` e o log de ação marcou `OK` às 20:46:46; o SMTP foi
  configurado às 20:47:46 e recusou autenticação por minutos. "Aceito" é a fila, não o
  efeito. Depois de trocar credencial em serviço gerenciado, esperar antes de concluir que
  está errada.
- [2026-09-13] [auth] **Lista de exibição erra; lista de silêncio erra menos.** A primeira
  correção listava as frases de erro que **deviam aparecer** — e quando o SMTP passou a
  recusar com `535 authentication failed`, frase que não estava na lista, a tela voltou a
  dizer "link enviado" para um e-mail que nunca saiu. Exatamente o defeito que a correção
  tinha consertado, em nova roupagem. Invertido: cala-se o que revela **quem tem conta**
  (lista curta e conhecida) e mostra-se todo o resto. Quando o default é "esconder", cada
  erro novo nasce escondido.
- [2026-09-13] [processo] **Confirmar qual credencial está no campo antes de teorizar sobre
  o mecanismo.** O `535 authentication failed` do SMTP levou três rodadas: testei
  propagação de senha, depois porta 465 contra 587, depois TLS. A causa era que a senha no
  campo do Supabase não era a que eu tinha acabado de definir na caixa. "Qual valor exato
  está aí?" é mais barato que qualquer hipótese sobre o sistema, e vem antes delas — ainda
  mais quando fui **eu** que troquei a credencial e só assumi que seria a usada.
- [2026-09-13] [produto] **O personal não consegue montar treino antes de o aluno se
  cadastrar**, e a causa é a chave: `students.id` **é** o id de `auth.users`, então a
  linha do aluno não pode existir antes da conta. O enum tem `status = 'convidado'` como
  padrão da tabela e ninguém nunca o usa — resquício de um desenho em que o personal
  preparava antes. A permissão até existe (`students_insert` aceita o personal), mas a FK
  fecha a porta. Consequência real: a ordem é convite → aceite → montar → abrir, e quem
  abrir fora de ordem vê um app vazio na primeira impressão. Desacoplar `students.id` de
  `auth.users` resolveria, mas mexe em `mesocycles`, `workout_sessions` e em toda policy
  que compara `id = auth.uid()`.
- [2026-09-15] [seguranca] **Referência solta a coluna dentro de um `exists` sobre outra
  tabela liga na tabela de dentro, e a policy falha calada.** Na 0023 escrevi
  `exists (select 1 from public.students s where ... and (storage.foldername(name))[1] =
  s.id::text)` querendo `storage.objects.name`; `students` também tem `name`, e a
  comparação virou `foldername(<nome do aluno>)` — falsa sempre. Não vazou: falhou para o
  lado fechado, e o personal simplesmente não via a foto do próprio aluno. **Qualificar
  sempre** — a policy do bucket `treinos` (0018) já fazia isso (`p.photo_path =
  storage.objects.name`) e eu não segui o próprio precedente.
- [2026-09-15] [verificacao] **Quem achou esse buraco foi um caso de caminho legítimo, não
  um de burla.** Trinta casos de "fulano não pode" passariam com a policy inteira negando
  tudo. É o mesmo motivo de a 0021 ter sete casos de caminho legítimo entre os dezoito:
  afrouxar e apertar são os dois jeitos de errar uma policy, e só os casos legítimos pegam
  o segundo.
- [2026-09-15] [verificacao] **Expectativa errada na prova não é defeito no código, mas
  expectativa vaga esconde defeito.** Três casos "FALHARAM" por minha conta: um `update`
  recusado pelo RLS **levanta** 42501 quando o `with check` é violado e afeta zero linhas
  em silêncio quando é o `using` — escrevi "OK:0" onde era erro. E a RPC chamada por um
  estranho barra na primeira escrita (42501), não na contagem de linhas; o P0001 da
  contagem só aparece quando não há medida nenhuma para inserir. Valeu escrever o caso
  sem medida de propósito: é o único que exercita aquela trava.
- [2026-09-15] [banco] **Gatilho de `insert` não tem `old`.** `coalesce(new, old)` e
  `old.campo` levantam "record old is not assigned yet" em PL/pgSQL, não devolvem nulo. O
  que funciona nos três eventos é ramificar por `tg_op`.
- [2026-09-15] [banco] **Parâmetro de função sem `default` vira tipo não-nulo no gerador
  do Supabase**, e o TypeScript passa a recusar o `null` que o banco aceita. A saída fácil
  é um molde no cliente ("confie em mim"); a saída certa é `default null` na assinatura
  (0025) — aí o tipo gerado vira opcional e o cliente omite o que não tem, que é o que ele
  quer dizer mesmo.
- [2026-09-15] [ui] **`setState` dentro de `useEffect` para fechar dialog depois de uma
  Server Action é recusado pelo lint** (`react-hooks/set-state-in-effect`), e com razão:
  é render em cascata. `useActionState` não devolve nada para encadear no handler. O que
  passa é **ajustar o estado no render**, comparando com o que já foi visto — e por isso
  liberar duas vezes seguidas continua funcionando.
- [2026-09-15] [ux] **Dica de campo não é escolha entre duas.** No formulário de medidas,
  "onde passar a fita" e "na última: 37,5 cm" resolvem problemas diferentes: sem a
  primeira, quem mede pela primeira vez põe a fita num lugar diferente a cada ciclo e a
  comparação compara nada; sem a segunda, ninguém percebe que digitou 8 onde queria 80.
  Cabem as duas na mesma linha.
- [2026-09-15] [produto] **Direito de apagar se resolve por recorte, não por sim ou não.**
  A reavaliação enviada congela porque é a base da comparação, mas as fotos são do corpo
  da pessoa. Separar as duas coisas — números travados, fotos apagáveis a qualquer momento
  — atende os dois lados; travar tudo obrigaria a escrever na política "para apagar,
  escreva para o suporte", que é a resposta que ninguém usa.
- [2026-09-15] [verificacao] **O selo "1 Issue" do overlay do Next apareceu no meu próprio
  screenshot e eu quase passei batido.** Era erro de compilação de verdade: um comentário
  JSX somado a um elemento dentro de um ramo de ternário são **dois filhos** onde cabe um,
  e a página servia a versão anterior em cache. Screenshot serve para ler a tela inteira,
  inclusive o que o framework escreve por cima dela — e `npm run build` teria pego, mas eu
  fotografei antes de rodar. Porquê de layout vai no doc do componente, não em comentário
  dentro do JSX.
- [2026-09-15] [produto] **Coluna que existe e ninguém escreve é promessa parada, e já é a
  terceira.** `posts.session_id` (0018), `students.status = 'convidado'` (0001) e agora
  `trainers.phone` (0001) — esta última desde a primeira migration, esperando o formulário
  que nunca veio. O doc 05 §11 pedia o botão de WhatsApp no perfil do aluno, e sem a metade
  do painel ele nunca apareceria para ninguém. **Costura tem duas pontas:** ao ligar um
  dado a uma tela, conferir quem o escreve antes de desenhar quem o lê.
- [2026-09-15] [banco] **Telefone se guarda normalizado, não como foi digitado.** Sem tirar
  o `55`, o mesmo número entra duas vezes de formas diferentes e a leitura desiste de
  formatar treze dígitos — o personal vê um bloco de números nas próprias configurações
  para sempre. Cortar o `55` só vale com doze ou treze dígitos: abaixo disso ele é o DDD de
  Caxias do Sul, e cortá-lo destrói o número.
- [2026-09-15] [banco] **Filtrar faixa de datas por dia solto manda meia-noite UTC ao
  banco.** `gte("starts_at", "2026-09-14")` parece certo e traz a sessão de domingo 21h
  como se fosse da semana seguinte, porque meia-noite UTC em São Paulo ainda é 21h do dia
  anterior. A faixa tem de ser convertida em instante **medindo** o deslocamento do fuso
  naquele dia (`inicioDoDiaEmUtc`), e não fixando "-03:00" — o Brasil já teve -02 e pode
  ter de novo.
- [2026-09-15] [ui] **Comparação de horário feita no cliente não pode usar instante.**
  `new Date("2026-09-15T18:00")` no navegador usa o fuso **do navegador**, então o aviso de
  conflito apareceria deslocado para quem estivesse fora do Brasil. Eu escrevi um comentário
  dizendo que "o fuso cancela dos dois lados" e não cancelava. O que funciona é comparar
  relógio com relógio: dia de calendário mais minuto do dia, os dois convertidos **no
  servidor**.
- [2026-09-15] [ux] **Vazio não vira sete cartões dizendo "vazio".** A semana sem sessão
  renderizava os sete dias com "Sem sessão." e ainda um cartão explicando que a semana
  estava vazia — ruído com a forma de conteúdo. O estado vazio **substitui** a lista e
  explica para que serve a tela, que é a pergunta de quem abre pela primeira vez.
- [2026-09-15] [processo] **Texto de diálogo é promessa igual a texto legal.** A caixa de
  agendar diz "o aluno vê a próxima sessão na tela inicial do app dele" — e no momento em
  que escrevi isso não havia linha nenhuma na home do aluno. A regra que já valia para a
  política de privacidade vale para qualquer copy: **conferir cada verbo contra uma tela que
  faz aquilo**, inclusive quando o verbo está num `descricao` de dialog.
- [2026-09-15] [ui] **`hasPendingWrites` não cobre o intervalo do debounce.** No roteiro do
  M3, o `onSnapshot` substituía o estado local pelo do servidor e a guarda de escrita
  pendente parecia suficiente — mas durante os 450ms do debounce **não há escrita nenhuma
  em voo**, então um retrato do servidor chegando nessa janela apagava a marca recém-feita,
  e a escrita seguinte gravava o estado já atropelado. Para quem usa, isso é "clico e não
  acontece nada". O primeiro toque grudava (documento vazio, a guarda `if (!dados.passos)`
  barrava), o que faz o defeito parecer aleatório em vez de sistemático.
  **O servidor é a base, o que foi tocado localmente vai por cima** — e desmarcar precisa
  de um `null` explícito na lista local, senão o servidor ressuscita a marca tirada.
- [2026-09-15] [verificacao] **Página com estado remoto não se confere só abrindo.** Em
  `file://` o `window.claude` não existe, o caminho do banco nem roda, e os cliques
  funcionam — foi exatamente o que eu vi antes de publicar. O defeito só aparece com um
  **dublê do banco** que imite latência e reemissão de retrato. Vale a pena montá-lo: são
  vinte linhas, e sem ele o teste passa por onde o usuário trava.
