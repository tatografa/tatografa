# M4-03 · Quando dá errado, o app diz o que fazer

**Etiqueta:** `pleno`

**Objetivo:** varredura de todas as telas. Nenhum estado vazio parecendo erro, nenhum erro
sem saída, nenhuma tela em branco enquanto carrega.

**Milestone:** M4 · **Brief:** `docs/plan/M4-brief.md`

**Checkpoint técnico:** nenhum.

## Critérios de aceite

- [ ] Inventário escrito de todas as rotas, com o estado vazio, de erro e de carregamento
      de cada uma — o que existe hoje e o que falta
- [ ] `error.tsx` e `not-found.tsx` nas duas áreas, com a identidade do produto e um
      caminho de volta que funciona
- [ ] **Erro de rede é distinguido de "não existe"**: a academia tem internet ruim, e
      "não encontramos seu treino" quando o Wi-Fi caiu é mentira
- [ ] `loading.tsx` onde a espera é perceptível, com esqueleto que tem a forma do conteúdo
- [ ] Nenhum estado vazio que pareça falha — o padrão do projeto é dizer de quem é a
      próxima ação (ver `SemTreino` na home do aluno)
- [ ] Formulário que falha preserva o que o usuário digitou
- [ ] `npm run build && npm run typecheck && npm run lint` limpos

## Delta técnico

- **O projeto já acerta isto em vários lugares** e o card é sobre consistência, não sobre
  inventar: `SemTreino`, `SemHistorico`, `VazioSemAluno`, o vazio do progresso e o do
  filtro de exercícios são a referência de tom.
- **A lição do teste de campo vale aqui:** dado que existe e não aparece é
  indistinguível de dado perdido. Toda tela que esconde algo por regra (sessão em
  andamento fora do histórico, programa arquivado fora da lista) diz onde aquilo foi
  parar.
- Erro de Server Action já tem o padrão `errosPorCampo` + `erro`; o que falta é o erro de
  **leitura**, que hoje sobe como exceção e cai no `error.tsx` que não existe.

## Fora do escopo

- Telemetria e monitoramento de erro em produção (Sentry e afins).
- Retry automático de leitura.
