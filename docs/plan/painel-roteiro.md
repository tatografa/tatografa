# Roteiro · o painel do personal, fechado

> **Este arquivo é gerado** por `docs/plan/gerar-roteiro.py painel-roteiro`, a
> partir de `painel-roteiro.html` — a página que o Otávio abre para marcar.
> Editar os passos aqui não muda a página; edite o HTML e rode o script.
>
> **Página para marcar:** <https://claude.ai/artifact/74zvgdnC54qTBPe9myNHa3>
>
> Tudo o que entrou **depois do reteste do M3**, em quatro levas: o dashboard
> com os dois blocos que faltavam, a tela de alunos com tabela e busca, as
> observações privadas sobre o aluno e a duplicação de treino e de macrotreino.
> Cerca de 40 minutos.

## Antes de começar

- **Onde:** `repsclub.com.br`, painel no computador e app no celular ao mesmo tempo.
- **A Parte 1 vem primeiro porque trava o resto.** A política de privacidade mudou
  de versão, então todo aluno passa por um portão de aceite ao abrir o app.
- **A Parte 4 é a que mais importa:** é a única em que um defeito vazaria dado de
  uma pessoa para outra.
- **Dois alunos na carteira** são necessários na Parte 5. Você mesmo conta como um.
- **Faça na ordem.** A Parte 6 usa o programa da Parte 5.

O sinal de que o deploy chegou: o menu do painel tem **“Painel”** e **“Alunos”**
como itens **separados**.

## O que anotar

Em cada passo: **aconteceu o que está escrito?**

- ✅ sim
- ❌ não → **escreva a frase que apareceu na tela**

## Parte 1 · O portão de re-aceite (5 min) — **o teste que mais importa**

**No celular, no app do aluno.** A política de privacidade passou a declarar as anotações que o personal faz sobre o aluno — e a regra do projeto é que mudar o que se coleta exige aceite novo. Então todo aluno topa com este portão uma vez. Ele vem primeiro no roteiro porque trava todas as outras telas do celular.

1. Abra o app do aluno no celular (logado como **você mesmo**, aluno de si
   mesmo). Aparece uma tela de **aceite**, e não a home.
2. Ela diz **o que mudou**, em uma frase: que o seu personal agora tem um
   espaço de anotações sobre o acompanhamento, que elas **não aparecem em
   nenhuma tela sua**, e que dá para pedir a ele o que está escrito.
   Portão que diz só “atualizamos os documentos” faz clicar sem ler —
   quero conferir que este não é assim.
3. **Tente sair sem aceitar**: use o botão de voltar do celular, ou digite
   `repsclub.com.br/app/treinos` na barra de endereço. **Volta para o
   portão.** Ele é bloqueante, não é uma faixa que se fecha.
4. Abra o link de **política de privacidade** a partir do portão. Ela abre
   e **dá para ler sem ter aceitado** — ler o que se está aceitando não
   pode depender de aceitar.
5. Na política, procure a seção **“Que dados coletamos”**. Tem um
   parágrafo sobre as anotações do personal. Confira que ele diz que você
   **não as vê pelo app** e que pode pedir o conteúdo.
6. Volte e **aceite**. O app abre na home normalmente.
7. **Feche o app e abra de novo.** O portão **não volta** — o aceite ficou
   gravado.
8. Se você tem **outra conta de aluno** (raul ou Vinicius), entre nela. O
   portão aparece **para ela também**, porque o aceite é por pessoa.
   Aceite e siga.

## Parte 2 · O dashboard (6 min)

**No computador, logado como personal.** O `/painel` deixou de ser uma lista de alunos e passou a responder “o que mudou hoje”. Dois blocos que o handoff pedia desde o começo e nunca existiram.

9. Abra **Painel**. No topo agora há **quatro** indicadores, não três:
   alunos ativos, treinos na semana, aderência média e **reavaliações
   pendentes**.
10. Se o número de reavaliações pendentes for **maior que zero**, ele está
    **em vermelho** e o cartão inteiro é **clicável** — leva para a tela
    de Reavaliações.
11. Se for **zero**, ele fica **preto e não clica**. De propósito: levar a
    uma lista vazia é pior que não levar. Se estiver em zero, libere uma
    reavaliação e volte para ver o cartão mudar.
12. Abaixo dos indicadores, o bloco **“Precisam de atenção”** continua
    como estava — ou não aparece nenhum, se ninguém estiver parado.
13. Mais abaixo, o bloco novo: **“Atividade recente”**. Cada linha tem o
    **nome do aluno**, o treino (letra e nome), e à direita o dia mais
    **séries · kg · duração**.
