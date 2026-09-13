# Ligar o domínio e o e-mail — passo a passo

> **Revisado em 13/09/2026, depois de inspecionar o DNS e a Hostinger de verdade.**
> A primeira versão deste roteiro mandava sobrescrever o registro `A` do domínio.
> **Isso teria derrubado um site que está no ar.** Corrigido abaixo.

## O que eu encontrei ao inspecionar

| Achado | Consequência |
|---|---|
| `repsclub.com.br` **já serve um site** (hospedagem Hostinger, `147.93.38.127`, no ar desde 05/11/2025) | Mexer no registro `A` do domínio raiz derruba esse site |
| `www` é um `CNAME` que segue a raiz | Segue a raiz no que acontecer com ela |
| Subdomínios `n8n`, `easypanel`, `evolutionapi`, `wahaapi` apontam para um VPS (`165.227.29.107`) | Não se mexe neles |
| **`contato@repsclub.com.br` já existe**, ativa, com 8 mensagens | **Passo da caixa de e-mail: já feito.** Não precisa criar nada |
| `MX`, `SPF`, `DKIM` (3 registros) e `DMARC` já configurados | Entrega de e-mail vai funcionar bem assim que o SMTP for ligado |

## A decisão que vem antes de tudo

O app precisa de um endereço, e há dois caminhos:

**A) `app.repsclub.com.br`** — recomendado. Registro **novo**, não toca em nada
do que existe. O site atual continua no ar em `repsclub.com.br`, e o app do
Reps Club ganha um endereço próprio. Risco zero.

**B) `repsclub.com.br` (a raiz)** — o app passa a atender o domínio principal, e
**o site que está lá hoje sai do ar**. Só faz sentido se aquele site for
descartável ou se for justamente a landing que o app vai substituir.

O resto deste roteiro assume **A**. Para **B**, os passos são os mesmos trocando
o nome do registro — mas confirme antes o que existe em
`/home/u411270671/domains/repsclub.com.br/public_html`.

---

# Parte 1 · O app num endereço do produto

Hoje o app vive em `tatografa.vercel.app`. Funciona, mas o aluno que recebe o
link no WhatsApp vê "vercel.app".

**Nada no código precisa mudar.** O app descobre sozinho em que endereço está.

## 1.1 Na Vercel — só você consegue fazer

Eu tenho acesso à sua Vercel nesta sessão, mas **a ferramenta de adicionar
domínio a um projeto não existe** no que me foi disponibilizado. Só dá para
comprar domínio novo, o que não é o caso. Então este passo é seu:

1. Abra o projeto do Reps Club na Vercel.
2. **Settings → Domains**.
3. Digite **`app.repsclub.com.br`** e clique em **Add**.
4. A Vercel vai mostrar o registro de DNS a criar. Para subdomínio costuma ser
   um `CNAME` apontando para `cname.vercel-dns.com`.
5. **Me mande o que apareceu na tela** — ou só diga que adicionou.

## 1.2 O DNS — eu faço

Tenho acesso de escrita ao DNS da sua Hostinger. Assim que você terminar o 1.1,
eu crio o registro. É um comando, e leva segundos.

**Não fiz antes de você adicionar o domínio na Vercel de propósito:** um
registro apontando para lá antes disso faz a Vercel responder erro 404, e aí
`app.repsclub.com.br` fica no ar mostrando página de erro.

Se preferir fazer você mesmo: **Domínios → repsclub.com.br → Zona DNS**, criar
o `CNAME` com nome `app` e o valor que a Vercel deu.

> **Não mexa nos registros `MX`, `SPF`, `DKIM` nem `DMARC`.** São eles que fazem
> seu e-mail funcionar, e a Parte 2 depende deles.

## 1.3 Avisar o Supabase do endereço novo — só você consegue

O MCP do Supabase não expõe configuração de autenticação, então não consigo
fazer daqui.

1. Supabase → projeto **reps-club-dev** → **Authentication → URL Configuration**.
2. **Site URL:** `https://app.repsclub.com.br`
3. Em **Redirect URLs**, deixe as duas (a antiga não atrapalha):
   - `https://app.repsclub.com.br/**`
   - `https://tatografa.vercel.app/**`
4. Salvar.

Sem isso, os links de e-mail levam para o endereço antigo.

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

## 2.1 A caixa — **já existe, nada a fazer**

Fui conferir na sua Hostinger: `contato@repsclub.com.br` está **ativa desde
25/11/2025**, com envio SMTP habilitado e 8 mensagens na caixa.

É esse endereço que já está escrito na política de privacidade do app, como
canal para pedido de exclusão e de cópia de dados. Ele existe de verdade.

**Você vai precisar da senha dela** no passo 2.3. Se não lembrar, dá para
trocar em **E-mails → contato@repsclub.com.br → Alterar senha** — mas trocar
quebra qualquer coisa que já use essa caixa, então prefira procurar a senha
antes.

> Não troquei a senha por você de propósito: há mensagens nessa caixa e ela
> pode estar configurada em outro lugar.

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

1. Abra `app.repsclub.com.br/recuperar` (ou o endereço da Vercel, se ainda não
   apontou o domínio).
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

# Resumo — quem faz o quê

| # | O quê | Quem | Situação |
|---|---|---|---|
| 1 | Adicionar `app.repsclub.com.br` na Vercel | **Otávio** | a ferramenta de domínio não existe na Vercel MCP |
| 2 | Criar o `CNAME` no DNS | **eu** | tenho acesso de escrita; espero o passo 1 |
| 3 | Site URL e Redirect URLs no Supabase | **Otávio** | MCP do Supabase não expõe config de auth |
| 4 | Caixa `contato@repsclub.com.br` | — | **já existe**, ativa desde nov/2025 |
| 5 | Preencher o SMTP no Supabase | **Otávio** | mesmo motivo do 3, e eu não tenho a senha da caixa |
| 6 | Testar `/recuperar` com e-mail de fora | **Otávio** | depende de 1 a 5 |

Os passos que dependem de mim são rápidos. Me avise quando o 1 estiver feito.
