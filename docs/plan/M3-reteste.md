# Reteste do M3 — os consertos e as pontas soltas

> **Este arquivo é gerado** por `docs/plan/gerar-roteiro.py M3-reteste`, a partir
> de `M3-reteste.html`. Editar os passos aqui não muda a página.
>
> Rodada curta, depois dos 115 passos do `M3-roteiro`: os dois defeitos que
> aquela rodada encontrou e que já foram corrigidos, os dois que eu não
> consegui reproduzir, e os quatro em que a expectativa do roteiro é que estava
> errada. Cerca de 22 minutos.

## O que anotar

Nas Partes 2 e 3 a **anotação vale mais que a marcação**: são os dois casos em
que eu não sei o que aconteceu, e a frase que aparece na tela é o que falta.

## Parte 1 · Os dois consertos de hoje (5 min) — **o teste que mais importa**

**No computador, logado como personal.** Os dois defeitos que a sua rodada encontrou. O passo 2 é o que importa: era ali que o diálogo ficava aberto.

1. Painel → **Reavaliações** → “Nova reavaliação”. Escolha um aluno e
   clique **Liberar**. O diálogo **fecha sozinho**.
2. Clique “Nova reavaliação” de novo, escolha **outro aluno** e libere.
   **Fecha sozinho outra vez.** Era exatamente aqui que ele ficava aberto:
   o segundo sucesso seguido.
3. Uma terceira vez, agora com o **mesmo aluno da primeira**. Aparece
   “Esse aluno já tem uma reavaliação esperando resposta” e o diálogo
   **continua aberto** — erro tem que ficar na tela para ser lido.
4. Painel → **Alunos** → clique num aluno que já informou os dados. Na
   linha abaixo do nome aparecem **o peso e a altura**, junto do objetivo,
   do nível e do e-mail.
5. Abra a ficha de um aluno que **nunca informou peso**. A linha
   simplesmente pula o dado — sem “null”, sem espaço vazio estranho.
6. No celular, no app do aluno, mude o **peso** em Perfil → “Editar meus
   dados”. Volte à ficha dele no painel: **o peso novo está lá.** Era o
   passo 27, que falhou porque a ficha nunca mostrou peso.

## Parte 2 · O aviso de conflito (5 min) — **o teste que mais importa**

**No computador.** Este eu não consegui reproduzir — no meu teste o aviso aparece. Os passos abaixo servem para descobrir por que não apareceu para você, então as anotações aqui valem mais que o ✓.

7. Painel → **Agenda**. Anote qual semana está no título (ex.: “14 a 20 de
   setembro”).
8. Clique **“Nova sessão”**. Repare no **dia que já vem preenchido** — é
   hoje. Escolha um aluno, deixe a hora em **18:00** e marque.
9. Clique “Nova sessão” de novo, escolha **outro aluno** e **não mude
   nada** — nem o dia, nem a hora. Antes de salvar deve aparecer uma
   **faixa amarela** dizendo com quem bate.
10. Se apareceu: ela fica **entre o campo de duração e o de observação**.
    Role o diálogo todo e diga se ela estava visível sem precisar rolar.
11. Se **não** apareceu: escreva no ✗ **qual dia estava no campo** nas
    duas vezes. É a informação que me falta.
12. Agora repita mudando o dia para **outra semana** (duas semanas à
    frente), no mesmo horário de uma sessão que já exista lá. **Espero que
    o aviso NÃO apareça** — ele só enxerga a semana que está na tela.
    Quero confirmar esse limite antes de decidir se conserto.

## Parte 3 · A etiqueta PERSONAL (4 min)

O outro que eu não consegui fechar. A lógica está certa no código, então quero saber em que tela você estava. Atenção a quem está logado em cada passo.

13. **No app do aluno** (celular), logado como **você mesmo**: publique um
    post **para a turma**, com legenda reconhecível.
14. Confirme que você está no app do aluno e não no painel: a **barra de
    baixo** tem Treinar · Progresso · Feed · Perfil.
15. Saia e entre **na conta do raul**. Vá em **Feed → aba “Da turma”**.
16. No post que **você** publicou, ao lado do seu nome, tem a etiqueta
    vermelha **PERSONAL**.
17. Nos posts do próprio raul ou do Vinicius **não** há essa etiqueta — e
    está certo, ela marca só o post de quem treina a turma.
18. Se você viu etiquetas escritas **“SÓ PARA VOCÊ”** ou **“TURMA”**,
    escreva isso no ✗: essas são as do **painel**, não as do app — e aí eu
    sei que a tela era outra.

## Parte 4 · A próxima sessão na home (4 min)

Na rodada passada o roteiro atrapalhou: mandava marcar tudo como realizada ou faltou antes de conferir a linha. Sem sessão agendada no futuro não há o que mostrar. Agora na ordem certa.

19. Painel → Agenda → **“Nova sessão”** para **você mesmo**, num dia
    **futuro**. **Deixe como agendada** — não clique em Veio nem em
    Faltou.
20. No celular, no app do aluno, abra a **home**. Tem a linha **“Sessão
    com {seu nome} · {dia}, {hora} · 1h”**, com ícone de calendário.
21. **Não há botão nenhum** nessa linha. É lembrete, e é de propósito:
    quem marca presença é o personal.
22. No painel, **cancele** essa sessão. Volte à home do aluno: **a linha
    sumiu**.
23. Marque outra sessão futura como **realizada**. A linha também não
    volta — só sessão **agendada e no futuro** aparece ali.

## Parte 5 · As pontas soltas (4 min)

Três coisas onde a expectativa do roteiro estava errada, e uma que ficou sem marcar.

24. Do painel, o caminho para o app do aluno é **menu “Treinar” → “Abrir o
    app do aluno”**. Confirme que funciona. Era o passo 16: funcionou para
    você, mas o roteiro não dizia o caminho.
25. No Perfil do aluno → **“Editar meus dados”**: se você virou aluno de
    si mesmo pelo painel, nascimento, objetivo, nível, peso e altura vêm
    **em branco** — você nunca passou pelo convite, que é onde isso é
    preenchido. **Isso está certo.** Preencha e salve.
26. Depois de salvar, abra a sua ficha no painel: **os dados aparecem** na
    linha do cabeçalho.
27. Execute um treino e, na tela de conclusão, use **“Tirar foto do
    treino”**. Publique. No feed, o card mostra o **resumo do treino acima
    da legenda** (letra, nome, séries, kg). Esse ficou sem marcar na
    rodada passada.

---

## Quando terminar

Me diga que terminou — eu leio as marcações e as notas direto da página, não
precisa copiar nada.

Se passar tudo, o M3 fecha. O que sobra da Fase 3 é a reavaliação física, que é
cortável — aí decidimos se vale ou se o próximo pedaço é outro.
