# Roteiro · validar o M3 (feed, reavaliação, agenda)

> **Este arquivo é gerado** por `docs/plan/gerar-roteiro.py`, a partir de
> `M3-roteiro.html` — a página que o Otávio abre para marcar. Editar os passos
> aqui não muda a página; edite o HTML e rode o script.
>
> Tudo o que entrou desde a última validação. Leva cerca de 1h10.
>
> **Por que precisa ser o Otávio:** o host do Supabase é bloqueado pela política
> de rede do ambiente remoto. Cada tela foi conferida no navegador com dados
> fixos e cada regra de banco foi provada por SQL, mas **nenhum fluxo com sessão
> de verdade passou por lá**. Publicar uma foto ou responder uma reavaliação,
> de ponta a ponta, só acontece aqui.

## O que anotar

Em cada passo: **aconteceu o que está escrito?**

- ✅ sim
- ❌ não → **escreva a frase que apareceu na tela**, mesmo que pareça bobo

Os quatro defeitos do M1 e do M2 estavam todos em borda de sessão, e nenhum
deles apareceria num "não funcionou" sem o texto.

---

## Parte 1 · O portão de aceite (2 min)

Você vai bater nele porque os documentos mudaram de versão duas vezes: primeiro pelo feed, depois pela reavaliação. A versão vigente é 2026-09-15.

1. Abra o app do aluno no celular. Antes de qualquer tela aparece
   **“Atualizamos a política de privacidade”**. O parágrafo fala da
   **reavaliação** — medidas e três fotos, que só você e o personal veem.
2. Toque em **“Ler a política de privacidade”**. Ela abre. Procure **“As
   fotos e as medidas da reavaliação”** e **“A foto do feed”** — as duas
   seções novas.
3. No rodapé da política, a versão é **15 de setembro de 2026**.
4. Volte e toque em **“Ler os termos de uso”**. Procure **“O que você
   publica no feed”**.
5. Nenhum texto dos dois documentos mostra **asterisco** solto na tela
   (`*assim*`).
6. Volte e toque em **“Li e aceito”**. O app abre normalmente.
7. Feche e abra o app de novo. **O portão não aparece mais.**

## Parte 2 · Você como aluno de si mesmo (11 min)

O perfil você já criou. Falta o que estava bloqueado: montar o seu próprio treino pelo caminho normal.

8. No painel, **Macrotreinos → Novo programa**. No seletor “Aluno”, **o
   seu nome está na lista**. (Era isso que não aparecia.)
9. Escolha você mesmo, dê um nome ao programa, deixe as semanas e salve.
10. Ative o programa.
11. Crie um treino dentro dele, com 2 ou 3 exercícios — os mesmos passos
    de sempre.
12. No painel principal, na lista de alunos, **a sua linha tem a etiqueta
    “VOCÊ”** ao lado do status.
13. No celular, abra o app do aluno. No topo aparece a faixa **“Você está
    treinando como aluno”**, com o link de voltar ao painel.
14. A home mostra **o treino que você acabou de montar**.
15. Execute o treino: confirme algumas séries e conclua. A tela de
    conclusão agora oferece **“Tirar foto do treino”** e **“Concluir sem
    foto”** — toque em concluir sem foto por ora.
16. Toque em **“Voltar ao painel”** na faixa do topo. Você cai no painel.
17. No painel, abra a sua própria ficha de aluno. **A sessão que você
    acabou de fazer está lá**, com carga e repetições.
18. No app do aluno, toque na aba **Perfil**. Seus dados aparecem: nome,
    e-mail, nascimento, objetivo, n\u00edvel, peso e altura.
19. Toque em **\u201cEditar meus dados\u201d**. Os campos abrem **j\u00e1
    preenchidos** com o que estava na leitura — nenhum em branco.
20. O e-mail **n\u00e3o** \u00e9 um dos campos: no lugar dele h\u00e1 uma
    frase explicando que ele \u00e9 o endere\u00e7o de entrada e n\u00e3o
    muda por ali.
21. Mude o **peso** e toque em Salvar. A tela volta para a leitura, com o
    valor novo.
22. Toque em Editar de novo e depois em **Cancelar**: volta para a leitura
    e **nada mudou**.
