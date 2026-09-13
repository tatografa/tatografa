# 08 · Piloto e go-to-market

## Parte 1 · Plano de teste com os personais do piloto

### Quem
2 a 5 personais, cada um com 8 a 15 alunos. Total alvo: ~50 alunos.

Critérios para escolher os personais:
- Já treinam alunos hoje e **já usam planilha** (Excel, WhatsApp, papel). Quem não organiza nada
  não vai adotar um sistema.
- Alunos que treinam ao menos 3× por semana — você precisa de volume de sessões para achar bugs.
- Disposição para conversar 20 minutos por semana com você.
- Pelo menos um personal que você **não** conhece bem. Amigo elogia; estranho reclama.

### Como convidar
Conversa direta, não formulário. O pitch em uma frase: *"você monta os treinos no computador, seu
aluno registra a carga no celular durante o treino, e vocês dois veem a evolução."*

Deixe claro que é piloto: gratuito, em construção, com acesso direto a você quando algo quebrar.
Isso compra paciência.

### Cronograma do piloto

| Semana | O que acontece |
|---|---|
| 0 | Você configura a conta de cada personal pessoalmente, junto com ele, por chamada de 30min. Traz os alunos dele para dentro. |
| 1 | Cada personal monta os treinos dos alunos. Você observa **sem ajudar** e anota onde ele travou. |
| 2 | Primeiros treinos executados pelos alunos. Aqui aparecem os problemas de celular na academia. |
| 3 | Conversa individual com cada personal. O que usou, o que ignorou, o que irritou. |
| 4 | Você conserta os três problemas mais citados. |
| 5-6 | Uso normal, sem interferência. Só observação. |
| 7 | Decisão: continua, pivota ou para. |

### O que medir

Poucos números, todos sobre comportamento real:

| Indicador | Meta no piloto | Por que importa |
|---|---|---|
| Alunos que completaram o onboarding | > 80% dos convidados | Se o convite falha, nada mais acontece |
| Alunos com ao menos 4 sessões registradas | > 60% | Uso, não curiosidade |
| Sessões registradas por aluno por semana | ≥ 2 | O aluno está usando na academia |
| Séries com carga preenchida | > 90% das séries | O registro está fácil o suficiente |
| Treinos criados por personal na semana 1 | ≥ 3 | O editor não está travando o personal |
| Personais ainda ativos na semana 6 | 100% dos que entraram | O sinal mais importante de todos |

**O indicador que decide o produto:** aluno registrando carga na academia, sozinho, sem lembrete.
Se isso não acontece, nenhum outro número salva o produto.

### O que perguntar (e o que não perguntar)

Pergunte sobre comportamento, não sobre opinião:
- "Me mostra como você montou o treino do João." (observe, não interrompa)
- "Na última vez que você abriu o app na academia, o que você fez?"
- "O que você fez fora do app esta semana que gostaria de ter feito dentro?"
- "Se eu desligasse isso amanhã, o que você faria?"

Não pergunte "você gostou?" nem "você pagaria?". As duas respostas mentem.

### Sinais de alerta

- O personal continua mandando treino por WhatsApp em paralelo → o editor não é bom o bastante.
- O aluno registra o treino em casa, depois, de memória → a execução no celular está ruim.
- Ninguém abre a aba de progresso → o histórico não está gerando valor percebido.
- O personal pede exportar para Excel → ele não confia no sistema ainda.

---

## Parte 2 · Go-to-market

### Posicionamento

O concorrente real não é outro aplicativo. É **a planilha de Excel no WhatsApp** — grátis,
familiar e boa o suficiente. Todo argumento de venda precisa vencer isso.

O que a planilha não faz e o Reps Club faz:
1. O aluno registra a carga **no momento da série**, não de memória depois.
2. O personal vê o que o aluno realmente fez, sem perguntar.
3. A evolução por exercício aparece sozinha, em gráfico, sem ninguém montar nada.

Frase de posicionamento sugerida:
*"Reps Club é para o personal que já organiza treinos em planilha e quer parar de perguntar ao
aluno o que ele levantou."*

### Para quem vender primeiro

O cliente é o **personal**, não o aluno. Ele traz 10 a 15 alunos de uma vez, e é ele quem
eventualmente paga.

Perfil inicial: personal autônomo, 10 a 40 alunos, atende em academia de terceiros, já usa
planilha, é ativo no Instagram. Evite no início: academias grandes (venda longa, exige
integração) e personais com menos de 5 alunos (não sentem a dor).

### Canais, em ordem de esforço

1. **Indicação dos personais do piloto.** Personal conversa com personal. Um personal satisfeito
   traz dois. É o canal mais barato e o único que você precisa no primeiro momento.
2. **Presença física.** Vá às academias onde os personais do piloto atendem. Os colegas deles vão
   perguntar o que é aquilo no celular do aluno.
3. **Instagram do personal.** O aluno postando evolução é marketing gratuito, mas só se o post
   tiver a marca. Considere marca discreta na imagem exportada — **isso muda o que o usuário vê,
   decida com o Otávio antes de implementar.**
4. **Conteúdo próprio.** Só depois de ter 10 personais. Antes disso é distração.

### Landing page

Já existe protótipo (`prototipos/Landing Page.dc.html`). Objetivo único: **agendar uma conversa
com o personal**, não capturar e-mail em massa. No estágio de piloto, cada personal entra por
conversa, com configuração assistida.

Estrutura: proposta de valor acima da dobra → como funciona em 3 passos (monta, executa,
acompanha) → prova (depoimento dos personais do piloto, quando houver) → chamada para conversa.

### Monetização (depois do piloto, não agora)

Modelo mais provável: assinatura mensal do personal, com faixas por número de alunos ativos.
O aluno nunca paga. Ancore o preço no que o personal cobra por sessão — se ele cobra R$ 80 por
hora, uma assinatura mensal precisa custar menos que uma sessão para ser óbvia.

Não implemente cobrança antes de ter personais que peçam para continuar usando depois do piloto.
Essa é a única validação de disposição a pagar que vale algo.

### Marcos de decisão

| Marco | O que significa |
|---|---|
| 3 personais ativos na semana 6 do piloto | O produto funciona. Amplie o piloto. |
| 10 personais pagantes | Hora de investir em aquisição e pensar em app nativo. |
| Nenhum aluno registrando carga na academia | Pare e reveja o produto. Não é problema de marketing. |
