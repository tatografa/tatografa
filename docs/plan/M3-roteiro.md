# Roteiro · validar o M3 (feed, personal-aluno, perfil)

> **Este arquivo é gerado** por `docs/plan/gerar-roteiro.py`, a partir de
> `M3-roteiro.html` — a página que o Otávio abre para marcar. Editar os passos
> aqui não muda a página; edite o HTML e rode o script.
>
> Tudo o que entrou desde a última validação. Leva cerca de 40 minutos.
>
> **Por que precisa ser o Otávio:** o host do Supabase é bloqueado pela política
> de rede do ambiente remoto. Cada tela foi conferida no navegador com dados
> fixos e cada regra de banco foi provada por SQL, mas **nenhum fluxo com sessão
> de verdade passou por lá**. Publicar uma foto, de ponta a ponta, só acontece
> aqui.

## O que anotar

Em cada passo: **aconteceu o que está escrito?**

- ✅ sim
- ❌ não → **escreva a frase que apareceu na tela**, mesmo que pareça bobo

Os quatro defeitos do M1 e do M2 estavam todos em borda de sessão, e nenhum
deles apareceria num "não funcionou" sem o texto.

---

## Parte 1 · O portão de aceite (2 min)

Você vai bater nele porque a política de privacidade mudou de versão.

1. Abra o app do aluno no celular. Antes de qualquer tela aparece
   **“Atualizamos a política de privacidade”**, com um parágrafo
   explicando o feed.
2. Toque em **“Ler a política de privacidade”**. Ela abre. Procure a seção
   **“A foto do feed”** — é a nova.
3. Volte e toque em **“Ler os termos de uso”**. Procure **“O que você
   publica no feed”**.
4. Nenhum texto dos dois documentos mostra **asterisco** solto na tela
   (`*assim*`).
5. Volte e toque em **“Li e aceito”**. O app abre normalmente.
6. Feche e abra o app de novo. **O portão não aparece mais.**

## Parte 2 · Você como aluno de si mesmo (11 min)

O perfil você já criou. Falta o que estava bloqueado: montar o seu próprio treino pelo caminho normal.

7. No painel, **Macrotreinos → Novo programa**. No seletor “Aluno”, **o
   seu nome está na lista**. (Era isso que não aparecia.)
8. Escolha você mesmo, dê um nome ao programa, deixe as semanas e salve.
9. Ative o programa.
10. Crie um treino dentro dele, com 2 ou 3 exercícios — os mesmos passos
    de sempre.
11. No painel principal, na lista de alunos, **a sua linha tem a etiqueta
    “VOCÊ”** ao lado do status.
12. No celular, abra o app do aluno. No topo aparece a faixa **“Você está
    treinando como aluno”**, com o link de voltar ao painel.
13. A home mostra **o treino que você acabou de montar**.
14. Execute o treino: confirme algumas séries e conclua. A tela de
    conclusão agora oferece **“Tirar foto do treino”** e **“Concluir sem
    foto”** — toque em concluir sem foto por ora.
15. Toque em **“Voltar ao painel”** na faixa do topo. Você cai no painel.
16. No painel, abra a sua própria ficha de aluno. **A sessão que você
    acabou de fazer está lá**, com carga e repetições.
17. No app do aluno, toque na aba **Perfil**. Seus dados aparecem: nome,
    e-mail, nascimento, objetivo, n\u00edvel, peso e altura.
18. Toque em **\u201cEditar meus dados\u201d**. Os campos abrem **j\u00e1
    preenchidos** com o que estava na leitura — nenhum em branco.
19. O e-mail **n\u00e3o** \u00e9 um dos campos: no lugar dele h\u00e1 uma
    frase explicando que ele \u00e9 o endere\u00e7o de entrada e n\u00e3o
    muda por ali.
20. Mude o **peso** e toque em Salvar. A tela volta para a leitura, com o
    valor novo.
21. Toque em Editar de novo e depois em **Cancelar**: volta para a leitura
    e **nada mudou**.
22. No painel, abra a sua ficha de aluno: **o peso novo est\u00e1
    l\u00e1**.

## Parte 3 · O feed (14 min)

Ainda como aluno, no celular.

23. Toque na aba **Feed** na barra de baixo. Ela está clicável.
24. As duas abas de cima — **“Da turma”** e **“Com meu personal”** —
    trocam na hora, e a lista pisca um esqueleto cinza enquanto carrega.
25. Estando vazias, cada aba mostra um texto diferente. Leia os dois:
    fazem sentido?