23. No painel, abra a sua ficha de aluno: **o peso novo est\u00e1
    l\u00e1**.

## Parte 3 · O feed (14 min)

Ainda como aluno, no celular.

24. Toque na aba **Feed** na barra de baixo. Ela está clicável.
25. As duas abas de cima — **“Da turma”** e **“Com meu personal”** —
    trocam na hora, e a lista pisca um esqueleto cinza enquanto carrega.
26. Estando vazias, cada aba mostra um texto diferente. Leia os dois:
    fazem sentido?
27. Toque em **“Publicar”**, no canto superior direito.
28. Toque no quadro da foto. **Abre a câmera** (ou a galeria, se você
    escolher). Tire uma foto do que estiver na sua frente.
29. A foto aparece como prévia, quadrada. Em cima dela há um **×** para
    tirar. Teste o × e escolha outra.
30. Escreva uma legenda.
31. Em **“Quem pode ver”**, deixe a opção de cima — que já vem marcada — e
    publique.
32. Você volta ao feed, na aba **“Com meu personal”**, e o post está lá,
    com **um cadeado e “Só o seu personal vê”**.
33. Publique um segundo post com a **segunda opção de alcance** (a turma).
    Ele aparece na aba **“Da turma”**, e **sem** o cadeado.
34. Publique um terceiro **sem foto**, só com legenda. Funciona.
35. Tente publicar **sem foto e sem legenda**: o botão “Publicar” fica
    apagado e não dá para tocar.
36. Abra um dos posts. Toque no coração — **o número muda na hora**. Toque
    de novo e volta.
37. Escreva um comentário e envie. Ele aparece na lista, com a hora.
38. Volte ao feed: o contador de comentários do card subiu.
39. Abra o post de novo e toque em **“Apagar”**. Aparece um aviso dizendo
    que os comentários vão junto. Confirme — e o post some do feed.
40. Agora o caminho que importa: execute um treino e, na tela de
    conclusão, toque em **“Tirar foto do treino”**.
41. O compositor abre com o **resumo do treino no topo**: a letra do
    treino, o nome, quantas séries e o volume em kg.
42. Publique. No feed, o card mostra **esse mesmo resumo acima da
    legenda** — é o que separa este feed de qualquer outro.
43. Publique outro post pelo botão **Publicar** do feed, sem vir de um
    treino. Esse **não** tem resumo, e está certo.

## Parte 4 · Quem vê o quê (5 min) — **o teste que mais importa**

O teste que mais importa. Precisa de uma segunda conta de aluno (raul ou Vinicius). Se não tiver a senha, marque ✗ no passo 34 escrevendo “sem a senha” e pule o resto — a regra foi provada por SQL, mas ver com os olhos é outra coisa.

44. Como **você**, publique um post **para a turma**, com foto e legenda
    reconhecíveis (“post da turma”).
45. Publique outro **só para o personal** (“post privado”).
46. Saia e entre com a **conta do outro aluno**, no celular ou numa janela
    anônima.
47. Esse aluno também bate no portão de aceite. Aceite.
48. No Feed, aba **“Da turma”**: o **“post da turma” aparece**.
49. Na mesma aba: o **“post privado” NÃO aparece**. Qualquer aparição dele
    aqui é grave — marque ✗ e pare o teste.
50. Seu nome aparece escrito certo, **não** como “Aluno”.
51. Ao lado do seu nome há a etiqueta vermelha **PERSONAL**.
52. Aba **“Com meu personal”**: aparecem só os posts **desse** aluno,
    nenhum seu.
53. Abra o “post da turma” e comente nele.
54. Volte para a sua conta e abra o mesmo post: **o comentário dele está
    lá, com o nome dele**.

## Parte 5 · O painel Social (4 min)

No computador. A tela que faltava: \u00e9 aqui que o post marcado \u201cs\u00f3 o meu personal\u201d chega.

55. No painel, o menu tem **Social**. Abra.
56. Os posts que voc\u00ea publicou como aluno aparecem — **inclusive o
    que voc\u00ea marcou como privado**, com o selo **“S\u00d3 PARA
    VOC\u00ca”**. Se ele n\u00e3o estiver a\u00ed, \u00e9 o defeito que
    esta tela existe para consertar.
