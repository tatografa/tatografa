# Roteiro de validação do M2 — na sua máquina

> Para o Otávio. Cada passo diz **o que fazer** e **o que tem que aparecer**. Se o que
> aparecer for diferente, anote o passo e siga: um passo quebrado não invalida os outros.
>
> Nada aqui foi exercitado com sessão real. Este ambiente remoto não alcança o Supabase
> (403 na rede), então o que existe é prova por SQL, teste de função pura e screenshot com
> dado fixo. **Este roteiro é a primeira vez que o M2 roda de verdade.**

## Antes de começar

```bash
git pull origin claude/reps-club-fase-0-aebdup
npm install
```

### As três migrations novas

O M2 acrescentou quatro, e elas **já estão aplicadas no projeto de dev**
(`reps-club-dev`). Se você usa esse projeto, não precisa fazer nada. Se usa outro,
aplique nesta ordem:

| Migration | O que faz |
|---|---|
| `0013_dias_de_treino.sql` | Função de leitura que devolve os dias em que o aluno treinou. Alimenta a sequência ("🔥 5 dias seguidos"). |
| `0014_dias_para_alerta.sql` | Coluna `trainers.dias_para_alerta`, padrão 7. É o limiar do alerta de inatividade. |
| `0015_sessoes_na_semana.sql` | Função de leitura que conta sessões por aluno na semana, para os indicadores do painel. |
| `0016_ultima_sessao_por_aluno.sql` | Função de leitura com a última sessão de cada aluno. Substitui uma varredura que truncava e fazia aluno ativo aparecer como "nunca treinou" no alerta. |

Nenhuma delas cria policy nem apaga dado. As duas funções são `security invoker`: leem
com as permissões de quem chama.

Depois de aplicar, `npm run dev` e abra `http://localhost:3000`.

### Duas contas

O roteiro precisa de **um personal e um aluno**, em navegadores diferentes (ou um deles
numa janela anônima) — a sessão é por navegador, e trocar de conta na mesma janela
derruba a outra.

---

## Parte 1 · O personal monta (30 min)

### 1.1 Exercícios próprios
Painel → **Exercícios**.

- [ ] A lista abre com o catálogo (117 itens) mais os seus.
- [ ] Filtrar por grupo muscular corta a lista.
- [ ] Buscar "triceps" **sem acento** encontra "Tríceps".
- [ ] **Novo exercício** → cadastre um que a sua academia tem e o catálogo não. Ele
      aparece com o selo "Seu".
- [ ] Tente excluir esse exercício: como não está em treino nenhum, o aviso diz que nada
      mais muda.

### 1.2 Macrotreino com A/B/C
Painel → **Macrotreinos** → novo programa para o aluno.

- [ ] Crie o programa com 8 semanas.
- [ ] Monte **três treinos** (A, B, C) dentro dele. Use o exercício que você acabou de
      criar em pelo menos um.
- [ ] O programa nasce arquivado e você o ativa — confira que ele aparece como **ativo**.
- [ ] Tente ativar um segundo programa para o mesmo aluno: o primeiro tem que ser
      arquivado na mesma ação, nunca os dois ativos.

### 1.3 A ficha do aluno (novo no M2-06)
Painel → clique no cartão do aluno.

- [ ] **O cartão é link agora.** No M1 ele não levava a lugar nenhum.
- [ ] A ficha mostra objetivo, nível, contato e status.
- [ ] O programa ativo aparece com "Semana 1 de 8".
- [ ] Como o aluno ainda não treinou: o histórico diz que ele ainda não treinou, e a
      evolução diz que não há o que comparar. **Nenhum dos dois pode parecer erro.**

---

## Parte 2 · O aluno treina (duas sessões, em dias diferentes)

> O ideal é fazer estas duas sessões **em dias de calendário diferentes** — é o que faz a
> sequência e a rotação valerem alguma coisa. Se não der, faça as duas no mesmo dia e
> anote isso; a sequência vai mostrar 1, não 2, e isso está correto.

### 2.1 Primeira sessão
No celular, logado como aluno.

- [ ] A home mostra **🔥 0 dias seguidos** e **0 sessões totais**, com a frase "Seu
      primeiro treino abre a contagem". Zero não pode parecer punição.
- [ ] O card do próximo treino sugere o **Treino A**.
- [ ] O link "Ver o treino inteiro" aparece **mesmo com um treino só** (dívida do M1).
- [ ] Inicie o treino. Em cada exercício, a pílula "Última vez" **não aparece** — é a
      primeira vez.
- [ ] O stepper de carga abre em **0 kg** no primeiro exercício, porque não há o que
      sugerir.
- [ ] Registre as séries com cargas **diferentes entre si** (ex.: 50, 60, 60). Isso importa
      para o passo 2.2.
