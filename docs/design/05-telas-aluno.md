# 05 · Telas do aluno (web mobile-first)

Referência: `prototipos/Reps Club - Protótipo Aluno.dc.html` — protótipo navegável com todas as
telas ligadas. Abra e percorra o fluxo antes de implementar.

Moldura: 366px de largura útil, 800px de altura no protótipo. A implementação real é fluida
(mobile-first), com largura máxima de ~440px centralizada em telas maiores.

Toda tela do aluno tem uma barra de status simulada no protótipo (46px, "9:41"). **Não implemente
isso** — é moldura de protótipo.

---

## 1 · Convite e onboarding

### 1.1 Criar acesso (`/convite/[token]`, etapa 1 de 2)
Fundo `bg`. Padding 28px lateral, 18px no topo.

- Eyebrow mono maiúsculo 10px `text-5`: "ETAPA 1 DE 2".
- Barra de progresso: duas faixas 4px, gap 6px, raio 2px. Primeira em `brand`, segunda em `border`.
- Título 800/25px, `-0.02em`: "Quase lá, {primeiro nome}!"
- Corpo 400/14px, `line-height 1.5`, `text-3`: "Defina sua senha para acessar os treinos da
  **{nome do personal}**." — nome do personal em `ink`, peso bold.
- Campo E-mail: preenchido e travado (vem do convite), fundo `bg-sunken`, borda `border-soft`,
  raio 12px, padding 13/15px. À direita, círculo 18px `success` com ✓ branco.
- Campo Senha: fundo `surface`, borda `border`, com botão de mostrar/ocultar.
- Validação em tempo real dos critérios (mínimo 8 caracteres, letra e número): bolinha `success`
  quando atendido, cinza quando pendente.
- Checkbox de aceite dos termos, obrigatório.
- Botão primário largura total, padding 16px, raio 13px, 700/16px: "Continuar".

**Nota de produto:** o aluno entra por link mágico no dia a dia, mas define senha no onboarding
como alternativa de acesso. Se isso se mostrar redundante na implementação, é decisão com impacto
no produto — traga para o Otávio.

### 1.2 Perfil (etapa 2 de 2)
Mesma estrutura, ambas as faixas de progresso em `brand`.

- Título: "Conta pra gente". Corpo: "A {personal} usa esses dados para montar e ajustar seus treinos."
- **Objetivo principal:** grid 2 colunas, gap 9px. Cada opção é um card 13px de padding, raio 12px,
  com ícone e rótulo 600/12px. Selecionado: borda 1.5px `brand`, fundo `brand-soft`, ícone `brand`.
  Não selecionado: borda `border`, fundo `surface`, texto `text-2`.
  Opções: Ganhar massa, Perder gordura, Condicionamento, Saúde.
- Data de nascimento, peso e altura atuais, nível de experiência.
- Botão: "Concluir e entrar".

### 1.3 Boas-vindas
Fundo `dark-bg`, conteúdo centralizado vertical.
- Círculo 88px `brand` com ✓ 800/40px branco, sombra `0 12px 40px rgba(255,42,42,.4)`.
- Título 800/28px `dark-text`: "Tudo pronto, {nome}!"
- Corpo 400/15px `text-5`, máx. 260px: "Sua conta está pronta e conectada à **{personal}**."
- Botão `brand` largura total: "Ver meus treinos".

### 1.4 Link expirado
Mesma estrutura da 1.3 com ícone de alerta, texto explicando a expiração e ação "Pedir novo
convite" (abre WhatsApp do personal ou envia notificação a ele).

---

## 2 · Home (`/app`)

Fundo `bg`. Padding 16px topo, 20px lateral. Bottom nav fixa.

Ordem dos blocos, de cima para baixo:

1. **Cabeçalho:** saudação 800/22px ("Bom dia, {nome}" — varia por horário) + avatar 38px
   circular à direita, clicável para o perfil.
2. **Dois indicadores:** grid 2 colunas, gap 8px. Card `surface`, raio 12px, padding 12/8px,
   centralizado. Valor 800/18px, label mono 9px `text-5` com `letter-spacing 0.06em`.
   "🔥 5 / DIAS SEGUIDOS" e "42 / SESSÕES TOTAIS".
3. **Macrotreino ativo:** card `ink`, raio 16px, padding 16/18px.
   Eyebrow mono 10px `text-4` "MACROTREINO ATIVO" · nome 800/19px `dark-text` · linha
   "Semana 3 de 8 · {personal}" 400/12px `text-5` · barra de progresso 4px, trilha `dark-elev`,
   preenchimento `brand`.
