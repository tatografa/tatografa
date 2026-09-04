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
| M2 | Utilidade contínua | Macrotreino, referência histórica, PRs, progresso, painel | Aluno usa duas semanas seguidas sem faltar nada | planejado |
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
| M2-01 | Macrotreino: gestão, rotação A/B/C/D e treino sugerido | senior | feito · aguarda checkpoint |
| M2-02 | Exercícios próprios do personal | pleno | a fazer |
| M2-03 | Referência histórica na execução e recordes na conclusão | pleno | a fazer |
| M2-04 | Progresso do aluno: planilha e gráfico | senior | a fazer |
| M2-05 | Home do aluno completa: streak, total, rotação | pleno | a fazer |
| M2-06 | Perfil do aluno no painel | pleno | a fazer |
| M2-07 | Dashboard do personal com alertas de inatividade | pleno | a fazer |

Já entregue no M1, apesar de constar na Fase 2 do roadmap: **link mágico para acessos
seguintes do aluno** (`/acesso`).

### Riscos que exigem checkpoint

- **M2-01** — muda a cadeia `mesocycles → workouts` que M1 inteiro consome, e substitui a
  decisão do macrotreino implícito. Contrato que desbloqueia M2-05 e M2-06.
- **M2-04** — nenhum risco de dado, mas é a tela que mais depende de leitura correta do
  histórico; erro aqui mente sobre a evolução do aluno.

### Ordem

M2-01 primeiro (desbloqueia 05 e 06). M2-02 e M2-03 são independentes. M2-04 depois do
03, que produz as funções de PR que o gráfico reusa.
