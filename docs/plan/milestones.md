# Milestones — Reps Club

> Fatias verticais do `07-roadmap.md` do handoff, no formato do método. Todo milestone
> entrega algo que alguém usa de ponta a ponta e que o Otávio valida sozinho.
>
> Ordem que não muda: execução do treino antes de qualquer coisa social · histórico antes
> de gráfico · um treino funcionando antes de macrotreino com rotação · catálogo base antes
> de exercícios próprios · piloto antes de cobrança.

| # | Nome | Entrega (linguagem de negócio) | Como o Otávio valida | Status |
|---|---|---|---|---|
| M0 | Fundação | Conta de personal, login, painel protegido | Criar conta, entrar, ver `/painel` | validado |
| M1 | Fatia vertical | Convite → treino → execução → histórico | Roteiro completo com duas contas, treino executado na academia | **validado em campo** |
| M2 | Utilidade contínua | Macrotreino, referência histórica, PRs, progresso, painel | Aluno usa duas semanas seguidas sem faltar nada | **validado em campo** |
| M3 | Social e reavaliação | Feed, foto do treino, reavaliação física | Postar treino, comentar, comparar antes/depois | construído · falta validar em campo |
| M4 | Pronto para o piloto | PWA, estados vazios e de erro, e-mails, termos, acessibilidade | Alguém que não conhece o produto usa sem ajuda | **código feito · piloto começando** |

---

## M1 · Fatia vertical (em andamento)

O coração do produto. Nada além disso.

**Pronto quando:** o Otávio, com duas contas, convida um aluno, monta um treino, executa
esse treino no celular numa academia de verdade, e vê o registro correto no histórico.

**Este é o marco de validação.** Não avançar para M2 antes de fazer isso na academia, com
o celular na mão. É onde os problemas reais aparecem.

### Cards

| Card | Escopo | Etiqueta | Status |
|---|---|---|---|
| M1-01 | Convite do aluno: personal gera link copiável | pleno | feito |
| M1-02 | Onboarding do aluno em `/convite/[token]` | pleno | feito |
| M1-03 | Editor de treino no painel | senior | feito · checkpoint aprovado |
| M1-04 | App do aluno: home e detalhe do treino | pleno | feito |
| M1-05 | Execução do treino série por série | senior | feito · checkpoint aprovado |
| M1-06 | Histórico de sessões | pleno | feito |

### Riscos que exigem checkpoint

Pela lei 2 do método, checkpoint técnico antecipado é obrigatório em schema/migração, auth,
PII e contrato que desbloqueia o frontend. Neste milestone:

- **M1-01/02** — auth e migração. _Checkpoint feito:_ RLS e gatilho validados por SQL
  contra reúso de token, token inventado, e-mail divergente e convite expirado.
- **M1-03** — contrato que desbloqueia M1-04 e M1-05. Termina com handoff escrito em
  `docs/handoffs/`.
- **M1-05** — a tela mais sensível do produto. Estado da sessão precisa sobreviver a rede
  ruim e a tela bloqueada; timer por timestamp, nunca por contador.

### Pendências não-dev

- Conectar a Vercel para preview por branch (hoje a validação é local).
- Definir se o piloto usa projeto Supabase separado de produção antes de M4.

---

## M2 · Utilidade contínua

O que transforma o app de demonstração em ferramenta de uso semanal.

**Pronto quando:** um aluno usa o app por duas semanas seguidas sem que falte nada
essencial, e o personal acompanha sem precisar perguntar nada ao aluno.

### Cards

| Card | Escopo | Etiqueta | Status |
|---|---|---|---|
| M2-01 | Macrotreino: gestão, rotação A/B/C/D e treino sugerido | senior | feito · checkpoint parcial |
| M2-02 | Exercícios próprios do personal | pleno | feito |
| M2-03 | Referência histórica na execução e recordes na conclusão | pleno | feito |
| M2-04 | Progresso do aluno: planilha e gráfico | senior | feito |
| M2-05 | Home do aluno completa: streak, total, rotação | pleno | feito |
| M2-06 | Perfil do aluno no painel | pleno | feito |
| M2-07 | Dashboard do personal com alertas de inatividade | pleno | feito |

