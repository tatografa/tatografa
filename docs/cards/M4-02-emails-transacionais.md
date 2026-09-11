# M4-02 · E-mails que o produto precisa mandar

**Etiqueta:** `pleno`

**Objetivo:** convite, recuperação de senha e link mágico param de depender do limite de
e-mail do Supabase. Sem isso, cada aluno novo do piloto é um problema.

**Milestone:** M4 · **Brief:** `docs/plan/M4-brief.md`

**Checkpoint técnico:** **obrigatório, e depende do Otávio antes de começar.** Escolher
provedor e configurar domínio são decisões dele (ver "Bloqueios" abaixo).

## Critérios de aceite

- [ ] Convite do aluno pode ser **enviado por e-mail**, além do link copiável — o link
      continua existindo, porque é ele que funciona quando o e-mail falha
- [ ] Recuperação de senha chega de forma confiável
- [ ] Link mágico do aluno (`/acesso`) chega de forma confiável
- [ ] E-mail em português, com a identidade do produto, não o template cru do Supabase
- [ ] Remetente é o domínio do produto, com SPF/DKIM configurados — senão cai em spam
- [ ] Falha de envio **não** trava a ação: o convite é criado e o link copiável aparece
      mesmo se o e-mail não sair
- [ ] Limite de envio tratado com mensagem que diz o que fazer, não só "tente de novo"
- [ ] SQL: o disparo não expõe token de convite a quem não deveria vê-lo

## Delta técnico

- **O token do convite é a credencial.** Mandá-lo por e-mail é aceitável (é o que todo
  produto faz), mas ele não pode aparecer em log, em painel de provedor nem em
  `docs/`. Conferir o que o provedor guarda do corpo da mensagem.
- **A confirmação de e-mail está desligada** desde o teste de campo, e o convite é a
  prova do canal. Este card **não** a religa: reativar exigiria que o e-mail funcionasse
  antes, e a ordem certa é essa.
- O envio é efeito colateral, não pré-condição: a Server Action de convite já devolve o
  link, e continua devolvendo mesmo com o e-mail fora do ar.

## Bloqueios — precisam do Otávio antes do card começar

1. **Qual provedor.** Resend é o caminho natural com Next (free tier de 3 mil/mês, SDK
   simples). Alternativas: Postmark, SES.
2. **Qual domínio.** Sem domínio próprio não há SPF/DKIM, e o e-mail cai em spam. Custa
   ~R$40/ano.

## Fora do escopo

- E-mail de aluno inativo, de recorde batido ou qualquer notificação de engajamento.
- Fila de reenvio de e-mail com retry.
