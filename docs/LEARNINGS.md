# Aprendizados — Reps Club

> Memória evolutiva dos agentes deste produto. Todo dev lê antes de codar e, se descobrir
> algo não óbvio, relata uma linha no handoff do card. A curadoria acontece ao fim do
> milestone: lição recorrente vira regra nas Convenções do `CLAUDE.md` e sai daqui;
> entrada obsoleta é apagada. Manter ≤ ~40 linhas.
>
> Formato: `- [AAAA-MM-DD] [área] <erro/descoberta> → <regra a seguir>`

## Backend

- [2026-08-23] [rls] Policy de `students` que consulta `students` se auto-invoca → helper
  `security definer` com `search_path` fixo quebra a recursão.
- [2026-08-23] [rls] O PostgREST publica como RPC toda função de `public`, inclusive os
  helpers de autorização → helper vive no schema `private`, que não é publicado.
- [2026-08-23] [supabase] `signUp` com confirmação de e-mail ligada não devolve sessão, e
  sem sessão o insert do cliente esbarra no RLS → criar a linha de perfil por gatilho em
  `auth.users`, atômico com a criação do usuário.
- [2026-08-31] [postgres] `select ... for update` no gatilho serializa duas tentativas com
  o mesmo token de convite → a segunda só vê a linha já consumida e é recusada.
- [2026-08-31] [seguranca] Convite lido sem sessão não precisa de chave de serviço → função
  `security definer` estreita (um token exato, três campos) tem raio de dano muito menor
  que uma chave que ignora o RLS inteiro.
- [2026-09-01] [rls] Policy de escrita que confere só o dono da linha
  (`trainer_id = auth.uid()`) deixa passar `student_id` alheio → conferir também o
  relacionamento, com o helper de travessia. Foi assim que um personal qualquer conseguia
  prescrever para aluno de outro (migration 0007).
- [2026-09-02] [rls] **O mesmo defeito apareceu três vezes** (0007, 0009, 0010), sempre
  achado por um ataque de cada vez e corrigido só na porta que o ataque usou → ao corrigir
  uma policy por esse padrão, varrer no mesmo commit **todas** as policies de escrita da
  tabela e das vizinhas da cadeia. Em especial: se a policy de `insert` confere o
  relacionamento, a de `update` também precisa — senão o atacante insere legítimo e depois
  troca a fk, e a checagem seguinte valida contra o dado já adulterado.
- [2026-09-02] [rls] Policy de `insert` com `or id = auth.uid()` numa tabela de vínculo
  deixa qualquer autenticado se auto-inserir na carteira alheia, contornando convite,
  token e gatilho → quem nasce por gatilho `security definer` não precisa de policy
  permissiva; o `with check` pode exigir só o dono do relacionamento.
- [2026-09-01] [postgres] Helper de RLS `stable` não enxerga a linha inserida pelo mesmo
  statement → gravar cadeia `mesocycles → workouts` em statements separados; um
  `with ... insert` encadeado é recusado.
- [2026-09-01] [postgres] Contar linhas trazendo-as para a memória trunca em silêncio
  quando o `db-max-rows` do PostgREST corta a página → agregar no banco. Contagem menor
  que chega a zero vira "sem histórico" e some com a confirmação que protegia o dado.
- [2026-08-31] [supabase] Projeto do plano gratuito **pausa sozinho** após ~7 dias sem uso,
  e a primeira query depois disso falha com timeout ou "relation does not exist" → conferir
  `status` do projeto antes de concluir que o schema sumiu.

## Frontend

- [2026-08-23] [next16] Este não é o Next.js do treinamento: `proxy.ts` no lugar de
  `middleware.ts`, `params`/`searchParams`/`cookies` assíncronos → ler
  `node_modules/next/dist/docs/` antes de escrever, não confiar na memória.
- [2026-08-23] [i18n] `required` e `type="email"` disparam validação nativa em inglês →
  `noValidate` no formulário e validação por zod na Server Action, em português.
- [2026-08-31] [zod4] A v4 trocou `errorMap` e `invalid_type_error` por `error` → mensagem
  customizada de enum, literal e coerce usa a chave nova.
- [2026-08-31] [react] `setState` dentro de `useEffect` para reagir a resultado de action
  reprova no lint e causa render em cascata → ajustar durante a renderização comparando
  com o resultado anterior (`if (estado !== ultimoEstado)`).
- [2026-08-31] [ux] Formulário multi-etapa com as etapas montadas juntas esconde o erro de
  servidor dentro da etapa oculta → validar no cliente antes de avançar e, se o erro vier
  do servidor mesmo assim, voltar para a etapa que o contém.
- [2026-08-31] [ux] Falha de rede tratada no mesmo ramo de "não encontrado" faz um convite
  válido parecer expirado → separar erro técnico de ausência de dado, com texto diferente.

## Infra / processo

- [2026-08-23] [rede] O host do Supabase é bloqueado pela política de egresso deste
  ambiente remoto (403 no CONNECT) → lógica de banco se valida por SQL via MCP; interface
  que precisa de dado se confere com props fixas numa rota descartável.
- [2026-08-31] [testes] Regex de teste procurando palavra que a aplicação não usa gera
  falso negativo → conferir a mensagem real antes de afirmar que há bug no código.
- [2026-08-31] [npm] `npm install <pkg>` para uso só de teste suja `package.json` →
  `npm install --no-save` quando a dependência não deve ser commitada.
