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

## Se der erro no envio — diagnóstico

A tela agora mostra *"Não conseguimos enviar o e-mail agora"* quando o envio
falha de verdade. O motivo exato **não** aparece para o usuário (seria vazar
detalhe de servidor), mas fica no log do Supabase.

**Onde ler:** Supabase → **Logs** → **Auth Logs**. Procure `level: error` e o
campo `error`.

| O que o log disser | Causa | Correção |
|---|---|---|
| `535 ... authentication failed` | usuário ou senha do SMTP recusados | ver abaixo |
| `Email address not authorized` | SMTP próprio **não** está ligado; ainda no serviço embutido | ligar o Custom SMTP (Passo 2) |
| `connection refused` / `timeout` | host ou porta errados | tentar `587` no lugar de `465` |
| `553` / `550` sender rejected | o *Sender email* não é a caixa autenticada | Sender e Username têm de ser o mesmo endereço |

### O `535` persistente — qual lado está errado

`535` quer dizer que a conexão chegou e o servidor **rejeitou a credencial**.
Isso descarta host, porta e TLS: em `465` e em `587` o erro é o mesmo.

Sobra saber de que lado está a senha errada, e há um teste que separa os dois
em 30 segundos:

**Entre no webmail da Hostinger com a mesma senha** que está no campo do
Supabase — `mail.hostinger.com`, usuário `contato@repsclub.com.br`.

| Resultado | Onde está o erro | Correção |
|---|---|---|
| O webmail **aceita** | a senha está certa na Hostinger; o campo do Supabase é que está diferente | reescrever o campo **digitando**, nunca colando |
| O webmail **recusa** | a senha da caixa não é essa | redefinir a senha da caixa e usar a nova nos dois lugares |

A causa mais comum do primeiro caso é espaço invisível colado no fim. Colar de
uma mensagem de chat traz isso com frequência.

### O tempo de propagação

Trocar a senha da caixa na Hostinger **não vale instantaneamente** nos
servidores de envio. A troca registrada em log como `OK` pode levar alguns
minutos para valer no SMTP.

Se o SMTP foi configurado logo depois de uma troca de senha, o `535` costuma
ser só isso. **Espere uns minutos e tente de novo antes de mexer em qualquer
campo** — reconfigurar por cima reinicia a espera e confunde o diagnóstico.

Se persistir depois de ~10 minutos:

1. No Supabase, apague o campo **Password** e digite a senha **à mão**, sem
   colar — espaço invisível no fim é a causa mais comum depois da propagação.
2. Confira que **Username** e **Sender email** são os dois
   `contato@repsclub.com.br`.
3. Troque a porta de `465` para `587` e salve de novo.
4. Se nada resolver, me avise: eu redefino a senha da caixa para uma sem
   caractere especial complicado e a gente tenta com ela.

## Depois

Me diga o que aconteceu no Passo 0 e no Passo 3. Com esses dois, o M4 fecha e
sobra só decisão: revisar o rascunho jurídico, e se o personal também aceita os
termos ao criar a conta.