14. O dia é escrito como **“Hoje”**, **“Ontem”** ou “qua, 12 de set”. Se
    você treinou hoje, a sua linha diz **Hoje**. Se disser “Ontem” num
    treino de hoje à noite, me avise: é fuso, e o projeto já tomou esse
    tiro.
15. **Clique numa linha da atividade.** Abre a **sessão** daquele treino,
    série por série — não a ficha do aluno.
16. **A lista de alunos não está mais no dashboard.** No lugar dela, no
    fim da página, há um link **“Ver todos os N alunos →”**. Clique nele.

## Parte 3 · A tela de alunos (7 min)

A carteira ganhou endereço próprio, em tabela — densa de propósito, porque é onde você compara alunos na vertical. Enquanto ela morava no dashboard, empurrava tudo para fora da dobra a cada aluno novo.

17. No menu do topo, **“Painel”** e **“Alunos”** são itens **separados**.
    “Alunos” leva a `/painel/alunos`.
18. A tabela tem **seis colunas**: Aluno (com as iniciais num círculo),
    Objetivo, Macrotreino, Última sessão, Aderência e Status.
19. Na **sua própria linha** aparece a etiqueta vermelha **“Você”**, ao
    lado do status.
20. Aluno **sem macrotreino ativo** mostra “Sem macrotreino” em cinza
    claro, e a aderência dele é **“—”**, não “0%”. Zero por cento diria
    que ele faltou; o traço diz que não há o que medir.
21. Aluno que **nunca treinou** mostra “Nunca treinou” na coluna de última
    sessão.
22. No campo de busca, digite **parte de um nome**. A tabela reduz na
    hora, sem recarregar a página.
23. Agora digite um nome **sem acento** de alguém que tem acento no nome
    (ex.: “jose” para achar “José”). **Acha do mesmo jeito.**
24. Digite **parte de um e-mail** (ex.: “gmail”). A busca também casa
    e-mail, não só nome.
25. Com o filtro ligado, embaixo da tabela aparece **“X de Y alunos”**.
    Sem filtro, só “Y alunos”.
26. Digite uma bobagem (“zzz”). Aparece o card **“Nenhum aluno com esse
    filtro”** — e o campo de busca **continua na tela**, para você apagar
    o que digitou.
27. Limpe a busca e mude o seletor de status para **“Inativos”**. Só os
    inativos ficam. Volte para “Todos”.
28. **Clique no meio de uma linha** — não no nome, mas na coluna
    “Macrotreino” ou “Objetivo”. Abre a ficha do aluno assim mesmo: a
    linha inteira é clicável.
29. Na ficha, o link de voltar no topo diz **“← Alunos”** e leva para
    **esta tabela**, não para o dashboard.

## Parte 4 · As observações privadas (9 min) — **o teste que mais importa**

**O teste que mais importa deste roteiro.** É o único lugar onde um defeito vazaria o que você escreveu sobre uma pessoa para essa pessoa. Os passos 7 e 8 são o motivo desta parte existir — faça-os com atenção, e escreva no ✗ em que tela você estava se algo aparecer.

30. Painel → Alunos → abra a ficha de um aluno. Entre o programa e a
    evolução há a seção **“🔒 Observações · só você vê”**, com um cadeado.
31. Sem nenhuma anotação, o card diz que nada foi anotado sobre aquele
    aluno e repete, em negrito, que **o aluno não vê o que você escreve
    aqui**.
32. Clique **“Anotar”**. Abre um campo com a dica “Só você lê. O aluno não
    vê esta anotação em lugar nenhum do app.” Escreva algo reconhecível —
    **“dor no ombro direito, trocar barra por halter”** — e salve. O
    formulário **fecha sozinho** e a anotação aparece na lista, com a
    data.
33. Clique **“Editar”** nessa anotação, mude o texto e salve. Agora a
    linha de data diz **“Hoje · editada”**.
34. Escreva uma **segunda** anotação. Ela entra **no topo** da lista — a
    mais recente primeiro.
35. Tente salvar uma anotação **em branco** (só espaços). O botão
    **“Salvar anotação” fica desabilitado**; não dá para enviar.
36. **Agora o que importa.** No celular, no app do aluno, **logado como o
    aluno sobre quem você escreveu**, procure a frase “dor no ombro
    direito” em **toda** tela: home, Treinar, detalhe do treino,
    Progresso, Feed, Perfil, Reavaliação. **Ela não está em lugar
    nenhum.**
37. Ainda no celular, abra **Perfil → “Editar meus dados”**. Nenhum campo
    traz a anotação, nem escondido no fim do formulário.