26. Toque em **“Publicar”**, no canto superior direito.
27. Toque no quadro da foto. **Abre a câmera** (ou a galeria, se você
    escolher). Tire uma foto do que estiver na sua frente.
28. A foto aparece como prévia, quadrada. Em cima dela há um **×** para
    tirar. Teste o × e escolha outra.
29. Escreva uma legenda.
30. Em **“Quem pode ver”**, deixe a opção de cima — que já vem marcada — e
    publique.
31. Você volta ao feed, na aba **“Com meu personal”**, e o post está lá,
    com **um cadeado e “Só o seu personal vê”**.
32. Publique um segundo post com a **segunda opção de alcance** (a turma).
    Ele aparece na aba **“Da turma”**, e **sem** o cadeado.
33. Publique um terceiro **sem foto**, só com legenda. Funciona.
34. Tente publicar **sem foto e sem legenda**: o botão “Publicar” fica
    apagado e não dá para tocar.
35. Abra um dos posts. Toque no coração — **o número muda na hora**. Toque
    de novo e volta.
36. Escreva um comentário e envie. Ele aparece na lista, com a hora.
37. Volte ao feed: o contador de comentários do card subiu.
38. Abra o post de novo e toque em **“Apagar”**. Aparece um aviso dizendo
    que os comentários vão junto. Confirme — e o post some do feed.
39. Agora o caminho que importa: execute um treino e, na tela de
    conclusão, toque em **“Tirar foto do treino”**.
40. O compositor abre com o **resumo do treino no topo**: a letra do
    treino, o nome, quantas séries e o volume em kg.
41. Publique. No feed, o card mostra **esse mesmo resumo acima da
    legenda** — é o que separa este feed de qualquer outro.
42. Publique outro post pelo botão **Publicar** do feed, sem vir de um
    treino. Esse **não** tem resumo, e está certo.

## Parte 4 · Quem vê o quê (5 min) — **o teste que mais importa**

O teste que mais importa. Precisa de uma segunda conta de aluno (raul ou Vinicius). Se não tiver a senha, marque ✗ no passo 34 escrevendo “sem a senha” e pule o resto — a regra foi provada por SQL, mas ver com os olhos é outra coisa.

43. Como **você**, publique um post **para a turma**, com foto e legenda
    reconhecíveis (“post da turma”).
44. Publique outro **só para o personal** (“post privado”).
45. Saia e entre com a **conta do outro aluno**, no celular ou numa janela
    anônima.
46. Esse aluno também bate no portão de aceite. Aceite.
47. No Feed, aba **“Da turma”**: o **“post da turma” aparece**.
48. Na mesma aba: o **“post privado” NÃO aparece**. Qualquer aparição dele
    aqui é grave — marque ✗ e pare o teste.
49. Seu nome aparece escrito certo, **não** como “Aluno”.
50. Ao lado do seu nome há a etiqueta vermelha **PERSONAL**.
51. Aba **“Com meu personal”**: aparecem só os posts **desse** aluno,
    nenhum seu.
52. Abra o “post da turma” e comente nele.
53. Volte para a sua conta e abra o mesmo post: **o comentário dele está
    lá, com o nome dele**.

## Parte 5 · O painel Social (4 min)

No computador. A tela que faltava: \u00e9 aqui que o post marcado \u201cs\u00f3 o meu personal\u201d chega.

54. No painel, o menu tem **Social**. Abra.
55. Os posts que voc\u00ea publicou como aluno aparecem — **inclusive o
    que voc\u00ea marcou como privado**, com o selo **“S\u00d3 PARA
    VOC\u00ca”**. Se ele n\u00e3o estiver a\u00ed, \u00e9 o defeito que
    esta tela existe para consertar.
56. O post que foi para a turma tem o selo **“TURMA”**.
57. O cabe\u00e7alho conta os posts e quantos est\u00e3o **“sem sua
    resposta”**.
58. Os coment\u00e1rios aparecem **dentro do cart\u00e3o**, sem precisar
    abrir o post.
59. Escreva uma resposta num post e envie. Ela aparece na lista, com
    **“Voc\u00ea”** em vermelho.
60. Troque o per\u00edodo para **7 dias** e depois **Tudo**. A lista muda,
    e a URL tamb\u00e9m.
61. No celular, como aluno, abra o post que voc\u00ea respondeu: **a
    resposta do personal est\u00e1 l\u00e1**.

---

## Quando terminar

Me diga que terminou — eu leio as marcações e as notas direto da página, não
precisa copiar nada.

Se passar tudo, o M3 fecha. O que sobra da Fase 3 é a reavaliação física, que é
cortável — aí decidimos se vale ou se o próximo pedaço é outro.