4. **Próximo treino:** card `surface` com borda 1.5px `brand`, raio 16px, padding 18px.
   Eyebrow mono 10px `brand` "SEU PRÓXIMO TREINO" · "Treino B · Costas e Bíceps" 800/19px ·
   "6 exercícios · ~45min" 400/13px `text-3` · botão `brand` largura total "Iniciar treino" ·
   link discreto centralizado "Fazer outro treino" 500/12px `text-5`.
5. **Reavaliação disponível** (condicional): card `warning-bg`, raio 14px, ícone 📅 `warning`,
   título 700/13px, subtítulo 400/11px, e pill com borda `ink` "Fazer agora".

### Bottom nav
64px de altura, fundo `surface`, borda superior `border-soft`, 4 abas distribuídas.
Ícone 16px + rótulo 600/9px. Ativa em `brand`, inativas em `text-5`.
Abas: **Treinar · Progresso · Feed · Perfil**.
Na implementação real: alvo de toque ≥44px e `safe-area-inset-bottom`.

---

## 3 · Lista de treinos (`/app/treinos`)

- Cabeçalho com seta ← e nome do macrotreino 800/21px; abaixo, alinhado ao título,
  "Semana 3 de 8 · {personal}" 400/13px `text-4`.
- Lista de cards, gap 10px, `surface`, raio 14px, padding 15/16px.
  - Nome do treino 700/15px.
  - Subtítulo "5 exercícios · ~38min" 400/12px `text-4`.
  - **Concluído:** círculo 22px `success` com ✓.
  - **Sugerido:** borda 1.5px `brand` + badge mono 9px branco sobre `brand`, raio 5px: "SUGERIDO".
  - **Neutro:** borda 1px `border-soft`.
- Rodapé: "Ver histórico completo" 500/12px `text-4`, centralizado.

O treino sugerido é o próximo na rotação que ainda não foi feito nesta semana.

---

## 4 · Detalhe do treino (`/app/treinos/[id]`)

- Cabeçalho: ← + "Treino B" 800/20px com "Costas e Bíceps" 400/12px `text-4` abaixo.
- **Três métricas** em linha, separadas por divisórias verticais 1px × 28px `border-strong`:
  valor 800/19px + label mono 9px. "6 EXERCÍCIOS · ~45min DURAÇÃO · 24 SÉRIES".
- Lista de exercícios: grid `22px 1fr auto`, gap 12px, card `surface` raio 12px padding 12/14px.
  - Número mono 700/12px `text-5`.
  - Nome 600/14px + "{sets} × {reps} · {rest}s descanso" 400/11px `text-4`.
  - Selo de técnica: 600/11px `text-2`, fundo `#f2f2ef`, raio 7px, padding 5/9px.
- Botão fixo no rodapé: "Começar treino".

---

## 5 · Execução (`/app/executar/[id]`) — a tela mais importante

Fundo `dark-bg`. É onde o aluno passa 45 minutos com o celular na mão, suado, entre séries.
Prioridades: alvos grandes, contraste alto, zero navegação desnecessária.

### Topo
- ← à esquerda, ⋮ à direita (abre bottom sheet).
- Centro: "TREINO B" mono 700/12px `dark-text` + "COSTAS E BÍCEPS" mono 500/10px `text-4`.
- Barra de progresso 4px, trilha `dark-elev`, preenchimento `brand`, proporcional a
  exercícios concluídos / total.
- Linha mono 10px `text-4`: "EXERCÍCIO 2 DE 6" à esquerda, cronômetro da sessão à direita.

### Exercício atual
- Nome 800/26px `dark-text`, `-0.02em`.
- "{sets} séries · {reps} reps · {rest}s descanso" 400/13px `text-4`.
- Pill de referência histórica: borda 1px `dark-border`, raio 8px, 500/11px `text-5` —
  "última vez: 60kg × 10". Vem da última `workout_session` com esse exercício.

### Lista de séries
Três estados visuais distintos:

**Ativa** — grid `22px 1fr 1fr 52px`, padding 14/12px, raio 16px, borda 1.5px `brand`,
fundo `brand-tint`.
- Número mono 700/13px `brand`.
- Stepper de carga: – valor + . Botões circulares 26px `dark-elev`, texto 700/15px `dark-text-2`.
  Valor 800/19px `dark-text` com "kg" 400/10px `text-4` ao lado. Incremento de 2,5kg
  (1,25kg com toque longo — opcional).
- Stepper de reps, idêntico, sem unidade.
- Botão de confirmar: círculo 44px `brand`, ✓ 800/18px branco, sombra
  `0 8px 20px rgba(255,42,42,.4)`.
