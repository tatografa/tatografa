# 04 · Design tokens

Valores extraídos dos protótipos. Defina como tokens semânticos no Tailwind e **não use hex
solto nos componentes**.

## Cores

### Marca e ação
| Token | Hex | Uso |
|---|---|---|
| `brand` | `#FF2A2A` | Ação primária, destaque, série ativa, progresso |
| `brand-hover` | `#c92323` | Hover de link e botão |
| `brand-soft` | `#fff3f3` | Fundo de opção selecionada |
| `brand-tint` | `rgba(255,42,42,.08)` | Fundo da série ativa no tema escuro |

O painel do personal e a landing usam `#F23030` como primário. **Unifique em `#FF2A2A`** ao
implementar — a diferença é acidente do protótipo, não intenção de design.

### Tema claro (app do aluno, painel)
| Token | Hex | Uso |
|---|---|---|
| `ink` | `#0a0a0a` | Texto primário, superfícies escuras |
| `text-2` | `#54544f` | Texto secundário |
| `text-3` | `#6e6e69` | Corpo de apoio |
| `text-4` | `#84847f` | Metadados |
| `text-5` | `#9a9a95` | Labels, placeholder |
| `surface` | `#ffffff` | Cards, inputs |
| `bg` | `#F4F4F2` | Fundo de tela do app |
| `bg-sunken` | `#ededea` | Input desabilitado/preenchido |
| `border` | `#e2e2de` | Borda padrão |
| `border-soft` | `#e7e7e2` | Borda leve, divisórias |
| `border-strong` | `#d8d8d2` | Separadores verticais |

### Tema escuro (execução do treino, splash, boas-vindas)
| Token | Hex | Uso |
|---|---|---|
| `dark-bg` | `#0a0a0a` | Fundo |
| `dark-surface` | `#161616` | Card de série |
| `dark-surface-2` | `#141414` | Bottom sheet |
| `dark-elev` | `#232323` | Botão de stepper, trilha de progresso |
| `dark-border` | `#2a2a2a` | Borda |
| `dark-border-2` | `#3a3a3a` | Borda de botão secundário |
| `dark-text` | `#fafafa` | Texto primário |
| `dark-text-2` | `#e8e8e3` | Texto secundário |
| `dark-muted` | `#4a4a4a` | Série pendente |

### Semânticas
| Token | Hex | Uso |
|---|---|---|
| `success` | `#1f9d57` | Confirmação, critério atendido |
| `success-dark` | `#1f6d45` | Marca de série concluída no tema escuro |
| `warning` | `#c79a13` | Aviso |
| `warning-bg` | `#fdf6e8` | Card de reavaliação disponível |
| `danger` | `#FF2A2A` | Erro (mesmo tom da marca) |
| `danger-bg` | `#FFECEC` | Fundo de mensagem de erro |

## Tipografia

Duas famílias, papéis distintos e não intercambiáveis.

**Archivo** — títulos, corpo, botões, toda a UI.
| Papel | Estilo |
|---|---|
| Título de tela | 800, 22–28px, `letter-spacing: -0.02em`, `line-height: 1.15–1.2` |
| Título de card | 700–800, 15–19px, `-0.01em` |
| Corpo | 400, 13–15px, `line-height: 1.5` |
| Label / ênfase | 500–600, 12–14px |
| Botão | 700, 14–16px |
| Número grande (carga, reps) | 800, 19px |

**JetBrains Mono** — eyebrows, labels de formulário, badges, timers, metadados.
Sempre maiúsculas, 600–800, 9–13px, `letter-spacing: 0.06–0.16em`.
Nunca use mono para corpo de texto.

O painel do personal e a landing usam **Inter**. Ao unificar, mantenha Archivo como família de UI
e Inter apenas se já houver motivo — mas escolher uma só é preferível. Isso muda o que o usuário
vê: **decida com o Otávio.**

Mínimos: 11px para labels em mobile, 14px para corpo. Alvo de toque nunca abaixo de 44×44px.

## Espaçamento

Escala de 4px. Valores recorrentes nos protótipos: 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 28.

| Contexto | Valor |
|---|---|
| Padding lateral de tela (aluno) | 20px |
| Padding lateral de formulário (onboarding) | 28px |
| Padding interno de card | 12–18px |
| Gap entre cards de lista | 8–10px |
| Gap entre seções | 14–18px |

## Raios

| Elemento | Raio |
|---|---|
| Badge / pill | 5–8px |
| Input, card pequeno | 12px |
| Card | 14px |
| Card destacado, série | 16px |
| Bottom sheet | 22px no topo |
| Botão | 12–13px |

## Sombras

| Uso | Valor |
|---|---|
| Botão primário elevado | `0 8px 20px rgba(255,42,42,.4)` |
| CTA da landing/login | `0 10px 22px rgba(242,48,48,.28)` |
| Ícone de sucesso | `0 12px 40px rgba(255,42,42,.4)` |
| Toast | `0 12px 30px rgba(0,0,0,.25)` |

Sombra é exceção, não padrão. A maior parte dos cards não tem sombra — separação vem de borda
`1–1.5px` ou de fundo.

## Transições

150ms para cor e fundo. Botão de CTA sobe 1px no hover (`translateY(-1px)`).
Nada de animação acima de 250ms na UI.

## Componentes base a construir primeiro

```
Button        primary | secondary | ghost | danger    ·  sm | md | lg
Input         text | email | password | number        ·  com label mono e erro
Card          surface, borda opcional, borda de destaque em brand
Badge         neutro (fundo #f2f2ef) | brand | sucesso
Stepper       – valor +  · usado para carga e reps na execução
ProgressBar   trilha + preenchimento em brand
BottomSheet   ancorado embaixo, raio no topo, overlay rgba(10,10,10,.6)
Toast         pill escuro, centralizado embaixo, ~2,2s
BottomNav     4 abas fixas, respeita safe-area
Sidebar       painel do personal, colapsável
EmptyState    ícone, título, texto, ação
```

O arquivo `prototipos/BottomNav.tsx` já é React real e pode ser aproveitado — ajuste os nomes de
token ao tema final.
