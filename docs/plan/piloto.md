# Piloto — primeiro aluno de verdade

> Decisão do Otávio em 13/09: começar o piloto. O M4 inteiro existe para isso.
>
> **O e-mail entrou em funcionamento em 13/09 às 21:34**, depois de o SMTP da
> Hostinger ser ligado no Supabase. Nada do produto fica de fora do piloto.

## O que funciona e o que não funciona

| | |
|---|---|
| ✅ Convite | link copiado no WhatsApp — nunca dependeu de e-mail |
| ✅ Onboarding | o aluno cria a própria senha |
| ✅ Entrar | por senha |
| ✅ Treinar, registrar série, histórico, progresso | tudo |
| ✅ Instalar na tela inicial (PWA) e treinar sem sinal | tudo |
| ✅ **"Esqueci minha senha"** | funciona — SMTP da Hostinger, remetente `contato@repsclub.com.br` |

**Nada fica de fora.** O limite que sobra é de volume: a caixa entrega **100
e-mails por dia**, o que para um piloto é folga enorme.

A tela de entrada do aluno mudou hoje e continua assim: **"Entrar com senha" é
o botão principal**, e o link por e-mail é a saída secundária, com o rótulo
"Esqueceu a senha?". O aluno cria senha no onboarding, então é o caminho que
ele conhece — e o botão grande não deve convidar para o caminho mais frágil.

## Antes de convidar

1. **Limpe o ruído.** Você criou alunos e convites de teste. Não atrapalham,
   mas o painel fica mais legível para você ler o piloto.
2. **Monte o programa antes do convite.** O aluno que abre o app e vê "nenhum
   treino por aqui ainda" perde o impulso. Crie o macrotreino e pelo menos o
   treino A antes de mandar o link.
3. **Escolha alguém que vá dizer a verdade.** Aluno educado diz que está tudo
   ótimo. O piloto só vale com quem reclama.

## O convite

Painel → **Convidar aluno** → nome e e-mail → **Gerar link** → copiar.

Mande no WhatsApp. Uma sugestão de texto — curto de propósito, sem manual:

> Montei seu treino num app que estou testando. Abre esse link, cria sua senha
> e já aparece o treino de hoje. Na academia, você marca cada série conforme
> for fazendo — carga e repetições. Qualquer coisa estranha, me manda print.
> É teste, então pode falar mal à vontade.

Peça para ele **instalar na tela inicial** — no iPhone, botão de compartilhar →
"Adicionar à Tela de Início". Sem isso ele não tem o alarme de descanso com a
tela apagada.

## O que observar — duas semanas

O piloto não é "funciona?". É **"ele volta?"**. O que interessa:

| Pergunta | Onde você vê |
|---|---|
| Ele completou o cadastro sozinho? | o aluno aparece no painel |
| Ele treinou sem te perguntar nada? | sessão no histórico dele |
| Ele voltou na segunda semana? | painel: "precisam de atenção" avisa quem parou |
| Ele registrou **todas** as séries ou só algumas? | ficha do aluno: "12 de 16 séries" |
| Ele mexeu sozinho em progresso e histórico? | pergunte |

**Anote o que ele te perguntar.** Toda pergunta é uma tela que não se explicou
sozinha — e foi assim que os quatro defeitos do teste anterior apareceram, todos
em bordas que revisão de código não pega.

## Se algo quebrar

- **Erro na tela:** peça print. A tela de erro mostra um código curto no rodapé
  — esse código acha a ocorrência exata no log.
- **"Não conseguimos enviar o e-mail":** é o SMTP, já conhecido.
- **Qualquer outra coisa:** me manda o print e a hora. Eu leio os logs do
  Supabase e da Vercel e digo o que foi.

## O que fica pendente, e não trava o piloto

| Pendência | Efeito no piloto |
|---|---|
| Revisão jurídica do rascunho de termos | nenhum — os textos estão no ar |
| Personal não aceita termos ao criar conta | nenhum — decisão de produto |
| Teste com leitor de tela | nenhum — dispensado pelo Otávio |
| M3 (feed, fotos, reavaliação) | adiado de propósito até o piloto dizer o que falta |
