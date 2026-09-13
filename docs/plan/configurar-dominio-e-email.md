# Ligar o domínio e o e-mail — passo a passo

> Duas coisas separadas, e a ordem não importa. Juntas levam ~40 minutos.
>
> Você não precisa entender nada de DNS nem de SMTP. É copiar e colar.

---

# Parte 1 · `repsclub.com.br` apontando para o app

Hoje o app vive em `tatografa.vercel.app`. Isso funciona, mas é um endereço que
não parece do produto — e o aluno que recebe o link no WhatsApp vê "vercel.app".

**Nada no código precisa mudar.** O app descobre sozinho em que endereço está.

## 1.1 Na Vercel

1. Abra o projeto do Reps Club.
2. **Settings → Domains**.
3. Digite `repsclub.com.br` e clique em **Add**.
4. Marque a opção que também adiciona `www.repsclub.com.br`, se ela aparecer.
5. A Vercel vai mostrar **os registros de DNS que você precisa criar**. Não
   feche esta tela — os valores dela vão para o passo 1.2.

Ela vai pedir mais ou menos isto (confira na tela, os valores podem mudar):

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

## 1.2 Na Hostinger

1. Entre na Hostinger e vá em **Domínios → repsclub.com.br → DNS / Nameservers**
   (ou **Zona DNS**).
2. Se já existir um registro `A` com nome `@` apontando para outro lugar,
   **edite** em vez de criar um segundo.
3. Crie/edite exatamente os registros que a Vercel mostrou.
4. Salve.

> **Não mexa nos registros `MX`.** São eles que fazem o e-mail do domínio
> funcionar, e a Parte 2 depende deles.

## 1.3 Esperar

O DNS leva de alguns minutos a algumas horas. A Vercel mostra **Valid
Configuration** quando estiver pronto. Enquanto isso `tatografa.vercel.app`
continua funcionando normalmente.

## 1.4 Avisar o Supabase do endereço novo

Isto é obrigatório — sem isso os links de e-mail levam para o endereço antigo.

1. Supabase → projeto **reps-club-dev** → **Authentication → URL Configuration**.
2. **Site URL:** `https://repsclub.com.br`
3. Em **Redirect URLs**, deixe as duas linhas (a antiga não atrapalha):
   - `https://repsclub.com.br/**`
   - `https://tatografa.vercel.app/**`
4. Salvar.

---

# Parte 2 · O e-mail do produto

## Por que isto é necessário

O Supabase tem um serviço de e-mail embutido, e é o que está ligado hoje. A
documentação dele diz, com todas as letras:

> *"Supabase Auth will refuse to deliver messages to addresses that are not part
> of the project's team... All other addresses will fail with the error message
> **Email address not authorized**."*

Ou seja: **hoje o e-mail só chega para você.** Para qualquer aluno de verdade,
"Esqueci minha senha" nunca entrega nada. Isso não apareceu no seu teste de
campo porque o seu endereço está na equipe do projeto.

Você já paga a Hostinger, e o plano dela inclui caixa de e-mail. É de graça
ligar isso — não precisa de provedor novo.

## 2.1 Criar a caixa na Hostinger

1. Hostinger → **E-mails** → escolha `repsclub.com.br`.
2. Crie a conta **`contato@repsclub.com.br`**.
3. Defina uma senha e **guarde-a** — ela vai no passo 2.3.

> Esse endereço já está escrito na política de privacidade do app, como canal
> para pedido de exclusão e de cópia de dados. Ele precisa existir de verdade.

## 2.2 Pegar os dados de SMTP

Na Hostinger, em **E-mails → Configurações → Configurar dispositivo** (ou
"Configuração manual"), aparecem os dados de envio. Costumam ser:

| Campo | Valor |
|---|---|
| Servidor (host) | `smtp.hostinger.com` |
| Porta | `465` |
| Segurança | SSL/TLS |
| Usuário | `contato@repsclub.com.br` |
| Senha | a que você criou |

**Use os valores que a sua tela mostrar**, não os desta tabela — eles podem
mudar conforme o plano.

## 2.3 Ligar no Supabase

1. Supabase → **Authentication → Emails → SMTP Settings**.
2. Ligue **Enable Custom SMTP**.
3. Preencha:
   - **Sender email:** `contato@repsclub.com.br`
   - **Sender name:** `Reps Club`
   - **Host:** `smtp.hostinger.com`
   - **Port:** `465`
   - **Username:** `contato@repsclub.com.br`
   - **Password:** a senha da caixa
4. Salvar.

## 2.4 Afrouxar o limite de envio

Ao ligar SMTP próprio, o Supabase impõe um limite conservador de **30 e-mails
por hora**. Para o piloto está de bom tamanho, mas vale conferir:

**Authentication → Rate Limits → "Rate limit for sending emails"**.

## 2.5 Testar de verdade

O teste que importa usa **um e-mail que não é seu** — pode ser um Gmail
qualquer que você tenha, desde que não esteja na equipe do Supabase.

1. Abra `repsclub.com.br/recuperar`.
2. Digite esse outro e-mail.
3. **Se o e-mail chegar:** funcionou.
4. **Se a tela disser "Não conseguimos enviar o e-mail agora":** o SMTP está
   recusando. Confira usuário e senha no passo 2.3 — é quase sempre isso.

> Antes desta correção a tela dizia "link enviado" mesmo quando falhava. Agora
> ela avisa. Se aparecer o aviso, é informação, não defeito novo.

---

# O que **não** vai por e-mail, de propósito

**O convite do aluno continua sendo link copiado no WhatsApp.** Decisão sua, e
é a certa: aluno de academia abre WhatsApp, não abre e-mail. O e-mail fica só
para o que não tem alternativa — recuperar senha e link de acesso.

---

# Resumo do que fica para você

| # | Onde | O quê | Tempo |
|---|---|---|---|
| 1 | Vercel | Adicionar `repsclub.com.br` em Settings → Domains | 2 min |
| 2 | Hostinger | Criar os registros DNS que a Vercel pediu | 10 min |
| 3 | Supabase | Site URL e Redirect URLs com o domínio novo | 3 min |
| 4 | Hostinger | Criar a caixa `contato@repsclub.com.br` | 5 min |
| 5 | Supabase | Preencher o SMTP com os dados da Hostinger | 5 min |
| 6 | — | Testar `/recuperar` com um e-mail que não é seu | 5 min |

Depois do 6, me diga o que aconteceu. Se der erro, o texto exato da tela já
diz bastante.
