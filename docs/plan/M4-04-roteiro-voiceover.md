# Roteiro · testar o Reps Club com VoiceOver (iPhone)

> Este é o critério do M4-04 que **não** dá para fazer no ambiente remoto: não
> há iPhone aqui, e emular leitor de tela não é testá-lo. Leva ~15 minutos.
>
> Não é preciso entender nada de acessibilidade. Você vai navegar de olhos na
> tela mesmo — o que estamos testando é se a **fala** descreve o que está lá.

## Antes de começar

Ligar o VoiceOver: **Ajustes → Acessibilidade → VoiceOver → ligar**.

Antes disso, vá em **Acessibilidade → Atalho de Acessibilidade** e marque
VoiceOver. Aí o **botão lateral apertado 3 vezes** liga e desliga. Sem esse
atalho, desligar com o VoiceOver ligado é frustrante — e é a primeira coisa que
todo mundo quer fazer.

Os gestos mudam quando ele está ligado:

| Quero | Gesto |
|---|---|
| Ouvir um item | tocar nele uma vez |
| Ativar (o "clique") | tocar **duas** vezes |
| Próximo item | deslizar um dedo para a direita |
| Item anterior | deslizar um dedo para a esquerda |
| Rolar a tela | deslizar com **três** dedos |

## O que anotar

Em cada passo, uma coluna só: **a fala descreve o que está na tela?**

- ✅ descreve
- ❌ fala errado, fala de menos, ou não fala nada → **escreva o que ele falou**

O que ele falou importa mais que o passo ter falhado. "Botão" sozinho, sem dizer
qual, é um ❌ — e é o tipo de defeito que só aparece assim.

## Roteiro

Abrir `tatografa.vercel.app` no Safari e entrar como **aluno**.

### Home

1. Deslize da esquerda para a direita, item por item, do topo até o fim. A fala
   passa por: seu nome, o macrotreino, a sequência de dias, o próximo treino.
2. Se houver treino em andamento, ele é anunciado? (é a porta de volta — se o
   VoiceOver pular, o aluno cego perde a sessão aberta)
3. A barra de baixo: cada aba diz o nome **e** que está selecionada.

### Treino

4. Toque duas vezes no próximo treino. A tela nova é anunciada?
5. Percorra a lista de exercícios. Cada um diz nome, séries e repetições?

### Execução (a tela mais importante)

6. Comece o treino.
7. Percorra a primeira série. Os quatro botões de ajuste dizem **o que ajustam**
   — "diminuir carga", "aumentar repetições" — ou dizem só "botão"?
8. Ative "confirmar série". **Algo é falado** logo depois, sem você procurar? É
   o que diz ao aluno cego que a série entrou.
9. Toque numa série já registrada. A fala inclui a carga e as repetições, ou só
   "botão"?
10. Deixe o descanso começar. O timer **interrompe** a fala a cada segundo? (se
    interromper, é defeito — foi desenhado para não fazer isso)
11. Encerre o treino. A tela de fim é anunciada?

### Histórico e progresso

12. Abra o histórico. Cada linha diz a data e o treino?
13. Abra o progresso, aba **Gráfico**, e abra um exercício. Toque no gráfico: ele
    deve falar uma frase com a evolução em palavras, algo como *"de 55 kg a
    62,5 kg em 3 treinos, alta de 7,5 kg"*. Se falar só "imagem", é ❌.

### Entrar e sair

14. Saia da conta. O botão de sair é alcançável deslizando?
15. Entre de novo. Digite o e-mail **errado** de propósito. A mensagem de erro é
    **falada**, ou só aparece na tela em silêncio?

> O passo 15 é o que mais costuma falhar em qualquer app, e foi o que mais
> mexemos neste card. Se ele passar, o resto tende a passar.

## Depois

Me mande a lista dos ❌ com o que o VoiceOver falou. Cada um vira correção.