- Exercício de peso corporal: em vez do stepper de carga, texto "peso corporal" 600/13px.

**Concluída** — grid `26px 1fr 1fr 40px`, raio 14px, fundo `dark-surface`, `opacity .5`.
Valores 600/15px `dark-text-2`, marca circular 32px `success-dark` com ✓.

**Pendente** — igual à concluída, sem opacidade, textos em `dark-muted`, círculo 32px apenas
com borda 1.5px `dark-border`.

### Rodapé
Dois botões, gap 10px: "Pular exercício" (borda `dark-border-2`, transparente, flex 1) e
"Próximo exercício →" (fundo `dark-elev`, flex 1.3).

### Timer de descanso
Ao confirmar uma série, inicia contagem regressiva do descanso prescrito. Exibição grande,
opção de pular e de adicionar 30s. **Baseado em timestamp**, não em contador — o celular
bloqueia a tela e o timer precisa continuar correto.

### Bottom sheet do menu (⋮)
Overlay `rgba(10,10,10,.6)`, painel `dark-surface-2`, raio 22px no topo, padding 22px.
Ações: trocar exercício, ver histórico do exercício, adicionar observação, encerrar treino.

**Construído em 17/09/2026, com três das quatro ações.** "Trocar exercício" ficou de fora:
a leitura óbvia (substituir o prescrito por outro do catálogo) esbarra em
`private.serie_no_treino_da_sessao` (migration 0009) e é decisão de produto sobre quem
manda na prescrição, não ajuste de tela. O ⋮ divide o canto direito com o contador de
séries pendentes, que nasceu depois do handoff e não pode ficar atrás de um menu.

---

## 6 · Conclusão do treino (`/app/executar/[id]/fim`)

- Confirmação com resumo: duração real, número de séries, volume total (kg levantados).
- **Recordes pessoais** batidos na sessão, destacados: exercício, carga anterior → nova carga.
  Só aparece se houver PR — não invente celebração vazia.
- Ações: "Tirar foto do treino" e "Concluir sem foto".

## 7 · Foto do treino

Captura via `<input type="file" accept="image/*" capture="environment">` — funciona no navegador
do celular sem app nativo. Pré-visualização, opção de trocar, compressão no cliente antes do
upload.

## 8 · Compositor de post

- Foto no topo, campo de legenda abaixo.
- **Alcance** — seção com eyebrow mono "QUEM VÊ ESSE POST", duas opções em coluna, gap 8px:
  - "Só a {personal}" — ícone 👤 `brand`
  - "Alunos da {personal}" — ícone 🌐 `text-5`
  Selecionada com borda `brand` e fundo `brand-soft`.
- Confirmação antes de publicar quando o alcance for o mais amplo.
- Publicar leva ao feed com o post no topo.

## 9 · Feed (`/app/feed`)

- Cabeçalho com toggle segmentado: fundo `#e7e7e2`, raio 11px, padding 3px.
  Abas "Público" e "Personal". A ativa recebe fundo `surface`.
- Card de post: avatar 34px, nome 700/13px, badge "PERSONAL" mono 9px branco sobre `brand`
  quando o autor é o personal, horário 500/11px `text-5` à direita.
- Foto, legenda, contadores de curtida e comentário.
- Toque no card abre `/app/feed/[postId]` com comentários.

## 10 · Progresso (`/app/progresso`)

Duas visões alternadas por toggle: **Planilha** e **Gráfico**.

### Planilha
Acordeão por exercício. Fechado: nome + última carga. Aberto: tabela com as **3 sessões mais
recentes primeiro**, colunas série / carga / reps.

### Gráfico
- Lista de exercícios; cada card mostra uma prévia do gráfico de evolução.
- Detalhe do exercício: linha de carga máxima por sessão, **de borda a borda** do container,
  datas no eixo X na horizontal, **mais recente primeiro**.
- Filtro de intervalo: 6 sessões / 12 sessões / Total.
- Pontos clicáveis: revelam carga e reps de cada série daquela sessão.

## 11 · Perfil (`/app/perfil`)

- Dados do aluno, objetivo, medidas atuais.
- **Card do personal:** avatar com iniciais 38px fundo `#262626`, nome 700/13px,
  "Seu personal trainer" 400/11px `text-4`, e pill com borda `ink` "📱 WhatsApp" que abre
  conversa direta.
- Acesso à reavaliação e às configurações. Sair da conta.

## 12 · Reavaliação (`/app/reavaliacao`)

- Formulário de medidas + upload de 3 fotos (frente, lado, costas).
- Comparação com a reavaliação anterior: valor anterior → atual, com variação.
- Só disponível quando o personal libera (`assessments.released_at`).
