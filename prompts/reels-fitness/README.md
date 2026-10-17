# Reels — Musculação / Corrida / Saúde Esportiva

Pack de prompts para gerar reels verticais na Higgsfield (MCP `generate_video`).

## A regra que faltava: plano-sequência

A primeira tentativa (16/10/2026) falhou por **erro de roteiro, não de modelo**. O prompt
pedia "três batidas com corte seco" e descrevia três sujeitos diferentes — mãos numa barra,
pés correndo, um corredor numa escadaria. O modelo obedeceu e entregou três cacos sem
nenhum fio condutor. Em 8–10 segundos não há tempo de estabelecer e reconectar personagens.

**Regra para todo prompt deste pack:**

1. **Um plano-sequência só.** Escrever `ONE CONTINUOUS SHOT, NO CUTS` de forma explícita,
   e repetir `no cuts` na lista negativa.
2. **Uma pessoa só**, descrita de forma concreta (idade, cabelo, roupa) para a identidade
   não derreter no meio do clipe.
3. **Um local só.** Nenhuma troca de cenário.
4. **Um movimento de câmera contínuo** (arco, push-in, follow) — não uma lista de planos.
5. **Um tema por vídeo.** Academia e corrida no mesmo clipe de 10s é o que produz incoerência.
   Cada tema vira um clipe do lote.
6. **Arco de ação dentro da mesma tomada**: preparação → esforço → alívio. Isso dá narrativa
   sem precisar de corte.

Os prompts estão em inglês de propósito — os modelos de vídeo respondem melhor. O resto
da documentação fica em português.

## Parâmetros de geração

```
model:          seedance_2_5
mode:           t2v
aspect_ratio:   9:16
duration:       10
resolution:     1080p
generate_audio: false     # a trilha entra na edição, com áudio de trend
```

## Custos (10 s, 9:16, Seedance 2.5)

| Resolução | Créditos / clipe | 5 clipes |
|---|---|---|
| 1080p | 160 | 800 |
| 720p | 70 | 350 |
| 480p (ou `draft: true`) | 30 | 150 |

`draft: true` custa igual ao 480p, entrega 480p e permite finalizar **o mesmo vídeo** em
1080p por até 7 dias — melhor custo-benefício para aprovar roteiro antes de gastar no 1080p.

Alternativa barata para testar roteiro: `seedance_2_0_mini`, 10 s / 480p = 5 créditos
(8 s = 4, 6 s = 3). Qualidade menor, serve para validar se a tomada fecha.

## Safe zones do Reels

A UI do Instagram cobre as bordas. Todo prompt pede ação no centro e espaço limpo no terço
superior e na faixa inferior, onde entram legenda e CTA.

## Lista negativa padrão

Vai no fim de cada prompt: sem cortes, sem troca de cena ou de pessoa, sem texto na tela,
sem logo, sem marca d'água, sem membros deformados ou dedos extras. Texto gerado por IA
quase sempre sai torto — legenda e CTA entram na edição.

## Clipes

| # | Arquivo | Tema |
|---|---|---|
| 01 | `01-musculacao.md` | Levantamento terra, força |
| 02 | `02-corrida.md` | Corrida de rua ao amanhecer |
| 03 | `03-mobilidade.md` | Mobilidade e alongamento |
| 04 | `04-nutricao.md` | Alimentação esportiva |
| 05 | `05-recuperacao.md` | Recuperação pós-treino |
