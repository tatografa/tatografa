# M4-05 · Termos de uso e privacidade

**Etiqueta:** `junior`

**Objetivo:** o app coleta peso, altura e data de nascimento — dado de saúde, sob LGPD — e
hoje pede aceite de termos que não existem.

**Milestone:** M4 · **Brief:** `docs/plan/M4-brief.md`

**Checkpoint técnico:** nenhum técnico. **O texto é do Otávio**, não do dev.

## Critérios de aceite

- [ ] `/termos` e `/privacidade`, públicas, sem exigir login
- [ ] O checkbox do onboarding do aluno **linka para elas** — hoje ele pede aceite de algo
      que não se pode ler
- [ ] A política diz, em português claro: que dado é coletado, para quê, quem vê (o
      personal vê o treino e o histórico do aluno), por quanto tempo fica, e como pedir
      exclusão
- [ ] Rodapé com os dois links nas telas públicas
- [ ] A data do aceite fica registrada — hoje o aceite é só um `literal("on")` no zod, e
      não se guarda nada
- [ ] `npm run build && npm run typecheck && npm run lint` limpos

## Delta técnico

- **O aceite não é gravado hoje.** `app/convite/[token]/actions.ts` valida
  `termos: z.literal("on")` e descarta. Provar aceite depois exige coluna com data e
  versão do texto aceito — migration pequena, decisão de schema.
- Páginas estáticas simples, no route group `(marketing)`.
- O aluno vê o próprio dado no `/app/perfil`; a exclusão pode ser por pedido ao personal
  no começo, desde que a política diga isso.

## Bloqueio — precisa do Otávio

**O texto.** O dev não redige política de privacidade. O Otávio decide quem responde pelo
dado (ele? o personal? uma empresa?) e escreve ou manda escrever.

## Fora do escopo

- Exclusão de conta pela interface.
- Exportação de dado pelo aluno.
- Consentimento granular por finalidade.