Já entregue no M1, apesar de constar na Fase 2 do roadmap: **link mágico para acessos
seguintes do aluno** (`/acesso`).

### Riscos que exigem checkpoint

- **M2-01** — muda a cadeia `mesocycles → workouts` que M1 inteiro consome, e substitui a
  decisão do macrotreino implícito. Contrato que desbloqueia M2-05 e M2-06.
- **M2-04** — nenhum risco de dado, mas é a tela que mais depende de leitura correta do
  histórico; erro aqui mente sobre a evolução do aluno.

### Checkpoint do M2-01 — parcial, e por quê

O revisor não rodou: a conta bateu o limite mensal de gastos no meio da execução. Revisei
eu mesmo os pontos de maior risco, por leitura de código e SQL:

- **Regressão no M1:** `listarTreinosPorAluno` tem um único consumidor
  (`/painel/treinos`), e passou a filtrar `status = 'ativo'` — a dívida que o brief
  apontava. Superfície menor do que o risco previa.
- **Programa vindo da URL:** conferido no servidor (`lerMacrotreino` devolve nulo para id
  inexistente e para programa alheio, e a página recusa programa arquivado); `salvarTreino`
  refaz a checagem.
- **Funções novas de banco:** `treinos_feitos_na_semana` e `ativar_macrotreino` são
  `security invoker` em `public` — não alargam acesso. A única `security definer`
  (`mesociclo_tem_historico`) está em `private`, com execute revogado de `public`/`anon`.
  Segue a convenção.
- **Um ativo por aluno:** índice parcial reproduzido por SQL — primeiro passa, segundo
  recusado, arquivado convive.

**Não coberto, e precisa de revisão antes do fechamento do M2:** a rotação em todos os
casos de borda (o dev cobriu 16 casos por teste de função pura, mas ninguém releu), a
coerência de números entre painel e app do aluno, e o caminho completo do M1 com sessão
real — este último depende da máquina do Otávio, não de revisor.

### Decisão do Otávio no M2-03: o stepper abre no peso da última vez **daquela série**

Com a referência na tela ficou visível o que antes não incomodava: o stepper de
carga abria em 0 kg mesmo com a pílula dizendo o peso da última vez. Perguntado,
o Otávio decidiu — e foi específico: **por série, não por exercício**. Se na
série 1 ele levantou 50 kg, a série 1 abre em 50; se na série 2 foram 60, a
série 2 abre em 60.

Isso é mais do que memória do exercício: quem rampa (50, 60, 60, 65) seria
rebaixado pela regra que já existia, que repetia a série anterior **de hoje**.
Por isso a última vez tem precedência sobre ela. A ordem final está comentada em
`padraoPara` (`execucao.tsx`):

1. a própria série, se já registrada — é correção;
2. a mesma série da última vez — só a carga; as reps ficam no alvo prescrito,
   senão um dia em que o aluno falhou em 8 rebaixaria a meta de 10 para sempre;
3. a série anterior desta sessão — cobre treino com mais séries que o anterior;
4. zero — primeira vez no exercício.

Custo aceito e declarado: quem confirmar sem olhar registra o peso da última vez
em vez do de hoje.

### Ponto em aberto do M2-03 para o Otávio

