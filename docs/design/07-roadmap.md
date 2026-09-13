# 07 · Roadmap até o lançamento

Premissas que definem este plano: **algumas horas por semana**, uma pessoa trabalhando com o
Claude Code, sem prazo externo, objetivo de validar com 2-5 personais e ~50 alunos.

Por isso o plano é em **fatias verticais**: cada fase entrega algo que alguém consegue usar de
ponta a ponta. Não há uma fase de "back-end" separada de uma fase de "front-end".

Estimativa total: **14 a 16 semanas** de calendário até o piloto no ar. Comece na semana 1 e
mova o marco quando a realidade divergir — não tente comprimir o plano.

---

## Fase 0 · Fundação (semanas 1–2)

Sem interface de produto. Só o terreno.

- Projeto Next.js + Tailwind + TypeScript, rodando na Vercel.
- Projetos Supabase de desenvolvimento e produção.
- Schema inicial: `trainers`, `students`, `invites`, `exercises_catalog`, `exercises`,
  `mesocycles`, `workouts`, `workout_exercises`, `workout_sessions`, `session_sets`.
- Carga do catálogo de exercícios a partir de `data/exercicios.json`.
- Regras de acesso em nível de linha em todas as tabelas.
- Login do personal (e-mail + senha) funcionando de verdade.
- Componentes base: Button, Input, Card, Badge (de `04-design-tokens.md`).

**Pronto quando:** você cria uma conta de personal, entra, e vê uma página vazia protegida.

---

## Fase 1 · A fatia vertical (semanas 3–7)

O coração do produto. Nada além disso.

**Lado do personal:**
- Convidar aluno por e-mail (dialog + envio + `invites`).
- Criar um treino: buscar exercício no catálogo, definir séries, reps, descanso, ordem.
- Atribuir o treino a um aluno.

**Lado do aluno:**
- Abrir o convite, definir perfil, entrar (`/convite/[token]`).
- Home com o próximo treino.
- Detalhe do treino com os exercícios prescritos.
- **Execução:** série por série, stepper de carga e reps, confirmar, timer de descanso,
  concluir treino.
- Histórico: lista das sessões concluídas com carga e reps por série.

**Pronto quando:** o Otávio, usando duas contas, convida um aluno, monta um treino, executa esse
treino no celular de verdade em uma academia, e vê o registro correto no histórico.

**Esse é o marco de validação.** Não avance para a fase 2 antes de fazer isso na academia, com o
celular na mão, suado. É onde os problemas reais aparecem.

---

## Fase 2 · Utilidade contínua (semanas 8–10)

O que transforma o app de demonstração em ferramenta de uso semanal.

- Macrotreino: vários treinos (A/B/C/D), rotação, semana atual, treino sugerido.
- Referência histórica na execução ("última vez: 60kg × 10").
- Recordes pessoais na conclusão do treino.
- Progresso: planilha em acordeão e gráfico de evolução por exercício com filtro
  6 / 12 / total.
- Sequência de dias e total de sessões na home.
- Painel: lista de alunos, perfil do aluno com histórico de sessões, dashboard com alertas de
  inatividade.
- Exercícios próprios do personal.
- Link mágico para acessos seguintes do aluno.

**Pronto quando:** um aluno consegue usar o app por duas semanas seguidas sem que falte nada
essencial, e o personal consegue acompanhar sem perguntar nada ao aluno.

---

## Fase 3 · Social e reavaliação (semanas 11–12)

- Foto do treino, com compressão no cliente.
- Compositor de post com escolha de alcance.
- Feed com curtida e comentário; abas Público / Personal.
- Reavaliação: liberação pelo personal, formulário de medidas e fotos, comparação antes/depois.
- Painel: página Social e página Reavaliações.

Esta fase é cortável. Se as fases 1 e 2 atrasarem, o piloto pode começar sem feed.

---

## Fase 4 · Pronto para o piloto (semanas 13–14)

Nada de funcionalidade nova. Só o que faz um piloto não fracassar por motivo bobo.

- PWA: manifest, ícones, "adicionar à tela de início", teste em iOS e Android reais.
- Estados vazios em todas as telas (aluno novo, personal sem aluno, sem histórico).
- Estados de erro e de carregamento. Falha de rede na execução do treino não pode perder dados.
- E-mails transacionais com aparência decente: convite, link mágico, recuperação de senha.
- Landing page publicada no domínio, com formulário de contato.
- Termos de uso e política de privacidade (obrigatório: você guarda foto e peso de pessoas).
- Acessibilidade básica: alvos de toque, contraste, foco visível, navegação por teclado no painel.
- Teste em celular de verdade: iPhone e Android, com internet ruim.
- Página de suporte ou canal direto de WhatsApp para o piloto.

**Pronto quando:** você entrega o link para alguém que não conhece o produto e essa pessoa
consegue usar sem você ao lado.

---

## Fase 5 · Piloto no ar (semanas 15–16 e seguintes)

Ver `08-piloto-e-gtm.md`. Durante o piloto, o desenvolvimento muda de modo: você não constrói
o próximo módulo, você conserta o que os personais reclamam.

Reserve **pelo menos 4 semanas de piloto** antes de decidir qualquer coisa sobre monetização,
app nativo ou nova funcionalidade.

---

## Ordem que não deve mudar

1. Execução do treino antes de qualquer coisa social.
2. Histórico antes de gráfico.
3. Um treino funcionando antes de macrotreino com rotação.
4. Catálogo base antes de exercícios próprios.
5. Piloto antes de cobrança.

## O que fazer quando atrasar

Corte escopo, não qualidade. Na ordem de corte: feed social → reavaliação → agenda → gráficos
(deixando só a planilha) → verificação em duas etapas. **Nunca corte** a execução do treino, o
histórico ou o convite de aluno.