- [ ] Conclua. A tela de fim mostra duração, séries e volume — e **nenhum recorde**, porque
      não havia marca anterior. Recorde na estreia seria celebração vazia.

### 2.2 Segunda sessão, no dia seguinte
Ainda como aluno.

- [ ] A home agora mostra **🔥 1 dia seguido** (ou 2, se você treinou ontem e hoje) e
      **1 sessão total**.
- [ ] O treino sugerido mudou para **B** — a rotação andou.
- [ ] Volte no **Treino A** de propósito (pela lista de treinos). Agora:
  - [ ] cada exercício mostra a pílula **"Última vez: 60 kg × 10"** com a série mais
        pesada do dia anterior;
  - [ ] o stepper da **série 1** abre no peso que você usou na série 1 (50 kg);
  - [ ] o stepper da **série 2** abre no peso da série 2 (60 kg), **não** no da série 1.
        Este é o comportamento que você pediu.
- [ ] **Bata um recorde de propósito:** ponha mais peso do que na sessão anterior em um
      exercício.
- [ ] Conclua. A tela de fim mostra o bloco **"Recorde pessoal"** com `peso anterior →
      peso novo`.

### 2.3 Uma sessão pela metade (o caso chato)
Só se sobrar fôlego — é o teste que mais pega defeito.

- [ ] Comece o **Treino C** e registre uma ou duas séries.
- [ ] Coloque o celular em modo avião e registre mais uma série. O contador de "séries a
      enviar" tem que aparecer no topo.
- [ ] Volte a ter internet: o contador zera sozinho.
- [ ] Sem concluir, saia e tente **iniciar o Treino A**. O app tem que oferecer encerrar a
      sessão de C — e **salvá-la**, não apagá-la.
- [ ] Confira no histórico que a sessão de C está lá, incompleta.

---

## Parte 3 · O aluno confere o próprio progresso

Aba **Progresso** (nova no M2-04 — ela estava desabilitada no M1).

- [ ] **Planilha:** cada exercício fechado mostra nome e último registro. Aberto, mostra as
      3 sessões mais recentes, série por série.
- [ ] Exercício de peso corporal aparece em **reps**, sem carga.
- [ ] **Gráfico:** a lista mostra uma prévia por exercício; abra um com duas ou mais
      sessões.
- [ ] A linha vai da **esquerda (mais antigo) para a direita (mais recente)**. Se isso lhe
      parecer invertido, me diga — foi uma leitura minha do doc 05, está anotada em
      `milestones.md`.
- [ ] Toque num ponto: aparecem as séries daquele dia.
- [ ] O filtro 6 / 12 / Total muda a quantidade de pontos.
- [ ] Exercício de peso corporal **não** desenha gráfico de carga, e diz por quê.

---

## Parte 4 · O personal acompanha

De volta ao painel, no computador.

### 4.1 Dashboard (novo no M2-07)
- [ ] O topo mostra **alunos ativos**, **treinos executados esta semana** e **aderência
      média**.
- [ ] O número de treinos da semana bate com o que o aluno fez de verdade.
- [ ] Como o aluno treinou ontem, ele **não** aparece em "precisam de atenção" — e o bloco
      inteiro não aparece, em vez de mostrar lista vazia.

### 4.2 O alerta acendendo
- [ ] Painel → **Configurações** → Editar → mude o limiar para **1 dia** → Salvar.
- [ ] Volte ao painel: se o aluno não treinou hoje, ele agora aparece em "precisam de
      atenção", dizendo há quantos dias.
- [ ] A linha leva à ficha dele.
- [ ] Volte o limiar para 7.

### 4.3 A ficha, agora com histórico
Painel → cartão do aluno.

- [ ] O histórico lista as sessões com data, treino, duração, séries e volume.
- [ ] Clique numa sessão: aparece série a série, com as puladas marcadas como puladas.
- [ ] A **evolução por exercício** mostra o mesmo gráfico que o aluno vê.
- [ ] **Confira que os números batem** entre a ficha e o app do aluno: mesma duração,
      mesmo volume, mesma curva. Divergência aqui é bug, e é o tipo que ninguém percebe
      sozinho.

---

## O que anotar

Para cada item que não bater, me mande: **em que passo**, **o que apareceu** e **o que
você esperava**. Screenshot ajuda mais que descrição.

E três perguntas de produto que ficaram em aberto, que só a academia responde:

1. **A pílula e o stepper divergem numa rampa.** A pílula mostra a série mais pesada do dia
   ("Última vez: 65 kg × 6") e o stepper abre na mesma série (50 kg). Incomoda?
2. **O eixo do gráfico** vai do mais antigo para o mais recente. É o que você esperava?
3. **Sete dias** é o padrão certo para o alerta, ou você já sabe que vai mudar?
