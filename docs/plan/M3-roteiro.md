# Roteiro · testar o feed e o personal-aluno (M3)

> Tudo o que entrou desde a sua última validação. Leva ~30 minutos.
>
> **Por que precisa ser você:** o host do Supabase é bloqueado pela política de
> rede deste ambiente. Eu conferi cada tela no navegador com dados fixos e provei
> as regras do banco por SQL, mas **nenhum fluxo com sessão de verdade passou por
> mim**. Publicar uma foto, de ponta a ponta, só acontece aqui.

Onde: **repsclub.com.br**, no celular para o app do aluno e no computador para o
painel. Vale abrir o painel numa aba e o app do aluno no celular ao lado.

## O que anotar

Em cada passo: **aconteceu o que está escrito?**

- ✅ sim
- ❌ não → **escreva o que apareceu na tela**, mesmo que pareça bobo

Os quatro defeitos do M1/M2 estavam todos em borda de sessão, e nenhum deles
apareceria num "não funcionou" sem a frase que a tela mostrou.

---

## Parte 1 · O portão de aceite (2 min)

Você vai bater nele porque a política de privacidade mudou de versão.

1. Abra o app do aluno no celular (`/app`). Antes de qualquer tela, aparece
   **"Atualizamos a política de privacidade"**, com um parágrafo explicando o
   feed.
2. Toque em **"Ler a política de privacidade"**. Ela abre. Procure a seção
   **"A foto do feed"** — é a nova.
3. Volte e toque em **"Ler os termos de uso"**. Procure **"O que você publica no
   feed"**.
4. Volte e toque em **"Li e aceito"**. O app abre normalmente.
5. Feche e abra o app de novo. **O portão não aparece mais.**

> ❌ se o portão voltar depois do aceite — significa que o registro não gravou.
> ❌ se algum texto mostrar `*asterisco*` ou `**asterisco duplo**` na tela.

---

## Parte 2 · Você como aluno de si mesmo (8 min)

Você já criou o perfil. Agora falta o que estava bloqueado: **montar o seu
próprio treino pelo caminho normal.**

6. No painel, **Macrotreinos → Novo programa**. No seletor "Aluno", **o seu nome
   está na lista.** (Era isso que não aparecia.)
7. Escolha você mesmo, dê um nome ao programa, deixe as semanas e salve.
8. Ative o programa.
9. Crie um treino dentro dele, com 2 ou 3 exercícios — os mesmos passos de
   sempre.
10. No painel principal, na lista de alunos, **a sua linha tem a etiqueta
    "VOCÊ"** ao lado do status.
11. No celular, abra o app do aluno. No topo aparece a faixa **"Você está
    treinando como aluno"** com o link de voltar ao painel.
12. A home mostra **o treino que você acabou de montar**.
13. Execute o treino: confirme algumas séries, conclua.
14. Toque em **"Voltar ao painel"** na faixa do topo. Você cai no painel.
15. No painel, abra a sua própria ficha de aluno. **A sessão que você acabou de
    fazer está lá**, com carga e repetições.

> ❌ se o seu nome não estiver no seletor do passo 6 — nesse caso me diga se você
> recarregou a página com Ctrl+F5 antes.

---

## Parte 3 · O feed (10 min)

Ainda como aluno, no celular.

16. Toque na aba **Feed** na barra de baixo. Ela está clicável.
17. As duas abas de cima: **"Da turma"** e **"Com meu personal"**. Troque entre
    elas — a aba acende na hora e a lista pisca um esqueleto cinza enquanto
    carrega.
18. Estando vazias, cada aba mostra um texto diferente. Leia os dois: fazem
    sentido?
19. Toque em **"Publicar"** no canto superior direito.
20. Toque no quadro da foto. **Abre a câmera** (ou a galeria, se você escolher).
    Tire uma foto do que estiver na sua frente.
21. A foto aparece como prévia, quadrada. Em cima dela há um **X** para tirar.
    Teste o X e escolha outra.
