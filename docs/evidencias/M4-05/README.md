# M4-05 · Termos de uso e privacidade

## O que estava errado

O onboarding pedia: *"Aceito os termos de uso e a política de privacidade do
Reps Club"* — e **os dois documentos não existiam**. Nem havia como lê-los, nem
o aceite ficava registrado em lugar nenhum: o zod validava `z.literal("on")` e
descartava.

## O que passou a existir

- `/termos` e `/privacidade`, públicas, sem login — quem está decidindo se
  aceita ainda não tem conta.
- O checkbox do onboarding **linka para as duas**, em aba nova, com
  `stopPropagation` para o toque no link não marcar o checkbox por tabela.
- Rodapé com os dois links na landing e em todas as telas de autenticação.
- O aceite fica gravado em `term_acceptances`, com a versão do texto.

`01-termos-celular.png` · `02-privacidade.png` · `03-checkbox-com-links.png`

## A decisão de schema: log, não coluna

`students_update` deixa o aluno editar a própria linha (`id = auth.uid()`).
Uma coluna `termos_aceitos_em` ali seria prova que **o próprio aceitante pode
reescrever** — o que não é prova de nada.

`term_acceptances` é append-only: existe policy de select e de insert, e
**nenhuma** de update ou delete. Com RLS ligado, a ausência é a proibição.

Uma linha por versão, não um campo sobrescrito: quando o texto mudar, o aceite
antigo não vale para o novo, e é preciso guardar os dois.

## Provado por SQL, incluindo as burlas

| Tentativa | Resultado |
|---|---|
| Gravar aceite com data de 2020 | data forjada ignorada; ficou `2026-09-13 18:34` (relógio do banco) |
| Alterar a versão do próprio aceite | **0 linhas** alteradas |
| Apagar o próprio aceite | **0 linhas** apagadas; a linha continua lá |
| Ler aceite de outro usuário | **0 linhas** |
| Gravar aceite em nome de outro | erro `42501: new row violates row-level security policy` |

A data vem do gatilho `private.carimba_aceite`, que sobrescreve `aceito_em` a
cada insert. O `default` da coluna não bastava: default só vale para quem omite
o campo, e um POST direto não omite.

Fixtures criadas e removidas; o banco ficou com zero linhas de teste.

## Acessibilidade

Axe limpo (wcag2a/aa, 2.1, 2.2) em `/termos`, `/privacidade`, `/`, `/entrar` e
no onboarding. O contraste já vinha certo do M4-04.

## O que **precisa** do Otávio antes do piloto

Este texto é **rascunho de dev, não peça jurídica**. Escrevi a partir do
inventário real do banco — cada dado citado existe como coluna, e nada que
existe como coluna ficou de fora —, mas três coisas são decisão dele:

1. **O e-mail de contato.** Está como `[DEFINIR: e-mail de contato do Reps
   Club]` e **aparece assim na página**, de propósito: é mais fácil esquecer de
   trocar um endereço plausível do que um marcador gritante. Não publiquei o
   e-mail pessoal dele numa página aberta — isso convida spam e é escolha dele.
   Sai junto com o domínio próprio do M4-02.
2. **Quem responde pelo dado.** O texto assume dois controladores: quem opera o
   Reps Club, e o personal, sobre o treino que prescreve e o histórico que lê.
   Se o Reps Club virar empresa, entra razão social e CNPJ.
3. **Revisão por advogado.** O produto carrega dado de saúde sob LGPD e
   prescrição de exercício. O rascunho serve para o advogado partir dele em vez
   da folha em branco — não para substituí-lo.

## Buraco declarado, fora do escopo do card

**O personal não aceita nada.** O cadastro de personal não tem checkbox de
termos, e o card só pede o do aluno. Mas é o personal quem convida e quem
traz o dado de saúde do aluno para dentro — ele deveria aceitar também.

Não fiz porque adiciona atrito a um fluxo que o Otávio já validou em campo, e
essa é decisão de produto. São ~20 linhas quando ele decidir.
