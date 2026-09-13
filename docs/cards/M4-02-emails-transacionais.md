# M4-02 · E-mail que chega de verdade

**Etiqueta:** `pleno`

**Objetivo:** os fluxos que dependem de e-mail — recuperar senha e link de acesso
do aluno — param de falhar em silêncio.

**Milestone:** M4 · **Brief:** `docs/plan/M4-brief.md`

**Checkpoint técnico:** nenhum.

> **Reescrito em 13/09/2026.** O card original pedia provedor de e-mail novo
> (Resend) e domínio próprio, e estava marcado como bloqueado esperando dinheiro
> do Otávio. Duas coisas mudaram: ele já tem `repsclub.com.br` e conta paga na
> Hostinger (que inclui SMTP), e apareceu um defeito mais grave que o escopo
> original.

## O defeito que motivou o card

`/recuperar` e `/acesso` diziam **"link enviado"** mesmo quando o envio falhava.

O serviço de e-mail embutido do Supabase não é apenas limitado em volume: ele
**só entrega para endereços da equipe do projeto** e recusa todo o resto com
`Email address not authorized`. O filtro das duas ações só deixava passar
`rate limit|for security purposes`, então essa recusa caía no ramo de sucesso.

Resultado: para qualquer aluno de verdade, "Esqueci minha senha" mostrava
confirmação e nada acontecia. Não apareceu no teste de campo porque o e-mail do
Otávio está na equipe do projeto.

## Critérios de aceite

- [x] Falha de **envio** aparece para quem pediu; "esse e-mail não existe"
      continua calado — as duas coisas são diferentes e vinham juntas
- [x] O erro real vai para o log do servidor, sem o endereço junto
- [x] Um 500 genérico em outra tela não vira "não conseguimos enviar o e-mail"
- [x] Roteiro de configuração escrito para quem não entende de DNS nem de SMTP
- [x] A decisão errada no `CLAUDE.md` ("~2 e-mails/hora") corrigida
- [ ] **SMTP da Hostinger ligado no Supabase** — do Otávio
- [ ] **`repsclub.com.br` apontando para a Vercel** — do Otávio
- [ ] `/recuperar` testado com e-mail fora da equipe do projeto — do Otávio

## Delta técnico

- `FALHA_DE_ENVIO_DE_EMAIL` em `lib/auth/mensagens.ts` separa "erro nosso" de
  "resposta sobre quem tem conta". Mostrar o primeiro não vaza nada: a recusa do
  provedor acontece para qualquer endereço, com ou sem conta.
- O padrão que **traduz** é mais estreito que o que **decide mostrar**, de
  propósito: `traduzErro` atende a autenticação inteira.
- Nenhuma mudança para o domínio: `getSiteOrigin()` deriva do host da
  requisição, e `NEXT_PUBLIC_SITE_URL` continua opcional.

## O que **não** entra

- **Convite por e-mail.** Continua como link copiado no WhatsApp — decisão do
  Otávio em 13/09, e é a certa: aluno de academia abre WhatsApp.
- **Link de acesso gerado pelo personal no painel.** Exigiria a chave de serviço
  do Supabase na Vercel, e um vazamento daria o banco inteiro, ignorando o RLS.
  Com SMTP funcionando, o aluno se recupera sozinho.
- Template de e-mail com identidade visual. O padrão do Supabase entrega; o
  bonito é depois do piloto.

## Roteiro para o Otávio

`docs/plan/configurar-dominio-e-email.md`
