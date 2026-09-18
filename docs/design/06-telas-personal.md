# 06 · Telas do personal (web desktop)

Referência: `prototipos/Painel do Personal - Dashboard.dc.html` (painel completo, 9 páginas
navegáveis, com tema claro e escuro) e `prototipos/Fluxo do Personal - Login.dc.html`
(fluxo de autenticação em 6 etapas).

Contexto: desktop, largura de trabalho ~1400px, sidebar colapsável à esquerda. O personal usa
sentado, com tempo, montando treinos. Densidade de informação é bem-vinda aqui — o oposto do
app do aluno.

---

## Layout base

```
┌────────────┬──────────────────────────────────────────┐
│  sidebar   │  header: título · subtítulo · ação       │
│  colapsá-  ├──────────────────────────────────────────┤
│  vel       │                                          │
│            │  conteúdo da página                      │
│            │                                          │
└────────────┴──────────────────────────────────────────┘
```

- **Sidebar:** logo, navegação, avatar do personal no pé. Colapsa para faixa de ícones.
  Item ativo com marcador em `brand`.
- **Header:** título da página, subtítulo contextual e **um** botão de ação primária, que muda
  por página (ver tabela). Alternador de tema claro/escuro.
- **Toast** para confirmações; **dialog** para formulários curtos; página inteira para o editor
  de treino.

### Navegação e ação primária por página

| Rota | Página | Ação primária do header |
|---|---|---|
| `/painel` | Dashboard | Convidar aluno |
| `/painel/alunos` | Alunos | Novo aluno (assistente) |
| `/painel/alunos/[id]` | Perfil do aluno | Agendar sessão |
| `/painel/treinos` | Treinos | Enviar para aluno |
| `/painel/exercicios` | Exercícios | Novo exercício |
| `/painel/agenda` | Agenda | Agendar sessão |
| `/painel/social` | Social | — |
| `/painel/reavaliacoes` | Reavaliações | Nova reavaliação |
| `/painel/configuracoes` | Configurações | Editar |

---

## 1 · Login do personal (`/entrar`)

Layout de duas colunas iguais, altura total.

**Coluna esquerda** (`ink`, texto claro): logo + "reps club" 800/17px no topo; no meio,
eyebrow 700/12px `letter-spacing .08em` em `#ff6b6b` ("ÁREA DO PERSONAL TRAINER"), título
800/32px `line-height 1.2`, parágrafo 500/14.5px `line-height 1.6` em `#a3a3ad`; no pé,
dois indicadores (alunos ativos, treinos/mês).

**Coluna direita** (branca, formulário centralizado, máx. 372px):
- Título 800/25px, subtítulo 500/14px `#6b6b73`.
- Campos com label 600/12.5px `#52525b`, input padding 12/14px, raio 11px, borda 1.5px `#ededf0`.
  Foco: borda `brand` + anel `0 0 0 3px rgba(242,48,48,.12)`.
- "Esqueci minha senha" à direita do label de senha, em uma linha só.
- Mensagem de erro: 600/12.5px, texto `danger`, fundo `danger-bg`, raio 9px, padding 9/12px.
- Checkbox "Manter conectado neste computador".
- Botão primário largura total, raio 12px, sombra `0 10px 22px rgba(242,48,48,.28)`.
- Divisor "ou" e botão secundário "Continuar com Google".

### Etapas do fluxo (protótipo)
1. **Login** — validação: campos obrigatórios, formato de e-mail, senha mínima.
2. **Verificação em duas etapas** — campo de 6 dígitos, 700/22px, `letter-spacing .3em`,
   centralizado; e-mail mascarado; reenviar código.
3. **Recuperar acesso** — só e-mail.
4. **Link enviado** — confirmação, aviso de expiração em 30 minutos.
5. **Nova senha** — dois campos + medidor de força em três barras
   (`danger` → `#E9A23B` → `#22A06B`).
6. **Acesso liberado** — vai para o painel.

**Nota:** a verificação em duas etapas está desenhada, mas **não é obrigatória na v1**.
Implementá-la ou não muda o que o usuário faz na tela — decida com o Otávio.

---

## 2 · Dashboard (`/painel`)

Visão de comando do personal. O que ele precisa saber ao abrir:

- Indicadores do topo: alunos ativos, treinos executados na semana, aderência média,
  reavaliações pendentes.
- **Alunos que precisam de atenção**: quem não treina há X dias, quem não abriu o app, quem tem
  reavaliação vencida. Essa é a lista mais útil da página — não a esconda embaixo.
- Atividade recente: últimas sessões concluídas pelos alunos.
- Ação primária: convidar aluno (dialog com nome + e-mail, envia o convite).

