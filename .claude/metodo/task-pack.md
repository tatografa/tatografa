# Pacote de contexto — template do corpo de card

> Usado pelo Tech Lead como corpo de TODO card em `docs/cards/`. Leia também o Brief do Milestone
> indicado abaixo. Não repita aqui o que o brief já traz; se faltar contexto que muda a solução,
> devolva o card ao Tech Lead.

---

**Objetivo:** <o porquê de negócio, 1–2 frases>

**Milestone:** <M1 — nome do milestone>

**Brief comum:** `docs/plan/<M1>-brief.md`

**Checkpoint técnico:** <nenhum | antes do próximo dependente: motivo de risco/contrato>

**Critérios de aceite:**
- [ ] <condição verificável 1>
- [ ] <condição verificável 2>
- [ ] <se card de backend consumido por frontend:> handoff escrito em `docs/handoffs/<feature>.md`

**Arquivos:**
- `<caminho/exato/arquivo1>` — <o que criar/alterar nele>
- `<caminho/exato/arquivo2>` — <o que criar/alterar nele>

**Delta técnico:**
- <somente contrato, exceção ou convenção que este card acrescenta/altera>
- <se card de UI:> Tokens: `<caminho>` · Componentes: `<caminho>` · Storybook: `<URL>`

**Dependências:**
- <card(s) que precisam estar Done antes>
- <se card de frontend:> leitura obrigatória do handoff `docs/handoffs/<feature>.md`

**Como verificar:**
- Testes: `<comando>` · Lint: `<comando>`
- Evidência para a entrega do milestone: <screenshot da tela X / request→response do endpoint Y>

**Fora do escopo:**
- <o que explicitamente NÃO fazer neste card>
