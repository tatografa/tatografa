---
name: analise-sabatina
description: Analisa o desempenho de candidatos em sabatinas, entrevistas e debates (eleição presidencial 2026) sob a lógica de campanha — sobreviver, fazer propaganda, atacar o adversário e, por último, responder ao entrevistador. Gera nota ponderada, análise pergunta-a-resposta, omissões, passivos criados e comparativo entre candidatos. Use quando o usuário enviar link de vídeo, transcrição, matéria ou documento de sabatina/entrevista/debate e pedir avaliação de desempenho.
---

# Análise de Sabatina — Modelo de Desempenho Eleitoral

Avalia a performance de um candidato **pelo critério de campanha, não pelo critério jornalístico**.
A pergunta que este modelo responde não é "o candidato respondeu bem?", e sim
**"o candidato saiu melhor ou pior do que entrou?"**

## Premissa do modelo

Uma sabatina tem quatro objetivos para o candidato, **nesta ordem de importância**:

1. **Sobreviver** — sair sem erro grave, sem casca de banana que comprometa a campanha.
2. **Fazer propaganda** — apresentar propostas, defender seu governo, esclarecer ataques, combater desinformação.
3. **Atacar o adversário** — explorar contradições, comparar, mostrar por que o outro seria pior.
4. **Responder ao entrevistador** — importa, mas é o último da fila. Responder perfeitamente a um jornalista
   preparado, que estudou seus pontos fracos, é obra de arte — coisa para gênios em seus melhores dias.

> **Regra-mestra:** o segredo é gastar **menos tempo nas armadilhas** e **mais tempo apresentando propostas
> e atacando o adversário**. Tempo gasto no terreno escolhido pelo entrevistador é tempo perdido —
> ainda que a resposta seja boa.

Consequência prática: uma resposta tecnicamente fraca que consome 20 segundos e devolve o candidato à
própria agenda vale **mais** que uma resposta brilhante de 4 minutos dentro da armadilha.

## Ponderação

| Pilar | Peso |
|---|---|
| 1. Sobrevivência | **40%** |
| 2. Propaganda | **25%** |
| 3. Ataque ao adversário | **20%** |
| 4. Resposta ao entrevistador | **10%** |
| 5. Economia de tempo (controle de pauta) | **5%** |

**Regra do teto (assimetria da sobrevivência).** Sobrevivência não é uma nota que se compensa — é uma
precondição. Portanto:

- Pilar 1 com nota ≤ 4 → **nota final limitada a 4,5**, qualquer que seja o desempenho nos outros pilares.
- Pilar 1 com nota ≤ 2 → **nota final limitada a 3,0**.

Sempre declare no relatório quando o teto foi aplicado, com a nota ponderada "bruta" ao lado, para o leitor
ver o tamanho do estrago.

A rubrica detalhada (subitens e descritores de faixa de 0 a 10) está em `references/rubrica.md`.

## Como operar

### Passo 1 — Coletar o material (sempre antes de analisar)

**Nunca analise de memória.** Este modelo só opera sobre material que o usuário forneceu e que foi
efetivamente lido nesta sessão. Se não há material, peça-o — não produza um relatório "provável".

Pergunte ao usuário, de forma curta:

1. **Link ou arquivo** da sabatina/entrevista/debate — transcrição, matéria, vídeo, documento oficial.
2. **Qual candidato** analisar (ou quais, se for comparativo).
3. **Contexto**, se houver: data, veículo, entrevistador, formato, momento da campanha.
4. **Público-alvo pretendido** naquela aparição, se o usuário tiver uma hipótese — isso muda o veredito
   (hostilizar a imprensa pode ser erro grave para o eleitor de centro e acerto deliberado para a base).

Formatos aceitos e limitações estão em `references/coleta-de-material.md`. Ponto crítico: **vídeo e áudio
não são analisáveis diretamente** — é preciso transcrição (ou uma matéria que cite as falas). Diga isso
na hora de pedir, em vez de descobrir depois.

### Passo 2 — Marcar o material

Antes de pontuar, percorra o material e etiquete cada troca:

- **Tipo da pergunta:** armadilha / convite à propaganda / factual-técnica / confronto direto /
  ataque do adversário repassado / pergunta pessoal.
- **Tempo de fala** da resposta (ou proporção estimada, se não houver cronometragem).
- **Terreno:** a resposta ficou no terreno do entrevistador ou migrou para a agenda do candidato?
- **Resposta efetiva?** sim / parcial / não.
- **Gerou clipe?** positivo (serve à própria campanha) / negativo (serve ao adversário) / neutro.

### Passo 3 — Pontuar por pilar

Aplique `references/rubrica.md`, pilar por pilar, **citando a evidência** (timestamp, trecho ou parágrafo)
que justifica cada nota. Nota sem evidência citada não entra no relatório.

### Passo 4 — Calcular os índices objetivos

- **ICP — Índice de Controle de Pauta:** % do tempo de fala em agenda própria (proposta + ataque + defesa
  do próprio histórico), contra tempo em terreno do adversário/entrevistador.
  Referência: ≥ 60% excelente · 40–60% aceitável · < 40% passou a sabatina no campo do outro.
- **Saldo de Clipes:** nº de clipes positivos gerados − nº de clipes negativos entregues.
- **TRE — Taxa de Resposta Efetiva:** respostas efetivas ÷ perguntas feitas.
- **Densidade Propositiva:** propostas concretas (com número, prazo ou fonte de recursos) por 10 min de fala.
- **Custo da Armadilha:** tempo total gasto dentro de armadilhas, em minutos e em % do tempo de fala.

Quando o material não permitir cronometragem, use estimativas em proporção de texto e **rotule como
estimativa**. Não invente números precisos.

### Passo 5 — Escrever o relatório

Use integralmente o template de `references/template-relatorio.md`. Ele inclui, além das notas:
pontos positivos e negativos com timestamp, **o que o candidato deixou de falar**, **o que não deveria ter
falado**, mapa de armadilhas, saldo de clipes, checagem factual pendente, ajustes recomendados e riscos
para as 72h seguintes.

## Regras de integridade

Este modelo trata de pessoas reais em disputa eleitoral real. Portanto:

- **Cite só o que está no material.** Nenhuma citação reconstruída de memória, nenhuma fala "provável".
- **Separe o que é fala do que é interpretação.** Transcrição entre aspas; leitura analítica em texto corrido.
- **Não decida checagem factual sem fonte.** Afirmações do candidato que exigem verificação vão para a
  seção "Checagem pendente", marcadas como pendentes — não como falsas nem como verdadeiras.
- **Avalie performance, não mérito programático.** O modelo mede eficácia comunicacional. Se o usuário quiser
  juízo sobre o mérito da proposta, isso é uma seção separada e explicitamente rotulada.
- **Simetria de rigor.** O mesmo critério, a mesma rubrica e a mesma dureza para todos os candidatos.
  Se um candidato tirar nota baixa num pilar, mostre exatamente qual descritor da rubrica se aplicou.
- **Declare as lacunas.** Se o material é parcial (só um trecho, só uma matéria de terceiros), diga qual
  pilar ficou subavaliado e quanto de confiança a nota tem.

## Modos de uso

- **Individual:** um candidato, uma aparição. Relatório completo.
- **Comparativo:** dois ou mais candidatos na mesma sabatina ou em sabatinas equivalentes. Relatório
  completo de cada um + tabela comparativa + veredito de quem saiu na frente e por quê.
- **Série:** mesmo candidato ao longo do tempo. Acompanha a evolução das notas por pilar, mostra se os
  erros se repetem e se os ajustes recomendados na análise anterior foram incorporados.
