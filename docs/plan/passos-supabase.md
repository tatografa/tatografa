# Os passos que faltam — Supabase

> Três coisas, ~15 minutos. Todas em telas que só você alcança: o MCP do
> Supabase não expõe configuração de autenticação, e meu token da Vercel está
> sem permissão no seu time (403 em tudo que é leitura de projeto).
>
> Faça na ordem. O passo 3 é o teste que prova que funcionou.

---

## Passo 0 · Conferir o `NEXT_PUBLIC_SITE_URL` — 10 segundos

Não dá para eu verificar daqui. Mas não precisa procurar em configuração: o
**próprio link de convite** responde.

1. Abra **`repsclub.com.br/painel`** e entre como personal.
2. Clique em **Convidar aluno**, preencha qualquer nome e e-mail, **Gerar link**.
3. Olhe o link que apareceu:

| Começa com | Significa |
|---|---|
| `https://repsclub.com.br/convite/...` | ✅ variável certa, redeploy pegou |
| `https://tatografa.vercel.app/convite/...` | ❌ ainda com o valor antigo — ver abaixo |

**Se deu o segundo:** Vercel → **Settings → Environment Variables** →
`NEXT_PUBLIC_SITE_URL` = `https://repsclub.com.br` (sem barra no fim) →
**Deployments** → três pontinhos do último → **Redeploy**. Editar a variável
sozinho não basta: ela entra no build, então precisa publicar de novo.

> Pode apagar o convite de teste depois, ou só ignorar — ele expira em 7 dias.

---

## Passo 1 · Dizer ao Supabase qual é o endereço

Sem isso, o link que chega no e-mail de recuperação de senha aponta para o
endereço antigo e a pessoa cai fora do app.

1. Supabase → projeto **reps-club-dev**.
2. Menu lateral: **Authentication** → **URL Configuration**.
3. **Site URL:** apague o que estiver lá e ponha:
   ```
   https://repsclub.com.br
   ```
4. **Redirect URLs:** precisa ter as duas linhas. Se só houver a da Vercel,
   clique em **Add URL** e acrescente a primeira:
   ```
   https://repsclub.com.br/**
   https://tatografa.vercel.app/**
   ```
   Os `/**` são obrigatórios — sem eles o Supabase recusa o retorno.
5. **Save**.

---

## Passo 2 · Ligar o e-mail de verdade

Hoje o Supabase usa o serviço de e-mail embutido dele, que **só entrega para
endereços da sua equipe Supabase**. Para qualquer aluno, "Esqueci minha senha"
não entrega nada.

Sua Hostinger já resolve isso, e a caixa `contato@repsclub.com.br` já existe.

### 2.1 A senha da caixa

Você vai precisar dela. Se não lembrar: Hostinger → **E-mails** →
`contato@repsclub.com.br` → **Alterar senha**.

> Trocar a senha desconecta quem já usa essa caixa (celular, Outlook). Há 8
> mensagens nela, então procure a senha antes de trocar.

### 2.2 Preencher no Supabase

Supabase → **Authentication** → **Emails** → aba **SMTP Settings** →
ligar **Enable Custom SMTP**:

| Campo | Valor |
|---|---|
| Sender email | `contato@repsclub.com.br` |
| Sender name | `Reps Club` |
| Host | `smtp.hostinger.com` |
| Port number | `465` |
| Username | `contato@repsclub.com.br` |
| Password | a senha da caixa |

**Save**.

> Se a Hostinger mostrar host ou porta diferentes em **E-mails → Configurações
> → Configurar dispositivo**, use os dela. Porta alternativa comum: `587`.

### 2.3 O limite de envio

Ao ligar SMTP próprio o Supabase começa com 30 e-mails/hora. Para o piloto
sobra. Fica em **Authentication → Rate Limits**, se um dia apertar.

---

## Passo 3 · O teste que prova

Precisa ser com **um e-mail que não é o seu** e que não está na equipe do
Supabase — um Gmail qualquer serve. Com o seu, o teste passa mesmo quebrado:
foi o que escondeu esse defeito até agora.

1. Abra `repsclub.com.br/recuperar`.
2. Digite esse outro endereço.
3. Confira a caixa dele (inclusive spam).

| O que acontecer | O que significa | O que fazer |
|---|---|---|
| O e-mail chega | ✅ tudo certo | acabou |
| "Não conseguimos enviar o e-mail agora" | o SMTP recusou | rever usuário e senha no 2.2 |
| "Muitas tentativas seguidas" | limite | esperar 1 minuto |
| Diz que enviou e nada chega | o e-mail caiu em spam, ou o endereço não tem conta | conferir spam; lembrar que só chega para quem tem conta |

> Antes de hoje essa tela dizia "link enviado" mesmo quando falhava. Se
> aparecer a mensagem de erro, é a correção funcionando — não defeito novo.

4. Clique no link do e-mail e confira que ele leva para **`repsclub.com.br`**,
   não para o endereço antigo. Se levar para o antigo, é o Passo 1.

---

## Depois

Me diga o que aconteceu no Passo 0 e no Passo 3. Com esses dois, o M4 fecha e
sobra só decisão: revisar o rascunho jurídico, e se o personal também aceita os
termos ao criar a conta.