## 3 · Alunos (`/painel/alunos`)

Tabela com busca e filtro por status. Colunas: aluno (avatar + nome + e-mail), objetivo,
macrotreino ativo, última sessão, aderência, status. Linha clicável abre o perfil.

Estado vazio: primeiro acesso do personal, sem aluno nenhum — mostre o caminho para convidar.

**Assistente de novo aluno:** passos de dados básicos → objetivo e nível → macrotreino inicial
(opcional) → envio do convite.

## 4 · Perfil do aluno (`/painel/alunos/[id]`)

A tela onde o personal passa mais tempo depois do editor de treino. Seções:

- Cabeçalho: avatar, nome, objetivo, contato (WhatsApp), status.
- Macrotreino ativo com progresso de semanas.
- Histórico de sessões: data, treino, duração, volume — clicável para ver série por série.
- Evolução por exercício: mesmo gráfico do app do aluno.
- Medidas e reavaliações, com comparação.
- Observações do personal sobre o aluno (privadas).

## 5 · Treinos (`/painel/treinos`)

Lista de macrotreinos e treinos. **O editor de treino é a parte mais pesada do painel** e a que
mais define se o personal adota o produto. Requisitos:

- Buscar exercício no catálogo + nos próprios, com filtro por grupo muscular e equipamento.
- Adicionar exercício ao treino e definir séries, repetições (aceitando faixas como "8-10"),
  descanso em segundos, técnica e observação.
- Reordenar exercícios por arraste.
- Duplicar treino e duplicar macrotreino inteiro (o personal reaproveita muito).
- Enviar/atribuir a um ou vários alunos.
- Salvar como rascunho antes de enviar.

Não bloqueie o personal por validação excessiva. Ele sabe o que está prescrevendo.

## 6 · Exercícios (`/painel/exercicios`)

Catálogo base (leitura) + exercícios do personal (edição), numa lista única com marcador visual
distinguindo os próprios. Campos ao criar: nome, grupo muscular, equipamento, peso corporal
(sim/não), unilateral (sim/não), descanso padrão, observação.

## 7 · Agenda (`/painel/agenda`)

Sessões presenciais por semana. Agendar, marcar como realizada, faltou ou cancelada.
Sem integração com calendário externo na v1.

## 8 · Social (`/painel/social`)

Posts dos alunos, com filtro por período. O personal comenta e curte. Estado vazio quando não
há posts no período.

## 9 · Reavaliações (`/painel/reavaliacoes`)

Liberar reavaliação para um aluno, acompanhar pendentes e ver as respondidas com comparação
antes/depois.

## 10 · Configurações (`/painel/configuracoes`)

Dados da conta em modo leitura, com botão "Editar" que troca para modo formulário.
Inclui **sair da conta** (com confirmação).

---

## Prioridade de construção do painel

Para a fatia vertical do roadmap, só estas partes são necessárias:

1. Login do personal (etapa 1 apenas).
2. Dashboard mínimo: lista de alunos + convidar aluno.
3. Editor de treino: criar um treino com exercícios do catálogo.
4. Atribuir o treino a um aluno.

O resto vem depois. Não construa as 9 páginas antes de o loop funcionar.

**Estado em 17/09/2026 (segunda leva).** O §5 ganhou **duplicar treino e duplicar
macrotreino** (`duplicar_treino` e `duplicar_macrotreino`, migration 0029). Duplicar um
programa para outro aluno **é** o "enviar/atribuir a um ou vários alunos" do mesmo
parágrafo. O que resta do §5, com o motivo:

| Item | Situação |
|---|---|
| Reordenar por arraste | Entregue por setas ↑↓ — mesmo resultado, melhor no teclado |
| Salvar como rascunho | Já existe como status: o programa nasce arquivado e é ativado |
| Sidebar colapsável | **Entregue em 18/09** (`components/personal/navegacao-lateral.tsx`) |

**Estado em 17/09/2026.** O §4 ganhou as observações privadas do personal — lista de
anotações datadas, visíveis só para ele (`trainer_notes`, migration 0028). O aluno não
tem policy de leitura, e a política de privacidade passou a declarar que elas existem.

**Estado em 16/09/2026.** As nove páginas existem. O §2 e o §3 foram fechados nesta data:
o dashboard ganhou o quarto indicador (reavaliações pendentes) e a atividade recente, e a
lista de alunos saiu dele para `/painel/alunos`, com tabela, busca e filtro. O que este
documento ainda pede e **não** existe, por decisão registrada no `CLAUDE.md`:

| Onde | O quê | Por quê não |
|---|---|---|
| §3 | Assistente de novo aluno | O aluno preenche o próprio perfil no onboarding |