57. O post que foi para a turma tem o selo **“TURMA”**.
58. O cabe\u00e7alho conta os posts e quantos est\u00e3o **“sem sua
    resposta”**.
59. Os coment\u00e1rios aparecem **dentro do cart\u00e3o**, sem precisar
    abrir o post.
60. Escreva uma resposta num post e envie. Ela aparece na lista, com
    **“Voc\u00ea”** em vermelho.
61. Troque o per\u00edodo para **7 dias** e depois **Tudo**. A lista muda,
    e a URL tamb\u00e9m.
62. No celular, como aluno, abra o post que voc\u00ea respondeu: **a
    resposta do personal est\u00e1 l\u00e1**.

## Parte 6 · A reavaliação (15 min) — **o teste que mais importa**

O maior pedaço novo. Tenha uma fita métrica por perto, ou invente os números — o que importa é o caminho. Comece no computador.

63. No painel, o menu tem **Reavaliações**. Abra. Está vazio, com o texto
    explicando que o aluno preenche pelo app.
64. Clique **“Nova reavaliação”**, escolha **você mesmo** na lista e
    clique **Liberar**. O diálogo **fecha sozinho**.
65. Ela aparece em **“Esperando resposta”**, com o selo **PENDENTE** e a
    data de hoje. O cabeçalho diz **“1 esperando resposta”**.
66. Clique **“Nova reavaliação”** e escolha o mesmo aluno de novo. Aparece
    **“Esse aluno já tem uma reavaliação esperando resposta.”** — e nada é
    criado.
67. **No celular, como aluno.** A home mostra um card de fundo amarelado:
    **“Reavaliação disponível”**, com o seu nome embaixo e a pílula
    **“Fazer agora”**. Ele fica **depois** do card de treino.
68. Toque. Abre o formulário: peso, gordura, cinco medidas, três fotos e
    uma observação.
69. Cada medida traz a dica de **onde passar a fita** (“No meio do braço,
    contraído”). Na primeira vez não há “na última”, porque não existe
    anterior.
70. Toque **“Enviar reavaliação”** com tudo em branco. Aparece **“Preencha
    ao menos uma medida ou envie uma foto antes de enviar.”**
71. Escreva `abc` no peso e envie. O erro aparece **no campo do peso**, em
    português: “Peso inválido.”
72. Apague e escreva o peso **com vírgula** (por exemplo `82,4`). Ele
    aceita.
73. Preencha ao menos três medidas e tire as **três fotos** — de frente,
    de lado, de costas. Cada uma mostra a prévia; o **×** no canto remove.
74. Repare na linha com o cadeado: **“Só você e seu personal veem estas
    fotos. Elas não vão para o feed.”**
75. Envie. A tela volta com **“Reavaliação enviada”** em verde, e a
    comparação aparece em **“Suas reavaliações”** — **sem** a coluna
    “Antes”, porque é a primeira.
76. Abra o **Perfil**. O peso é o que você acabou de informar — a
    reavaliação atualizou o perfil sozinha.
77. **De volta ao computador.** Em Reavaliações, ela saiu de “Esperando” e
    está em **“Respondidas”**, com o resumo (peso · % · nº de medidas · nº
    de fotos).
78. Clique **“Ver comparação”**. As **fotos aparecem** — é a única tela
    que as mostra.
79. Libere uma **segunda** reavaliação para você e responda com números
    **diferentes**.
80. Agora a comparação tem **Antes → Agora → Variação**, com `+1,5` e
    `−2,5`. **Nenhum número está pintado de verde ou vermelho** — é de
    propósito: só você sabe se subir é bom.
81. Onde houver foto nas duas, elas aparecem **lado a lado** com a seta no
    meio.
82. No celular, na reavaliação enviada, toque **“Apagar as fotos”**. O
    aviso diz que **as medidas continuam**. Confirme.
83. As fotos somem e **os números ficam**. No computador, a comparação
    também já não mostra fotos.

## Parte 7 · As duas costuras (6 min)

Coisas que já existiam mas não tinham por onde ser alcançadas.

84. No painel, abra **Alunos** e clique num aluno. Na ficha, abaixo de
    “Evolução por exercício”, tem a seção **Reavaliações**.
