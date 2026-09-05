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
| M1 | Fatia vertical | Convite → treino → execução → histórico | Roteiro completo com duas contas, treino executado na academia | construído · aguardando validação do Otávio |
| M2 | Utilidade contínua | Macrotreino, referência histórica, PRs, progresso, painel | Aluno usa duas semanas seguidas sem faltar nada | cards feitos · aguardando revisão e validação |
| M3 | Social e reavaliação | Feed, foto do treino, reavaliação física | Postar treino, comentar, comparar antes/depois | planejado (cortável) |
| M4 | Pronto para o piloto | PWA, estados vazios e de erro, e-mails, termos, acessibilidade | Alguém que não conhece o produto usa sem ajuda | planejado |

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

### Estado do M2

Os sete cards estão feitos. **Falta para fechar o milestone:**

1. A revisão adiada do M2-01 (rotação nos casos de borda, coerência de números
   entre painel e app do aluno).
2. Uma revisão consolidada do M2 inteiro — que no M1 achou três furos de RLS e
   um caminho de perda de dado, e aqui ainda não rodou.
3. O caminho completo com sessão real na máquina do Otávio, incluindo as
   migrations 0013, 0014 e 0015, que ainda não passaram por um app de verdade.

### Ordem

M2-01 primeiro (desbloqueia 05 e 06). M2-02 e M2-03 são independentes. M2-04 depois do
03, que produz as funções de PR que o gráfico reusa.