22. Escreva uma legenda.
23. Em **"Quem pode ver"**, deixe a opção de cima (**"Só ..."**) — que já vem
    marcada — e publique.
24. Você volta para o feed, na aba **"Com meu personal"**, e o post está lá.
    Embaixo do seu nome aparece **um cadeado com "Só o seu personal vê"**.
25. Publique um segundo post, agora com a **segunda opção de alcance** (a turma).
    Ele aparece na aba **"Da turma"**, e **sem** o cadeado.
26. Publique um terceiro **sem foto**, só com legenda. Funciona.
27. Tente publicar **sem foto e sem legenda**: o botão "Publicar" fica apagado e
    não dá para tocar.

### O post aberto

28. Toque em um dos posts. Abre a tela do post.
29. Toque no coração. **O número muda na hora.** Toque de novo, volta.
30. Escreva um comentário e envie. Ele aparece na lista, com a hora.
31. Volte ao feed. O contador de comentários do card subiu.
32. Abra o post de novo e toque em **"Apagar"**. Aparece um aviso dizendo que os
    comentários vão junto. Confirme.
33. Você volta ao feed e o post sumiu.

> ❌ se a foto demorar muito para subir, me diga quanto tempo e com que internet.
> A foto é encolhida no seu celular antes de subir; se algo der errado nessa
> parte, a mensagem é "Não conseguimos ler essa imagem".

---

## Parte 4 · Quem vê o quê (5 min) — **o teste que mais importa**

Precisa de uma segunda conta de aluno (raul ou Vinicius). Se não tiver a senha,
pule e me avise — a regra foi provada por SQL, mas ver com os olhos é outra
coisa.

34. Como **você (personal-aluno)**, publique um post marcado **para a turma**, com
    foto e legenda reconhecíveis ("post da turma").
35. Publique outro marcado **só para o personal** ("post privado").
36. Saia, entre com a **conta do outro aluno** no celular (ou numa janela
    anônima).
37. Esse aluno vai bater no portão de aceite também. Aceite.
38. Abra o Feed, aba **"Da turma"**:
    - o **"post da turma"** aparece;
    - o **"post privado"** **não** aparece;
    - o seu nome aparece escrito certo, **não** como "Aluno";
    - ao lado do seu nome há a etiqueta vermelha **PERSONAL**.
39. Aba **"Com meu personal"**: aparecem só os posts **desse** aluno, nenhum seu.
40. Abra o "post da turma" e comente nele.
41. Volte para a sua conta, abra o mesmo post: **o comentário dele está lá, com o
    nome dele**.

> ❌ **qualquer** aparição do "post privado" na conta do outro aluno é grave.
> Me avise imediatamente e não continue o teste.

---

---

## Parte 5 · O painel Social (4 min) — **no computador**

A tela que faltava: é aqui que o post marcado "só o meu personal" chega.

42. No painel, o menu tem **Social**. Abra.
43. Os posts que você publicou como aluno aparecem — **inclusive o que você
    marcou como privado**, com o selo **"SÓ PARA VOCÊ"**.
44. O post que foi para a turma tem o selo **"TURMA"**.
45. O cabeçalho conta os posts e quantos estão **"sem sua resposta"**.
46. Os comentários aparecem **dentro do cartão**, sem precisar abrir o post.
47. Escreva uma resposta num post e envie. Ela aparece na lista, com **"Você"**
    em vermelho.
48. Troque o período para **7 dias** e depois **Tudo**. A lista muda, e a URL
    também.
49. No celular, como aluno, abra o post que você respondeu: **a resposta do
    personal está lá**.

> ❌ se o post privado **não** aparecer no painel Social — é o defeito que esta
> tela existe para consertar.


## Depois

Me mande o que deu ❌, com a frase que apareceu na tela. Se tudo passar, o M3
fecha e a gente decide o próximo pedaço — o que sobrou da Fase 3 é a reavaliação
física (fotos de progresso e medidas), que é cortável.