A pílula mostra **a série mais pesada** da última sessão (critério do card), e o
stepper agora abre na **mesma série**. Numa rampa os dois números divergem na
tela: a pílula diz "Última vez: 65 kg × 6" enquanto a série 1 abre em 50 kg.
Não é erro — são duas perguntas diferentes ("como foi o dia?" e "com quanto
começo esta série?") —, mas é a única incoerência visual que sobrou. Alternativa,
se incomodar no piloto: a pílula passar a mostrar a mesma série ("Última vez
nesta série: 50 kg × 10"). Fica como está até o Otávio ver na academia.

### Leitura do M2-04: como o eixo do gráfico foi interpretado

O doc 05 pede "mais recente primeiro" na tela de progresso, e isso vale para as
**listas**: os exercícios saem pelo treinado mais recentemente, e o acordeão
abre nas três sessões mais recentes. **O eixo do gráfico é o contrário: mais
antigo à esquerda.** Uma linha do tempo invertida faria uma linha subindo
significar carga caindo — exatamente o "mentir sobre a evolução do aluno" que o
card avisa. Se o Otávio quiser o outro sentido, é uma linha em
`linhaDoGrafico`.

Dois limites declarados no card e aceitos aqui:

- **Alvo de toque no gráfico.** As faixas clicáveis dividem a largura da tela
  entre os pontos, então 44px por ponto é geometricamente impossível a partir de
  nove sessões. Por isso o gráfico abre em **6 sessões** (faixas de 58×146px);
  em "Total" com oito treinos a faixa cai para 44px, e continua encolhendo. Quem
  troca o filtro escolhe isso sabendo.
- **Teto de 60 sessões por exercício.** A tela carrega o histórico inteiro de
  uma vez para o acordeão e o filtro não irem ao servidor, e sessenta sessões do
  mesmo exercício são cinco meses treinando três vezes por semana. A tela avisa
  quando encosta no teto.

### Migration nova no M2-05, e por que não pede checkpoint

`0013_dias_de_treino` acrescenta uma função de **leitura**, `security invoker`,
em `public`: ela lê `workout_sessions` com o RLS de quem chama, então não alarga
acesso nenhum — provado por SQL (aluno pedindo os dias de outro aluno recebe
lista vazia; personal alheio idem; personal do próprio aluno continua vendo).

Ela existe porque a sequência precisa saber **quais dias** tiveram treino, não
quantas sessões existem — e agrupar isso em memória repetiria o erro que a
migration 0008 pagou, com um sintoma pior: sequência encurtada em silêncio.

**A fronteira de dia está escrita em dois lugares** — o `at time zone
'America/Sao_Paulo'` da função e o `FUSO` de `lib/domain/fuso.ts`. É o preço de
agrupar no banco, e por isso a prova cobre justamente o horário em que os dois
poderiam discordar: sessão às 23h30 UTC (20h30 no Brasil) cai no dia certo, e
sessão às 02h UTC cai no dia anterior. Se um dia mudar, muda nos dois.

### O que o M2-06 mostrou sobre quem barra o quê

O RLS de `students`, `mesocycles`, `workout_sessions` e `session_sets` já
segurava tudo o que o card pedia — nenhuma policy nova. Mas a prova por SQL
achou um caso que **o RLS não barra e nunca vai barrar**: dois alunos do
**mesmo** personal. Ele pode ler os dois, então
`/painel/alunos/<A>/sessoes/<sessão do B>` só devolve nada porque
`lerSessaoDoHistorico` filtra por `student_id` além do id da sessão.

É a convenção do projeto ("a query não deve depender só da policy para saber de
quem é o dado") valendo na direção contrária da usual: aqui não é redundância,
é a única trava. Quem escrever outra rota aninhada em `/painel/alunos/[id]/`
precisa repetir o filtro.

### Duas semanas no M2-07, e por que elas são diferentes

O painel mostra "treinos executados **esta semana**", e essa semana **não é** a
do programa. `janelaDaSemana` (rotação) conta a partir do `started_at` de cada
programa — a semana 2 da Carla começa numa quarta e a do João num sábado —,
então ela é individual e não agrega. Para somar a carteira inteira só existe uma
semana que todo mundo divide: a de calendário, segunda a domingo, no fuso do
produto (`semanaDoCalendario`, em `lib/domain/atencao.ts`).

As duas continuam existindo de propósito. Se um dia elas aparecerem lado a lado
na mesma tela, o rótulo tem que dizer qual é qual.

### Revisão consolidada do M2 — feita, e o que ela achou

Rodou sobre `git diff 0e6630a..HEAD` (~5600 linhas, 115 arquivos). **Veredito:
aprovado**, sem bloqueador. As três classes de defeito que a revisão do M1 achou
não se repetiram: nenhum furo de RLS, nenhum vazamento entre alunos ou
personais, nenhum ramo destrutivo decidido por medida cega. A revisão também
cobriu os pontos que o checkpoint do M2-01 tinha deixado em aberto — rotação nos
casos de borda e coerência de números entre painel e app — e não achou problema
neles, então **a pendência do M2-01 está fechada**.

Três correções entraram depois dela:

1. **`salvarExercicio` dizia "salvo" sobre uma escrita que não aconteceu.** O
   `update` filtrado por `trainer_id` devolve zero linhas sem erro quando o id
   não é do personal, e a ação devolvia `sucesso`. Achado do revisor; corrigido
   com `count: "exact"`, como `salvarPrograma` já fazia.
2. **`listarAlunos` fazia aluno ativo parecer inativo.** Este é o mais grave, e
   o revisor o classificou como sugestão — verificando, é pior do que parece. A
   função varria **todas** as sessões concluídas da carteira para achar a mais
   recente de cada aluno, sem paginação. Passando do teto de página do
   PostgREST, o aluno que treinou há três meses volta como `ultima_sessao =
   null`. No M1 isso era um rótulo errado na lista; **o M2-07 transformou o mesmo
   dado em alerta**, e o aluno que treina toda semana apareceria em "precisam de
   atenção" dizendo "entrou há 200 dias e ainda não treinou". Corrigido pela
   migration `0016`, com `distinct on` no banco. Reproduzido por SQL antes
   (página cortada → 1 aluno com data em vez de 2) e depois (os dois, com as
   datas certas).
3. **`listarProgramasPorAluno` sem paginação**, sugestão do revisor — e ela
   deixou de ser cosmética no M2-07, porque o `total_treinos` do programa ativo
   virou o denominador da aderência. Programa perdido = aluno fora da média.

### O que o teste de campo achou (setembro/2026)

Primeira vez que M1 e M2 rodaram com Supabase de verdade. Ao fim de três
rodadas, **47 dos 51 passos bateram** — o roteiro inteiro foi percorrido,
incluindo o painel do personal e o caso do celular sem sinal. Execução série a
série, referência da última vez, recorde, progresso e a coerência de números
entre painel e app funcionam com dado real.

Nenhum defeito encontrado estava na lógica de negócio, nas policies ou nos
números. **Todos estavam nas bordas que este ambiente não alcança** —
autenticação, troca de conta e estado de sessão:

1. **O aluno não tinha como sair.** O botão existia só no painel, e o proxy
   devolve todo usuário logado que abre `/entrar`, `/cadastro` ou `/acesso` para
   a própria área. Conta de aluno virava armadilha: trocar de conta exigia
   limpar cookies. Corrigido com `/app/perfil` e a aba Perfil ligada.
2. **O texto expulsava o aluno da porta que funcionava.** Com o e-mail de
   confirmação caindo em `localhost` e o link mágico travado no limite de envio,
   sobrava a senha do onboarding — e a única frase que apontava para ela dizia
   "É personal trainer?". Corrigido.
3. **A sessão em andamento era invisível.** O aluno registrou 6 séries, saiu sem
   concluir, e a home não dizia nada — sessão sem `finished_at` não aparece no
   histórico (é "agora", não passado), e só ao tentar começar outro treino é que
   ele esbarrava nela. **Não houve perda de dado:** as 6 séries estavam no
   banco. O defeito era não haver como vê-las. Corrigido com o card "Treino em
   andamento" na home, que substitui o card de próximo treino.
4. **O contador de séries pendentes era só um ícone.** No teste, o aluno viu
   "um ícone de nuvem" e não soube o que era — justamente o aviso que torna
   aceitável a fila viver no aparelho. Ganhou rótulo visível ("1 a enviar").
5. **Confirmação de e-mail continua sendo o gargalo do piloto.** O convite virou
   link copiável em 2026-08-31 justamente por causa do limite de ~2 e-mails/hora,
   mas o `signUp` do aluno ainda dispara uma confirmação. Decisão pendente do
   Otávio: desligar a confirmação de e-mail no Supabase — o token do convite já
   prova o canal.

### Estado do M2: fechado

**50 dos 51 passos bateram.** O único que ficou marcado como falha (P8.2, o
contador de séries pendentes lido como "um ícone de nuvem") foi corrigido no
commit `b756da2`, antes do último deploy que o Otávio testou.

Os sete cards, a revisão consolidada e a validação em campo — os três passaram.
**M1 e M2 estão validados.**

### As três perguntas de produto, respondidas pelo uso

O roteiro pedia explicitamente que o Otávio anotasse se alguma delas o
incomodasse. Ele percorreu os passos que as expõem e não anotou nenhuma, então
ficam como estão — e ficam registradas aqui para não serem reabertas por
suposição:

1. **A pílula mostra o pico do dia e o stepper abre na mesma série.** Numa rampa
   os dois números divergem (P5.3 e P5.4 bateram).
2. **O eixo do gráfico vai do mais antigo para o mais recente** (P6.3 bateu).
3. **Sete dias é o padrão do alerta de inatividade** (P7.3 e P7.4 bateram).

### Ordem

M2-01 primeiro (desbloqueia 05 e 06). M2-02 e M2-03 são independentes. M2-04 depois do
03, que produz as funções de PR que o gráfico reusa.

---

## O que o piloto precisa responder

Além de "ele volta?", três perguntas que só o uso real decide — e que estão
propositalmente sem resposta até lá:

1. **A espera entre convite e treino incomoda?** O aluno só existe no banco
   depois de criar a senha, então o personal não monta nada antes. Com um aluno
   por vez é irrelevante; com dez, vira fila. Desacoplar `students.id` de
   `auth.users` resolveria, e mexe em toda policy de acesso — por isso espera.
2. **O personal precisa aceitar termos ao criar a conta?** Hoje só o aluno
   aceita. São ~20 linhas, mas é atrito num fluxo já validado.
3. **O M3 (feed, fotos, reavaliação) tem demanda?** Foi adiado justamente para
   esta pergunta sair do piloto em vez de suposição.

## M4 · Pronto para o piloto (em andamento)

O que separa "funciona" de "outra pessoa consegue usar".

**Pronto quando:** um aluno de verdade — não o Otávio — recebe o convite, instala,
treina duas semanas e volta sozinho, sem ninguém explicando.

**O M3 foi adiado de propósito.** Ele está marcado como cortável desde o
planejamento e adiciona valor social a um produto que ainda não foi usado por
ninguém de fora. Depois do piloto ele se decide com informação em vez de
suposição.

### Cards

| Card | Escopo | Etiqueta | Status |
|---|---|---|---|
| M4-01 | PWA: instalar, funcionar sem sinal, alarme de descanso | senior | feito · checkpoint aprovado |
| M4-02 | E-mail que chega de verdade | pleno | **feito e validado em 13/09** |
| M4-03 | Erros, estados vazios e de carregamento | pleno | feito |
| M4-04 | Acessibilidade: teclado, leitor de tela, contraste | pleno | feito · VoiceOver dispensado pelo Otávio |
| M4-05 | Termos de uso e privacidade | junior | feito · **texto é rascunho** |

### Riscos que exigem checkpoint

- **M4-01** — o service worker decide o que o navegador serve. Cache de rota autenticada
  mostra o treino de um aluno para outro. Checkpoint antes de qualquer estratégia que
  toque `/app` ou `/painel`.
- **M4-02** — resolvido sem provedor novo: SMTP da Hostinger, que o Otávio já paga. O
  token do convite **não** passa a viajar por e-mail; o convite segue no WhatsApp.

### O que o M4-03 entregou

Sete boundaries onde antes não havia **nenhum**, em 28 rotas: `global-error`,
`app/error.tsx`, `app/not-found.tsx`, mais erro e 404 próprios de `/app` e de
`/painel` — estes dois com a navegação de pé, para o usuário perder a tela e não
o app. Quatro `loading.tsx` nas rotas de consulta pesada.

`docs/plan/inventario-de-rotas.md` é o inventário que o card pedia: cada rota,
com seu vazio, seu erro e seu carregamento, e o que falta em cada uma.

**A descoberta do card:** `error.tsx` não envolve o `layout.tsx` do próprio
segmento. Como a autorização mora no layout (`requireStudent`,
`requireTrainer`), a leitura mais provável de falhar no produto inteiro passava
por cima dos boundaries de `/app` e `/painel` e caía no `global-error` — que
troca o documento e não carrega o CSS. `app/error.tsx` fecha isso, e a regra
foi confirmada no navegador antes de virar código.

Junto veio uma correção do teste de campo: o onboarding do convite perdia
nascimento, peso e altura quando a Server Action falhava por algo que não era
culpa do aluno. O React reseta o formulário depois da ação; agora os campos
voltam pelo estado, menos a senha, que não tem por que viajar de volta.

### O que o M4-04 entregou

Auditoria com axe-core em 15 telas — 11 rotas públicas e 4 telas com sessão,
renderizadas com props fixas. De **17 violações a zero**. Todas eram de
contraste: rótulo, landmark e nome acessível já estavam certos desde o M1, e a
árvore de acessibilidade da execução mostra os 21 controles nomeados, incluindo
"Corrigir série 1: 50 kg, 10 repetições".

A paleta mudou de valor, não de identidade. O vermelho da ação escureceu de
`#ff2a2a` para `#cf2222` — branco em cima dava 3.73, e nenhum tamanho de botão
deste app chega a "texto grande", que seria o único jeito de 3.73 passar. **Um
vermelho não serve aos dois temas** (escuro sobre preto reprova, vivo sobre
branco reprova), então o vivo virou `brand-on-dark` e segue sendo a marca na
execução.

Dois achados que auditoria automática não pega, e os dois eram reais:

- **`dark-muted` a 2.23** na execução — o número da série e o "—" do que falta.
  O axe não resolve fundo transparente e marca "incompleto" em silêncio; quem
  pegou foi a conta de contraste feita token a token, fora do navegador.
- **Alvo de toque**: o link "← Treinos" tinha **14px de altura**, um terço do
  mínimo, num app operado de pé com a mão suada. Eram cinco cópias do mesmo link
  escrito à mão — viraram um componente.

Também caiu uma armadilha de design system: **`bg-X/15 text-X` reprova sempre**.
A cor diluída sobre si mesma estaciona em 4.1, para verde, vermelho e âmbar
igualmente. Fundo claro precisa de token próprio.

**O critério do leitor de tela não foi cumprido, e não vai ser.** O card pedia
teste com VoiceOver no iOS; o Otávio decidiu em 13/09 que não vai executá-lo.
Fica registrado como limite conhecido, não como pendência: o que a auditoria
automática, a árvore de acessibilidade e o passeio de teclado cobrem está
conferido; o que só o uso real com leitor de tela revelaria, não está. O
roteiro continua em `docs/plan/M4-04-roteiro-voiceover.md` caso ele mude de
ideia ou apareça alguém para rodá-lo.

### O que o M4-05 entregou

`/termos` e `/privacidade` públicas, o checkbox do onboarding linkando para
elas, rodapé nas telas públicas, e o aceite gravado.

**A decisão de schema é o miolo do card.** `students_update` deixa o aluno
editar a própria linha, então uma coluna `termos_aceitos_em` ali seria prova
que o próprio aceitante pode reescrever. `term_acceptances` (migration 0017) é
append-only: select e insert têm policy, update e delete **não têm nenhuma** —
com RLS ligado, a ausência é a proibição. Uma linha por versão, porque texto
novo exige aceite novo e o antigo precisa continuar existindo.

A data vem do gatilho `private.carimba_aceite`, não do cliente. O `default` da
coluna não bastava: default só vale para quem omite o campo, e um POST direto
não omite. Provado com um insert de data forjada (2020) que saiu carimbado com
a hora do banco.

**O texto é rascunho de dev, não peça jurídica.** Escrito a partir do
inventário real do banco — cada dado citado existe como coluna. O e-mail de
contato ficou como `[DEFINIR]` **visível na página**: não publiquei o e-mail
pessoal do Otávio numa página aberta, e um marcador gritante é mais difícil de
esquecer que um endereço plausível.

**Buraco declarado:** o personal não aceita nada. O cadastro dele não tem
checkbox, o card só pedia o do aluno, e adicionar atrito a um fluxo já validado
em campo é decisão de produto. São ~20 linhas quando o Otávio decidir.

### O que o M4-02 entregou

O card foi **reescrito**: pedia provedor de e-mail novo e estava bloqueado
esperando dinheiro. O Otávio já tem `repsclub.com.br` e conta paga na Hostinger,
que inclui SMTP — e apareceu um defeito mais grave que o escopo original.

**`/recuperar` e `/acesso` diziam "link enviado" quando o envio falhava.** O
serviço embutido do Supabase não é só limitado em volume: ele **só entrega para
endereços da equipe do projeto** e recusa o resto com `Email address not
authorized`. O filtro das duas ações só deixava passar `rate limit`, então a
recusa caía no ramo de sucesso. Para qualquer aluno de verdade, "Esqueci minha
senha" mostrava confirmação e nada acontecia — e o teste de campo não pegou
porque o e-mail do Otávio está na equipe.

A correção separa duas coisas que vinham juntas: **falha de envio é nossa e
aparece**; "esse e-mail tem conta?" continua calado, que é o que protege contra
enumeração. Mostrar a primeira não vaza nada — a recusa vale para qualquer
endereço, com ou sem conta. Conferido com dez mensagens reais do Supabase,
incluindo as duas que precisam continuar mudas.

Isso corrigiu também uma **decisão de arquitetura errada** no `CLAUDE.md`: o
motivo registrado para o convite por WhatsApp era "~2 e-mails/hora". Nunca foi
volume, era lista de convidados. A decisão continua certa; o motivo, não.

**Fechado em 13/09.** Domínio `repsclub.com.br` apontando para a Vercel, SMTP
da Hostinger ligado, e `/recuperar` entregando: o log do Supabase registra
`200` às 21:34, depois de cinco tentativas com `535`.

A causa do `535` não era propagação nem porta — era a senha no campo do
Supabase, que continuava sendo a antiga da caixa. Diagnóstico registrado no
card: hipóteses sobre o mecanismo vieram antes da pergunta mais simples, que
era **qual** credencial estava lá.

### Checkpoint do M4-01 — aprovado

A estratégia escolhida é a conservadora que o card autorizava: **nenhuma
resposta de navegação entra no cache**. Só o build estático do Next (nome com
hash), ícones, `logo.svg` e `/offline`, que é pública.

Verificado contra o build de produção, com o worker ativo e navegação por quatro
rotas: **20 entradas no cache, e a única página é `/offline`**. Sem rede, a
navegação cai nela em vez de no erro do navegador. Contrato e prova em
`docs/handoffs/pwa.md`.

**Duas premissas do card caíram na implementação**, e estão registradas no
handoff:

1. **Migrar a fila para IndexedDB não resolveria o limite declarado.** "Limpar
   dados de navegação" apaga `localStorage` e IndexedDB juntos — mesmo gesto,
   mesmo lugar. O que ajuda é `navigator.storage.persist()` (aplicado), contra o
   descarte automático por pressão de disco. A fila continua em `localStorage`.
2. **O Next 16 tem `experimental.useOffline`** — detecção de conexão e reenvio
   automático de navegação e Server Action. Ligado, e **não** substitui a fila:
   confirmar série tem que ser local e imediato.

### Bloqueios que dependem do Otávio

Dois cards não podem começar sem decisão dele:

| O quê | Trava qual card | Custa? |
|---|---|---|
| ~~Provedor de e-mail~~ | ~~M4-02~~ | **resolvido**: SMTP da Hostinger, já pago |
| ~~Domínio próprio~~ | ~~M4-02~~ | **resolvido**: `repsclub.com.br`, já tem |
| Texto de termos e privacidade | M4-05 | Advogado, se quiser revisão |
| Projeto Supabase separado para produção | nenhum card, mas trava o piloto | Free tier serve |

### Ordem

**Todo o código do M4 está feito.** O que falta é configuração e decisão, não
programação:

| Pendência | De quem | Custo |
|---|---|---|
| Ligar o SMTP da Hostinger no Supabase | Otávio | zero (já paga) |
| Apontar `repsclub.com.br` para a Vercel | Otávio | zero (já tem) |
| Criar a caixa `contato@repsclub.com.br` | Otávio | zero |
| Revisar o rascunho de termos e privacidade | advogado | a decidir |
| Decidir se o personal também aceita os termos | Otávio | ~20 linhas |

Roteiro das três primeiras: `docs/plan/configurar-dominio-e-email.md`.
