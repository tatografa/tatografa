# M4-04 · Acessibilidade: teclado, leitor de tela e contraste

**Etiqueta:** `pleno`

**Objetivo:** o produto funciona para quem navega por teclado e para quem usa leitor de
tela. Hoje há partes boas e partes não conferidas.

**Milestone:** M4 · **Brief:** `docs/plan/M4-brief.md`

**Checkpoint técnico:** nenhum.

## Critérios de aceite

- [ ] Toda tela navegável só por teclado, com **foco sempre visível**
- [ ] Diálogos prendem o foco e devolvem ao elemento que os abriu; Esc fecha
- [ ] Contraste AA em texto e em componente, nos **dois temas** (o escuro da execução é o
      mais arriscado)
- [ ] Alvo de toque ≥ 44px em tudo que se toca no app do aluno — com a exceção já
      declarada e justificada das faixas do gráfico (M2-04)
- [ ] Formulário: `label` ligada, erro anunciado, campo inválido marcado
- [ ] O gráfico de progresso continua legível por leitor de tela (o `<title>` com a
      tendência em palavras já existe — conferir que não regrediu)
- [ ] `prefers-reduced-motion` respeitado no timer e nas transições
- [ ] Teste real com leitor de tela (VoiceOver no iOS), não só auditoria automática

## Delta técnico

- **Auditoria automática não basta.** Lighthouse passa em tela que um leitor de tela não
  consegue operar. O critério é o fluxo completo: convite → onboarding → treino →
  histórico, todo por teclado e depois todo por leitor de tela.
- Os pontos que já foram pensados e devem ser confirmados, não refeitos: `aria-current`
  na navegação, `role="status"` no contador de pendentes, `aria-pressed` nos filtros,
  `role="img"` + `<title>` no gráfico, `noValidate` com erro em português.
- O tema escuro da execução usa `--color-dark-muted: #4a4a4a` sobre `#0a0a0a` em séries
  ainda não feitas. Conferir se passa AA — é texto pequeno.

## Fora do escopo

- Suporte a mais de um idioma.
- Alto contraste como preferência configurável.