- [2026-09-01] [html] Campo desabilitado **não é enviado** no formulário → controle que
  carrega dado obrigatório precisa de hidden separado. Passou pelo SQL e pelo build, e
  quebrou a edição inteira: o erro aparecia num campo que o usuário não podia mexer.
- [2026-09-01] [verificacao] Prova por SQL cobre a lógica e deixa o caminho da tela sem
  prova → card que altera registro existente só fecha depois de exercitar a edição pelo
  navegador, não só o insert por SQL.
- [2026-09-01] [next16] Apagar uma rota deixa o `.next/dev/types/validator.ts` com import
  da rota que sumiu, e o `typecheck` falha em arquivo gerado, não no seu código →
  `rm -rf .next` depois de apagar a rota descartável. **A ordem importa:** `PageProps<"/rota">`
  também é tipo gerado, então rodar `typecheck` logo após o `rm -rf` acusa
  "Cannot find name 'PageProps'". O certo é `rm -rf .next && npm run build && npm run typecheck`.
- [2026-09-01] [verificacao] Fixture inserida por SQL contorna a validação da Server
  Action, então o screenshot pode mostrar dado que o app não consegue produzir → conferir
  se a fixture passaria pelo formulário antes de tratá-la como prova.
- [2026-09-01] [offline] **Ramo destrutivo não pode ser decidido por medida que não enxerga
  a fila local.** As três perdas do M1-05 tinham a mesma forma: contagem no servidor,
  `removeItem` de chave compartilhada e "o lote foi aceito" — três jeitos de responder
  "não há nada aqui" sobre um lugar onde não se olhou. Antes de apagar, consultar o que o
  aparelho ainda guarda.
- [2026-09-01] [offline] Chave global de `localStorage` para dado por sessão é condição de
  apagamento, não economia → chavear por id (`prefixo:<sessionId>`) e nunca remover chave
  que não seja a da sessão montada. Celular emprestado na academia é caso real.
- [2026-09-02] [coerencia] Número derivado do mesmo dado por duas queries diferentes
  diverge na tela: a lista do histórico somava todas as linhas da prescrição e o detalhe
  pulava a órfã, mostrando "12 de 16" e "12/13" para a mesma sessão → denominador e
  formato saem de **uma função só** em `lib/domain/`; card que exibe número que outra tela
  já exibe cita a função existente no delta técnico.
- [2026-09-02] [fuso] Regra de calendário derivada com o relógio do processo vira um dia a
  mais na Vercel (UTC): `semanaAtual` mostrava "Semana 2 de 8" às 21h do sétimo dia →
  `lib/domain/fuso.ts` centraliza `FUSO` e `diaLocal`. Cuidado: coluna `date` chega como
  `"2026-09-01"` e `new Date()` a lê como meia-noite UTC — converter por fuso joga o início
  para o dia anterior; tratar o texto como dia de calendário.
- [2026-09-04] [modelagem] **Chave de escrita não é chave de leitura histórica.**
  `session_sets` aponta para `workout_exercise_id`, que é uma linha de prescrição — há uma
  por treino e outra a cada programa novo. Agrupar por ela para responder "com quanto eu
  fiz supino da última vez?" dá uma tela plausível e errada: a pílula sumiria toda vez que
  o aluno trocasse de macrotreino. A identidade do exercício é `(exercise_source,
  exercise_id)`. Antes de agrupar histórico, perguntar de que o número é "por": por linha
  gravada ou por coisa do mundo.
- [2026-09-04] [dominio] Duas leituras do mesmo histórico que se confundem à toa:
  "a última vez" (última sessão concluída) e "o recorde" (maior de todos). Trocar uma pela
  outra não estoura em lugar nenhum — a pílula passa a nunca descer depois de um dia ruim,
  e todo treino mais pesado que o anterior vira "recorde" → funções separadas, nomeadas
  pela pergunta que respondem, e teste que fixa o caso em que as duas discordam.
- [2026-09-04] [dados] Zero registrado não é zero real. Carga 0 kg é o stepper deixado
  onde abriu, e admiti-la como marca anterior faria a sessão seguinte anunciar
  "recorde: 0 kg → 20 kg" → valor de fronteira que o formulário produz sozinho não vira
  linha de base de comparação.
- [2026-09-05] [dataviz] Ordem de lista e ordem de eixo não são a mesma decisão. O doc pede
  "mais recente primeiro" e isso é verdade para as listas; aplicar ao eixo do gráfico
  inverteria o significado de uma linha subindo → num gráfico de evolução o eixo é sempre
  cronológico, e a regra de ordenação da lista fica na lista.
- [2026-09-05] [a11y] Alvo de toque de 44px em ponto de gráfico é promessa que a geometria
  não cumpre: com doze pontos numa tela de 390px cabem 32px cada, e círculos grandes o
  bastante se sobrepõem. → faixa vertical de altura inteira, uma por ponto, como **botão
  HTML sobreposto** ao SVG: não se sobrepõe nunca, dá foco de teclado e nome acessível de
  graça, e o filtro padrão (6 sessões) é escolhido para a faixa passar dos 44px.
- [2026-09-05] [verificacao] O MCP do Supabase funciona neste ambiente mesmo com o host
  bloqueado para o app: dá para criar fixture, impersonar `authenticated` com
  `request.jwt.claims` e provar RLS de verdade. Prova de leitura só vale rodando a consulta
  **sem** o filtro que a aplicação aplica — é o que um cliente forjado faz, e é o RLS que
  tem que barrar. Limpar a fixture depois: o banco de dev estava vazio e volta a ficar.
