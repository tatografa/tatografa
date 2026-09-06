# Como colocar o Reps Club no ar para testar

> Para o Otávio, clique a clique. O objetivo é **abrir o app no seu celular**, porque é lá
> que o aluno treina — rodar no computador não testa a tela que importa.
>
> São 15 minutos, uma vez só. Depois disso, todo commit vira uma atualização automática.

---

## Antes de começar: o que já está pronto

- ✅ **O banco.** As 16 migrations estão aplicadas no projeto `reps-club-dev`. Você não
  precisa rodar nada.
- ✅ **O catálogo** de 117 exercícios está lá.
- ✅ **O código** está na branch `claude/reps-club-fase-0-aebdup`, com build limpo.

Falta só publicar.

---

## Passo 1 · Criar o projeto na Vercel (5 min)

1. Vá em **[vercel.com](https://vercel.com)** e entre com a sua conta do **GitHub**
   (o botão "Continue with GitHub"). Não precisa cartão; o plano gratuito serve.
2. Na tela inicial, clique em **Add New… → Project**.
3. A Vercel lista seus repositórios. Encontre **`tatografa/tatografa`** e clique em
   **Import**.
   - Se ele não aparecer, clique em **Adjust GitHub App Permissions** e libere o
     repositório.
4. Na tela de configuração, **não mexa** em Framework, Build Command nem Output
   Directory — a Vercel reconhece Next.js sozinha.
5. Antes de clicar em Deploy, abra a seção **Environment Variables** e adicione as três
   abaixo (Name → Value, uma de cada vez):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ygrlqrrguwhqqufcdbyb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_xz-zWCmNMBeCd2fFWSembw_wBKg7-G7` |
| `NEXT_PUBLIC_SITE_URL` | deixe **vazia por enquanto** — o passo 3 preenche |

> Essas duas chaves podem aparecer no navegador sem problema: quem protege o dado é o
> RLS do banco, não elas. A chave que daria acesso total **não existe** neste projeto,
> de propósito.

6. Clique em **Deploy** e espere (~2 minutos).

---

## Passo 2 · Anotar o endereço

Terminado o deploy, a Vercel mostra o endereço do projeto — algo como
`https://tatografa.vercel.app` ou `https://tatografa-xxxx.vercel.app`.

**Copie esse endereço.** Ele é usado nos dois passos seguintes.

> ⚠️ A Vercel publica a branch **principal** do repositório. Se a página abrir e parecer
> antiga, é porque o nosso trabalho está na branch `claude/reps-club-fase-0-aebdup`. Nesse
> caso: **Project Settings → Git → Production Branch** → troque para essa branch → e em
> **Deployments**, clique nos três pontinhos do último deploy → **Redeploy**.

---

## Passo 3 · Preencher a variável que faltou

1. Na Vercel: **Project Settings → Environment Variables**.
2. Edite `NEXT_PUBLIC_SITE_URL` e coloque o endereço do passo 2, **sem barra no final**.
   Ex.: `https://tatografa.vercel.app`
3. Vá em **Deployments**, três pontinhos do último → **Redeploy**.

> Por que isso importa: é esse valor que monta os links dos e-mails de confirmação e do
> acesso do aluno. Sem ele, o link do e-mail aponta para o lugar errado e a pessoa cai
> fora do app.

---

## Passo 4 · Autorizar o endereço no Supabase (2 min)

O Supabase só aceita mandar o usuário de volta para endereços que você autorizou.

1. Abra o **[painel do Supabase](https://supabase.com/dashboard)** → projeto
   **reps-club-dev**.
2. Menu lateral: **Authentication → URL Configuration**.
3. Em **Site URL**, coloque o endereço do passo 2.
4. Em **Redirect URLs**, clique em **Add URL** e adicione:
   - `https://SEU-ENDERECO.vercel.app/**`
   - `http://localhost:3000/**` (para quando você quiser rodar no computador também)
5. **Save**.

---

## Passo 5 · Abrir no celular

Abra o endereço no navegador do celular. Você deve ver a tela inicial do Reps Club.

**Instale como app** (é o que deixa a experiência parecida com um app de verdade):
- **iPhone/Safari:** botão de compartilhar → *Adicionar à Tela de Início*
- **Android/Chrome:** menu ⋮ → *Adicionar à tela inicial*

> O PWA de verdade (ícone, funcionamento offline) é o M4. Por enquanto isso só cria um
> atalho — mas já tira a barra do navegador, que é o que atrapalha na academia.

---

## Passo 6 · Criar as duas contas

O teste precisa de **um personal (você) e um aluno**.

### A conta de personal
1. No **computador**, abra o endereço → **Criar conta de personal**.
2. Use um e-mail que você acesse. Você vai receber um e-mail de confirmação.

> **Se o e-mail não chegar:** o plano gratuito do Supabase manda pouquíssimos e-mails por
> hora, e isso é esperado. **Me avise que eu confirmo a sua conta direto no banco** — é um
> comando só, e você entra normalmente com a senha que escolheu.

3. Confirmado, entre no painel.

### A conta de aluno
1. No painel, clique em **Convidar aluno**. Use um **segundo e-mail** (pode ser outro seu).
2. O app te dá um **link copiável** — não manda e-mail, de propósito.
3. Abra esse link **no celular** (mande para você mesmo pelo WhatsApp). O aluno cria a
   senha ali mesmo, sem esperar e-mail nenhum.

> Deixe o **personal no computador** e o **aluno no celular**. Se você entrar com as duas
> contas no mesmo navegador, uma derruba a outra.

---

## Passo 7 · Rodar o teste

Agora sim: `docs/plan/M2-validacao.md`, do começo. Ele leva pela montagem do treino,
execução na academia e conferência do progresso e do painel.

---

## Se algo travar

Me diga **em que passo** e **o que apareceu na tela** (screenshot ajuda). As falhas mais
prováveis, e o que cada uma quer dizer:

| O que você vê | O que é |
|---|---|
| Deploy falha na Vercel com erro de build | Me mande o log; provavelmente falta uma variável |
| Página abre em branco ou com erro de "Variável de ambiente ausente" | Alguma das três variáveis não foi salva, ou faltou o redeploy |
| Clico no link do e-mail e caio fora do app | Passo 3 ou 4 incompletos |
| E-mail de confirmação não chega | Limite do plano gratuito — me avise que eu confirmo no banco |
| "Invalid login credentials" ao entrar | A conta existe mas não foi confirmada. Mesma coisa: me avise |