**Estado em 18/09/2026.** O **layout base** fechou: a barra do topo saiu e entrou a
**navegação lateral colapsável** (236px aberta, 68px em faixa de ícones), com a preferência
guardada no aparelho. Item ativo com marcador de 3px em `brand`, rota mais específica
vencendo — `/painel` só acende em `/painel`. "Treinar" e "Configurações" ficam separados no
pé: o primeiro leva ao app do aluno, o segundo é da conta, não da carteira. O que a sidebar
do protótipo tem e **não** foi construído:

| O quê | Por quê não |
|---|---|
| Campo de busca global | Não existe busca que atravesse alunos, treinos e exercícios; campo que não acha nada é pior que campo nenhum |
| Card "Plano Pro · 24/40 alunos" | Pressupõe que o Reps Club cobra do personal — não há plano, preço nem pagamento no modelo |
| Alternador de tema claro/escuro | Os tokens `dark-*` existem para a execução do treino; modo escuro do painel é revisar cada componente |
| Avatar com foto no pé | Não há upload de foto de personal; o pé mostra nome e iniciais |

A referência visual `prototipos/Painel do Personal - Dashboard.dc.html` desenha um
dashboard **maior** que o §2 — receita mensal, ticket médio, churn, renovações,
distribuição por plano. Esses cinco dependem de plano, preço e pagamento, que não existem
no modelo de dados: são escopo de produto a decidir, não tela a construir.

**Estado em 18/09/2026 (alunos e ficha).** O §3 e o §4 fecharam contra os protótipos do
Otávio, menos o que depende de cobrança.

**§3 · Alunos** ganhou os quatro indicadores do topo e as colunas ordenáveis. Os
indicadores **não são os do protótipo**: "Renovações" e "de 40 vagas do plano" viraram
**Inativos** e **Precisam de atenção** — não há plano nem pagamento no modelo, e o "40"
seria inventado. Também **não** entraram: as caixas de seleção por linha (não existe
nenhuma ação em lote para elas dispararem) e a paginação (a carteira do piloto cabe numa
página, e o corte do servidor é o que vira filtro do servidor quando não couber).

**§4 · Perfil do aluno** virou duas colunas: identidade à esquerda (avatar, status,
sessões totais, dias seguidos, ficha de dados, WhatsApp e meta de peso) e o trabalho à
direita. A ação primária do cabeçalho passou a ser **Agendar sessão**, que leva à agenda
com o aluno já escolhido.

Quatro campos novos em `students` (migration 0034), todos informados **pelo aluno** no
perfil dele: telefone, cidade/UF, meta de peso e perfil biológico. Os dois últimos o
banco recusa se a escrita não vier da conta do próprio aluno.

O que dos dois protótipos continua fora, e por quê:

| Onde | O quê | Por quê não |
|---|---|---|
| §3 e §4 | Plano, Vencimento, Renovações, "24 de 40 vagas" | Cobrança não existe no modelo de dados |
| §3 | Caixas de seleção por linha | Nenhuma ação em lote para elas dispararem |
| §3 | Paginação | A carteira cabe numa página; busca e filtro já rodam na tela |
| §4 | Feed do aluno dentro da ficha | Existe em `/painel/social`, com a fila de "sem resposta" — duplicar aqui seria a mesma leitura em dois lugares |
| §4 | Foto do corpo na ficha | Fica em `/painel/reavaliacoes`: ver a foto de alguém exige intenção |

**Estado em 18/09/2026 (gráficos).** Os **três gráficos do protótipo que saem de dado que
já existe** foram construídos (`components/personal/graficos-do-painel.tsx`, RPCs da
migration 0033):

| Gráfico | O que mostra | De onde sai |
|---|---|---|
| Evolução mensal de alunos | Tamanho acumulado da carteira ao fim de cada um dos 12 meses | `students.created_at` |
| Atividade diária | Sessões concluídas por dia nos últimos 30 dias | `workout_sessions` |
| Top 10 progressões | Maiores ganhos de carga por par (aluno, exercício) em 90 dias | `session_sets` |

Eles ficam **abaixo** dos alertas e da atividade recente, não no topo como no protótipo:
o dashboard responde "o que mudou hoje", e a tendência é a camada seguinte.

O que o protótipo desenha aqui e **continua** fora, todo pelo mesmo motivo — depende de
decisão de produto, não de tela:

| O quê | O que falta decidir |
|---|---|
| Ticket médio, Receita mensal, Churn, Renovações, Distribuição por plano | Se o Reps Club cobra do personal: não há plano, preço nem pagamento no modelo |
| "24 de 40 alunos · Plano Pro" | O mesmo — e o "40" seria inventado |
| Presencial × Online | Um campo no cadastro do aluno que hoje não existe |