38. Volte ao painel e clique **“Apagar”** numa anotação. Ela pergunta
    **“Apagar?”** com “Sim, apagar” e “Não” — não some no primeiro clique.
39. Clique **“Não”**: a anotação continua lá. Clique “Apagar” de novo e
    confirme com **“Sim, apagar”**: some.
40. Abra a ficha de **outro** aluno. As anotações do primeiro **não estão
    lá** — cada ficha mostra só as dela.

## Parte 5 · Duplicar macrotreino (8 min)

O item que o handoff justifica com cinco palavras: “o personal reaproveita muito”. Montar um programa do zero é meia hora; entregá-lo ao segundo aluno era a mesma meia hora, digitada de novo. Repare no que a cópia NÃO leva — é onde estão as decisões.

41. Painel → **Macrotreinos**. No card do programa **ativo** de um aluno,
    ao lado de “Editar” e “Arquivar”, há agora **“Duplicar”**.
42. Clique. O diálogo diz, **antes de você confirmar**, que os treinos e a
    prescrição vêm junto, que o histórico de execução **não** vem, e que
    **a cópia nasce arquivada**. Sem essa última frase você sairia daqui
    achando que o aluno já tem treino.
43. O seletor **“Para quem”** já vem com o dono atual do programa, e a
    lista tem **todos os seus alunos**. O campo de nome já vem com
    **“{nome do programa} (cópia)”**.
44. Escolha **outro aluno**, ajuste o nome se quiser, e clique
    **Duplicar**. O diálogo fecha e a cópia aparece na seção **daquele
    outro aluno**, com a etiqueta **“Arquivado”**.
45. Na linha da cópia, confira: **o mesmo número de treinos** do original,
    e a data de início é **hoje** — não a data do programa de origem. A
    semana da rotação sai dessa data: herdar a antiga faria a cópia nascer
    na semana 5 de 8.
46. Clique **“Ativar”** na cópia. Ela vira Ativo e diz **“Semana 1 de
    N”**.
47. Vá em **Treinos**. Os treinos aparecem agora sob o nome **do aluno
    novo**, com as mesmas letras, os mesmos nomes e a mesma contagem de
    séries do original.
48. Abra um desses treinos copiados. Os exercícios, as séries, as
    repetições e o descanso são **os mesmos** do treino de origem.
49. Na ficha do **aluno novo**, o **histórico de sessões continua o dele**
    — os treinos que o **outro** aluno executou **não** vieram junto. Se
    aparecerem, é grave: me diga na hora.
50. Volte a Macrotreinos. Num programa **arquivado**, o botão **“Duplicar”
    também existe**, ao lado de “Ativar”. Programa arquivado é justamente
    o modelo que você guardou para reusar.
51. Duplique **a partir do arquivado**, agora para **o mesmo aluno**.
    Funciona igual, e a cópia também nasce arquivada.

## Parte 6 · Duplicar treino e a letra sugerida (5 min)

Dentro de um programa, copiar um treino é o caminho de “o B é parecido com o A”. Junto vai um conserto pequeno no campo mais usado do editor.

52. Painel → Treinos → abra um treino. No cabeçalho, ao lado da linha
    “aluno · séries · min”, há o botão **“Duplicar treino”**.
53. Clique. O diálogo diz que a cópia entra **no mesmo programa**, com a
    **próxima letra livre** e os mesmos exercícios. Confirme.
54. A página volta ao programa. O treino novo está lá com a **primeira
    letra que faltava** — se o programa tinha A e B, a cópia é **C** — e o
    nome termina em **“(cópia)”**.
55. Abra a cópia: os exercícios, séries, repetições e descanso são
    **iguais** aos do original. Mude um exercício e salve — **o treino
    original não muda**.
56. Agora o conserto: no programa, clique **“Montar treino”**. O campo
    **“Letra”** já vem preenchido com a **próxima letra livre**, não com
    “A”. Antes ele vinha sempre “A”, então montar o B começava com a letra
    do A na tela.
57. Cancele, apague um treino do meio (por exemplo o B) e clique “Montar
    treino” de novo: a letra sugerida é **B**, o buraco que ficou — não a
    próxima do fim.

---

## Quando terminar

Me diga que terminou — eu leio as marcações e as notas direto da página, não
precisa copiar nada.

Se a **Parte 4** passar inteira, a anotação privada está trancada de verdade e o
doc 06 fecha. O que sobra do painel é a sidebar colapsável e o dashboard maior
dos protótipos — e esse depende de decidir se o Reps Club vai cuidar de cobrança.
