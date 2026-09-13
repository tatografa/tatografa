# Ligar o domínio e o e-mail — passo a passo

> **Revisado em 13/09/2026, depois de inspecionar o DNS e a Hostinger de verdade.**
> A primeira versão deste roteiro mandava sobrescrever o registro `A` do domínio.
> **Isso teria derrubado um site que está no ar.** Corrigido abaixo.

## Situação em 13/09/2026

**Decisão do Otávio:** o app fica na raiz, `repsclub.com.br`. O site que estava
lá desde nov/2025 sai do ar — é exatamente o site que este app substitui.

### Parte 1 — feita

| Passo | Situação |
|---|---|
| Domínio adicionado no projeto da Vercel | feito pelo Otávio (não consigo confirmar — meu token da Vercel dá 403 no escopo do time) |
| `A @ → 76.76.21.21` (Vercel) | **feito por mim**, substituiu `147.93.38.127` |
| `www` | já era `CNAME` para a raiz; segue junto, sem mexer |
| Propagação | **já resolvendo**: raiz e `www` devolvem `76.76.21.21` |

**O que foi preservado, conferido registro a registro depois da escrita:**
`MX`, `SPF`, `DMARC`, os três `DKIM`, `autodiscover`, `autoconfig` — e os
subdomínios do VPS (`n8n`, `easypanel`, `evolutionapi`, `wahaapi`,
`165.227.29.107`). A Hostinger guarda snapshot da zona a cada alteração, então
há caminho de volta.

> A escrita usou `overwrite` por **nome + tipo**, não por zona inteira: só o par
> `@`/`A` foi substituído. Foi por isso que o e-mail não caiu junto.

### O que conferir agora — 30 segundos, e só você consegue

Abra **`repsclub.com.br`** no navegador. O ambiente onde eu rodo bloqueia
acesso externo (mesma política que barra o Supabase), então essa checagem é sua.

| O que aparecer | O que significa | O que fazer |
|---|---|---|
| A landing do Reps Club | funcionou | seguir para a Parte 2 |
| Erro da Vercel (404 / `DEPLOYMENT_NOT_FOUND`) | o DNS chegou, mas o domínio **não** está no projeto | Vercel → Settings → Domains → adicionar `repsclub.com.br` |
| Aviso de certificado | a Vercel ainda está emitindo o SSL | esperar alguns minutos |
| O site antigo | cache do seu navegador ou do provedor | aba anônima, ou esperar |

### Parte 1.3 — Supabase, e só você consegue

O MCP do Supabase não expõe configuração de autenticação.

1. Supabase → **reps-club-dev** → **Authentication → URL Configuration**.
2. **Site URL:** `https://repsclub.com.br`
3. **Redirect URLs** (deixe as duas):
   - `https://repsclub.com.br/**`
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
| 1 | Adicionar `repsclub.com.br` na Vercel | **Otávio** | feito (não consigo confirmar: 403 no escopo do time) |
| 2 | Apontar o DNS para a Vercel | **eu** | ✅ **feito** em 13/09, já resolvendo |
| 3 | Site URL e Redirect URLs no Supabase | **Otávio** | MCP do Supabase não expõe config de auth |
| 4 | Caixa `contato@repsclub.com.br` | — | **já existe**, ativa desde nov/2025 |
| 5 | Preencher o SMTP no Supabase | **Otávio** | mesmo motivo do 3, e eu não tenho a senha da caixa |
| 6 | Testar `/recuperar` com e-mail de fora | **Otávio** | depende de 1 a 5 |

Só sobram passos de Supabase. Abra `repsclub.com.br` e me diga o que apareceu.