85. Ela mostra **a última comparada com a anterior** — só os números,
    **sem fotos**. Se houver uma esperando resposta, aparece a faixa
    **PENDENTE** em cima.
86. O link **“Ver as N”** (canto direito) leva à tela de comparação
    completa. **“Ver as fotos”**, embaixo, leva ao mesmo lugar.
87. Abra a ficha de um aluno **sem nenhuma reavaliação**. A seção diz que
    não há nenhuma e oferece o caminho para liberar.
88. Vá em **Configurações**. A primeira seção agora é **“Seu WhatsApp”**,
    dizendo “Sem número”.
89. Clique **Informar**, digite o seu com DDD (`(11) 99999-9999`) e salve.
    Ele volta **formatado**, e o texto explica que seus alunos passam a
    ver o botão.
90. Teste a validação: entre em Editar, escreva `123` e salve. Aparece
    **“Informe um número com DDD, como (11) 99999-9999.”**
91. **No celular, como aluno**, abra o **Perfil**. Tem um card com as suas
    iniciais, o seu nome, “Seu personal trainer” e o botão **WhatsApp**.
92. Toque no botão. **Abre o WhatsApp na conversa com você**, sem mensagem
    pronta.
93. No mesmo Perfil, abaixo do card, tem o link **Reavaliação** — a porta
    de entrada por onde o aluno chega sem depender do aviso na home.
94. Volte às Configurações no computador, **apague o número** e salve. No
    celular, o card do personal **continua lá, sem o botão**.

## Parte 8 · A agenda (8 min)

Sessões presenciais: marcar, e depois registrar quem veio. Comece no computador.

95. No painel, o menu tem **Agenda**. Abra. O título é a semana por
    extenso (**“14 a 20 de setembro”**) e o dia de hoje tem a borda
    vermelha e a etiqueta **HOJE**.
96. Sem nada marcado, a semana mostra **um único cartão** explicando para
    que serve — e não sete dias vazios.
97. Clique **“Nova sessão”**. O dia já vem preenchido com hoje, a hora com
    18:00 e a duração com 60.
98. Escolha um aluno e marque. A sessão aparece no dia certo, com a hora
    em destaque.
99. Marque **outra sessão no mesmo horário**, com outro aluno. Antes de
    salvar aparece um aviso amarelo dizendo **com quem bate** — e o botão
    continua funcionando, porque atender em dupla é normal.
100. Marque uma **às 23h30**. Ela aparece no dia que você escolheu, e não
     no seguinte. (É a conta que já errou duas vezes neste projeto.)
101. Use **“Semana seguinte”** e **“Semana anterior”**. O título muda e a
     URL também. **“Esta semana”** volta para hoje.
102. Numa sessão futura, clique no **ícone de lixeira**. O aviso explica
     que ela some sem registro, e sugere “Cancelar” para manter rastro.
     Confirme.
103. Em outra, clique **Cancelar**. Ela fica na agenda, **riscada**, com o
     selo CANCELADA.
104. Clique **Desfazer** nessa mesma: ela volta a ser agendada.
105. Numa sessão, clique **Veio**. Ela ganha o selo verde REALIZADA. Em
     outra, **Faltou** — selo amarelo.
106. Tente apagar (lixeira) uma já marcada como **Faltou**: o botão nem
     aparece. Faltar é registro e não some.
107. Marque uma sessão para **ontem** (use “Semana anterior” se precisar)
     e deixe sem marcar. Volte para esta semana: ela aparece no topo, em
     **“1 sessão esperando sua marcação”**.
108. Clique no nome do aluno em qualquer sessão: abre a ficha dele.
109. **No celular, como aluno**, abra a home. Tem a linha **“Sessão com
     {seu nome} · qui, 17 de set, 18h · 1h”**, com ícone de calendário.
110. Ela mostra **a próxima**, não a de ontem. E sessão **cancelada** não
     aparece ali.
111. Não há botão nenhum nessa linha — o aluno não marca nem desmarca. É
     lembrete, e é de propósito.

---

## Quando terminar

Me diga que terminou — eu leio as marcações e as notas direto da página, não
precisa copiar nada.

Se passar tudo, o M3 fecha. O que sobra da Fase 3 é a reavaliação física, que é
cortável — aí decidimos se vale ou se o próximo pedaço é outro.
