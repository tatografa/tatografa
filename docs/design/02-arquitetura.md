# 02 · Arquitetura

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Estilo | Tailwind CSS |
| Banco | Postgres no Supabase |
| Autenticação | Supabase Auth (magic link para aluno, senha para personal) |
| Storage de imagens | Supabase Storage |
| Gráficos | Recharts (ou similar leve — decisão do agente) |
| Ícones | lucide-react |
| Hospedagem | Vercel (plano gratuito) |

Um único projeto Next.js serve as duas interfaces. Mesmo domínio, rotas separadas, layouts
separados. Não são dois apps.

Os limites dos planos gratuitos (Supabase e Vercel) são folgados para 50 alunos. O ponto de
atenção é o storage de fotos: comprima no cliente antes do upload (ver seção Fotos).

## Rotas

```
/                          landing page (pública)
/entrar                    login do personal (e-mail + senha)
/entrar/verificacao        segundo fator, se houver
/recuperar                 recuperação de senha do personal
/convite/[token]           onboarding do aluno a partir do convite
/acesso                    solicitar link mágico (aluno)

/app                       app do aluno (mobile-first)
  /app                     home: próximo treino, streak, macrotreino
  /app/treinos             lista de treinos do macrotreino ativo
  /app/treinos/[id]        detalhe do treino (lista de exercícios)
  /app/executar/[id]       execução ao vivo
  /app/executar/[id]/fim   conclusão, PRs, foto
  /app/feed                feed
  /app/feed/[postId]       post e comentários
  /app/progresso           planilha e gráficos
  /app/perfil              perfil do aluno
  /app/reavaliacao         reavaliação física

/painel                    painel do personal (desktop)
  /painel                  dashboard
  /painel/alunos           lista de alunos
  /painel/alunos/[id]      perfil do aluno
  /painel/treinos          treinos e editor
  /painel/exercicios       catálogo de exercícios
  /painel/agenda           agenda de sessões
  /painel/social           moderação do feed
  /painel/reavaliacoes     reavaliações
  /painel/configuracoes    configurações da conta
```

Middleware do Next protege `/app/*` (exige sessão de aluno) e `/painel/*` (exige sessão de
personal). Redirecione papel errado para a área correta em vez de mostrar erro.

## Estrutura de pastas sugerida

```
app/
  (marketing)/page.tsx
  (auth)/entrar/…
  (aluno)/app/…            layout mobile, bottom nav
  (personal)/painel/…      layout desktop, sidebar
components/
  ui/                      botão, input, card, sheet, dialog — base do design system
  aluno/                   componentes só do app do aluno
  personal/                componentes só do painel
lib/
  supabase/                clientes browser e server
  queries/                 funções de acesso a dados, tipadas
  domain/                  regras de negócio puras (cálculo de PR, volume, streak)
types/
  database.ts              tipos gerados do schema
```

Regra: **regras de negócio ficam em `lib/domain/`, não em componentes.** Cálculo de recorde
pessoal, volume total, sequência de dias — tudo função pura, testável sem banco.

## Autenticação

**Personal:** e-mail e senha via Supabase Auth. Ao criar conta, cria também a linha em `trainers`.

**Aluno:** duas portas de entrada.
- *Primeiro acesso:* o personal envia convite. O aluno recebe um e-mail com link para
  `/convite/[token]`. O token é de uso único, expira em 7 dias, e está ligado à linha em
  `invites`. Ao abrir, o aluno completa o perfil e a sessão é criada.
- *Acessos seguintes:* o aluno digita o e-mail em `/acesso` e recebe um link mágico. Sessão longa
  (o aluno não deve precisar entrar de novo a cada semana).

Motivo do link mágico: o aluno usa o app na academia, no meio do treino. Senha esquecida ali é
abandono garantido.

## PWA

- `manifest.json` com nome, ícones e `display: standalone`.
- Service worker mínimo: cachear o shell do app e os assets estáticos. **Não** tente sincronização
  offline de treinos na v1 — está fora do escopo.
- `viewport-fit=cover` e respeito ao `safe-area-inset-bottom` na bottom nav.
- Banner de "adicionar à tela de início" no primeiro acesso do aluno, dispensável.

## Fotos

O aluno tira foto do treino e envia fotos de reavaliação. Regras:

- Redimensione e comprima **no cliente** antes do upload: lado maior 1280px, JPEG/WebP com
  qualidade ~0.8. Uma foto de celular de 4MB vira ~200KB.
- Bucket privado no Supabase Storage. Nada de URL pública direta.
- Sirva por URL assinada de curta duração.
- Caminho: `posts/{studentId}/{postId}.webp` e `reavaliacoes/{studentId}/{assessmentId}/{slot}.webp`.

Fotos de reavaliação são dados sensíveis (corpo do aluno). Só o aluno e o personal dele acessam.
Nunca aparecem no feed automaticamente.

## Estado no cliente

- Dados do servidor: componentes server do Next onde possível; para telas interativas, um cliente
  de dados com cache (React Query ou equivalente — decisão do agente).
- **Execução do treino é a exceção.** É a tela mais sensível do app: o aluno está no meio da série,
  a internet da academia é ruim. Mantenha o estado da sessão em memória e em `localStorage`,
  persistindo a cada série confirmada, e sincronize com o banco de forma otimista. Se a rede
  falhar, o aluno não pode perder o registro. Recupere a sessão em andamento ao reabrir o app.
- Timer de descanso: baseado em timestamp, não em contador de intervalo, para sobreviver ao
  celular bloquear a tela.

## Deploy

- Vercel conectado ao repositório. Preview por branch, produção na `main`.
- Variáveis: URL e chaves do Supabase. Chave de serviço só no servidor, nunca no cliente.
- Ambientes: um projeto Supabase de desenvolvimento e um de produção. Não teste com dados reais
  dos personais do piloto.
