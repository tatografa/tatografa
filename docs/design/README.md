# Handoff de design — fonte visual do Reps Club

> Trazido para o repositório em 13/09/2026. Até então vivia só no scratchpad da
> sessão, que é **efêmero** — e o `CLAUDE.md` já apontava para ele como fonte de
> verdade do design. Uma sessão encerrada teria levado junto.

## O que é cada arquivo

| Arquivo | Serve para |
|---|---|
| `01-produto-e-decisoes.md` | por que o produto é assim |
| `02-arquitetura.md` | desenho técnico proposto na origem |
| `03-modelo-de-dados.md` | tabelas e campos como o design imaginou |
| `04-design-tokens.md` | **origem dos tokens** de `app/globals.css` |
| `05-telas-aluno.md` | as 12 telas do app do aluno |
| `06-telas-personal.md` | as 10 telas do painel |
| `07-roadmap.md` | ordem de construção proposta |
| `08-piloto-e-gtm.md` | como o piloto foi pensado |
| `data/exercicios.json` | catálogo de exercícios de origem |
| `prototipos/*.dc.html` | protótipos navegáveis |

## Como usar

**Os `.dc.html` são referência, não código.** Reconstruir em React, nunca
copiar o HTML — é o que o `CLAUDE.md` manda e o que foi feito em todas as telas
existentes.

**O que já foi construído diverge do handoff em vários pontos, de propósito.**
Toda divergência relevante está registrada como decisão de arquitetura no
`CLAUDE.md`, com o motivo. Exemplos: o recorde pessoal é a maior carga
independente das repetições (contraria o doc 03); `/painel/alunos` virou a
lista dentro do próprio `/painel`; o macrotreino ganhou tela própria.

Quando o handoff e o `CLAUDE.md` discordarem, **o `CLAUDE.md` vence** — ele
registra o que foi decidido depois, com o produto na mão.

## O que ainda não foi construído

| Tela | Onde | Milestone |
|---|---|---|
| Foto do treino | aluno, doc 05 §7 | M3 |
| Compositor de post | aluno, doc 05 §8 | M3 |
| Feed (`/app/feed`) | aluno, doc 05 §9 | M3 |
| Reavaliação (`/app/reavaliacao`) | aluno, doc 05 §12 | M3 |
| Social (`/painel/social`) | painel, doc 06 §8 | M3 |
| Reavaliações (`/painel/reavaliacoes`) | painel, doc 06 §9 | M3 |
| Agenda (`/painel/agenda`) | painel, doc 06 §7 | fora do M3 |

`/painel/alunos` (doc 06 §3) **não será construída**: a lista vive no próprio
painel, e a navegação não aponta para ela — conferido, não há link quebrado.
