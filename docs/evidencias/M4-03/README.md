# M4-03 · Quando dá errado, o app diz o que fazer

## O que foi provado no navegador

`estados-erro-404-carregando.png` — os três componentes novos numa rota
descartável (`/conferir`, ignorada pelo git), lado a lado: falha de leitura com
o código da ocorrência, 404 e esqueleto de carregamento. Sem erro de JS no
console, `aria-busy` presente no esqueleto.

`404-fora-da-area-logada.png` — o 404 de verdade, em `/nao-existe-mesmo`,
passando pelo roteador. Não é componente isolado: é a rota.

## A prova que mudou o desenho

Um `layout.tsx` que estoura de propósito, com um `error.tsx` no **mesmo**
segmento:

```
pegou no segmento:      false
pegou no app/error.tsx: true
caiu no global-error:   false
```

Confirma no navegador o que a doc do Next diz
(`03-file-conventions/error.md`, linha 96): `error.tsx` não envolve o
`layout.tsx` do próprio segmento. Como `requireStudent()` e `requireTrainer()`
moram nos layouts, sem `app/error.tsx` a falha mais provável do produto cairia
no `global-error` — documento trocado, sem o CSS do app. Por isso o arquivo
existe.

## O que não deu para provar aqui

Os 404 de dentro das áreas logadas (`app/(aluno)/app/not-found.tsx` e
`app/(personal)/painel/not-found.tsx`): sem sessão o roteador manda para
`/entrar` antes de chegar neles. Os componentes que eles renderizam estão na
primeira imagem. Fica para o teste de campo do Otávio, com sessão de verdade.
