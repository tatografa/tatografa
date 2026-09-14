# Roteiro · validar o M3 (feed, personal-aluno, perfil)

> **Este arquivo é gerado.** A lista de passos vive na página que o Otávio usa
> para marcar (o artefato "Roteiro M3 · Reps Club") e é copiada para cá pelo
> script do commit que a altera. Editar os passos aqui não muda a página — e as
> duas listas já divergiram uma vez, em 14/09, quando eu mantinha as duas à mão.
>
> Tudo o que entrou desde a última validação. Leva cerca de 35 minutos.
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
14. Execute o treino: confirme algumas séries e conclua.
15. Toque em **“Voltar ao painel”** na faixa do topo. Você cai no painel.
16. No painel, abra a sua própria ficha de aluno. **A sessão que você
    acabou de fazer está lá**, com carga e repetições.
17. No app do aluno, toque na aba **Perfil**. Seus dados aparecem: nome,
    e-mail, nascimento, objetivo, nível, peso e altura.
18. Toque em **“Editar meus dados”**. Os campos abrem **já preenchidos**
    com o que estava na leitura — nenhum em branco.
19. O e-mail **não** é um dos campos: no lugar dele há uma frase
    explicando que ele é o endereço de entrada e não muda por ali.
20. Mude o **peso** e toque em Salvar. A tela volta para a leitura, com o
    valor novo.
21. Toque em Editar de novo e depois em **Cancelar**: volta para a leitura
    e **nada mudou**.
22. No painel, abra a sua ficha de aluno: **o peso novo está lá**.

## Parte 3 · O feed (10 min)

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

## Parte 4 · Quem vê o quê (5 min) — **o teste que mais importa**

O teste que mais importa. Precisa de uma segunda conta de aluno (raul ou Vinicius). Se não tiver a senha, marque ✗ no passo 34 escrevendo “sem a senha” e pule o resto — a regra foi provada por SQL, mas ver com os olhos é outra coisa.

39. Como **você**, publique um post **para a turma**, com foto e legenda
    reconhecíveis (“post da turma”).
40. Publique outro **só para o personal** (“post privado”).
41. Saia e entre com a **conta do outro aluno**, no celular ou numa janela
    anônima.
42. Esse aluno também bate no portão de aceite. Aceite.
43. No Feed, aba **“Da turma”**: o **“post da turma” aparece**.
44. Na mesma aba: o **“post privado” NÃO aparece**. Qualquer aparição dele
    aqui é grave — marque ✗ e pare o teste.
45. Seu nome aparece escrito certo, **não** como “Aluno”.
46. Ao lado do seu nome há a etiqueta vermelha **PERSONAL**.
47. Aba **“Com meu personal”**: aparecem só os posts **desse** aluno,
    nenhum seu.
48. Abra o “post da turma” e comente nele.
49. Volte para a sua conta e abra o mesmo post: **o comentário dele está
    lá, com o nome dele**.

## Parte 5 · O painel Social (4 min)

No computador. A tela que faltava: é aqui que o post marcado “só o meu personal” chega.

50. No painel, o menu tem **Social**. Abra.
51. Os posts que você publicou como aluno aparecem — **inclusive o que
    você marcou como privado**, com o selo **“SÓ PARA VOCÊ”**. Se ele não
    estiver aí, é o defeito que esta tela existe para consertar.
52. O post que foi para a turma tem o selo **“TURMA”**.
53. O cabeçalho conta os posts e quantos estão **“sem sua resposta”**.
54. Os comentários aparecem **dentro do cartão**, sem precisar abrir o
    post.
55. Escreva uma resposta num post e envie. Ela aparece na lista, com
    **“Você”** em vermelho.
56. Troque o período para **7 dias** e depois **Tudo**. A lista muda, e a
    URL também.
57. No celular, como aluno, abra o post que você respondeu: **a resposta
    do personal está lá**.

---

## Quando terminar

Me diga que terminou — eu leio as marcações e as notas direto da página, não
precisa copiar nada.

Se passar tudo, o M3 fecha. O que sobra da Fase 3 é a reavaliação física, que é
cortável — aí decidimos se vale ou se o próximo pedaço é outro.
