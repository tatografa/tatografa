# Handoff · Execução do treino

> Contrato de dado que a execução **grava**, para as telas que vão **ler** esse
> histórico (progresso, PRs, painel do personal — M2). Escrito no card
> **M1-05 — Execução do treino, série por série**.
> Mudou aqui? Avise os cards dependentes antes de mergear.

## Onde está

| O quê | Arquivo |
|---|---|
| Estado puro da execução (série ativa, progresso, pular) | `lib/domain/execucao.ts` |
| Leitura de sessão e séries | `lib/queries/execucao.ts` |
| Gravar série, concluir, iniciar, encerrar pendente | `app/(aluno)/app/executar/actions.ts` |
| Fila local com reenvio | `app/(aluno)/app/executar/[id]/usar-fila-de-series.ts` |
| Tela de execução | `app/(aluno)/app/executar/[id]/execucao.tsx` |
| Resumo da conclusão (componente puro) | `components/aluno/resumo-do-treino.tsx` |
| Referência histórica e recordes (puro) | `lib/domain/recordes.ts` |
| Leitura das séries anteriores | `lib/queries/recordes.ts` |

## O que fica gravado

Uma execução é **uma linha em `workout_sessions`** mais **N linhas em
`session_sets`**.

```ts
// lib/domain/execucao.ts
type SerieDaExecucao = {
  workout_exercise_id: string;  // workout_exercises.id — NUNCA o id do catálogo
  set_number: number;           // 1..sets, posição na prescrição, não contagem
  load_kg: number | null;       // null em exercício de peso corporal
  reps: number | null;          // null em série pulada
  skipped: boolean;
};
```

Pontos que o próximo card precisa saber:

1. **`set_number` é a posição prescrita, não um contador.** A série 3 é a
   terceira da prescrição mesmo que a 2 tenha sido pulada. Contar linhas para
   descobrir "em que série o aluno está" dá o número errado.
2. **Série pulada existe no banco**, com `skipped = true`, `load_kg` e `reps`
   nulos. `volumeDaSessao` já a ignora. Quem for contar "séries feitas" precisa
   filtrar `skipped`, senão um treino abandonado no meio conta como completo.
3. **`load_kg` é `numeric` no Postgres e chega como *string* no cliente JS.**
   `seriesDaSessao` já converte com `Number()`. Query nova precisa fazer o
   mesmo, ou o volume vira concatenação de texto.
4. **Sessão sem `finished_at` é a sessão em andamento**, e só existe uma por
   aluno (índice único parcial). Toda leitura de histórico deve excluí-la, ou o
   treino de hoje aparece como concluído com duração nula.
5. **`duration_seconds` é gravado no fechamento**, calculado com o relógio do
   servidor contra `started_at`. Não recalcular a partir de `completed_at` das
   séries: o aluno pode ter deixado o app aberto.
6. **Sessão encerrada por conflito também tem `finished_at` e
   `duration_seconds`.** Um treino incompleto no histórico é indistinguível de
   um completo pelas colunas da sessão; o que separa os dois é o número de
   séries contra a prescrição.

## Decisões deste card

### A fila local é a fonte durante o treino

Confirmar uma série atualiza a tela na hora e enfileira a gravação; a rede é
assíncrona. A fila é gravada no `localStorage` **antes** de qualquer tentativa
de envio, e reenviada por tempo (com espera crescente até 15s), ao voltar a ter
internet e ao a aba voltar a ficar visível. O envio é em lote — uma série no
caso normal, a fila inteira na reconexão, pelo mesmo caminho de código.

A gravação é `upsert` em `(session_id, workout_exercise_id, set_number)`, então
reenvio, duplo toque e correção passam pelo mesmo caminho sem virar duplicata.

**Limite declarado e aceito pelo PM:** sem service worker (Fase 4), um aluno
que treine offline e limpe os dados do navegador antes de recuperar sinal perde
o que estava na fila. Por isso o contador "N séries a enviar" fica visível no
topo o tempo todo — o limite só é aceitável enquanto não for silencioso.
Também por isso o botão de concluir só fecha a sessão com a fila vazia.

### Recusa é por série, não por lote

`registrarSeries` grava o que pode e devolve `recusadas: string[]` com as
séries que não pertencem mais à prescrição (o personal removeu o exercício
enquanto o aluno treinava). Recusar o lote inteiro por causa de uma linha
inválida travava oito séries legítimas na fila para sempre, com a mensagem
"assim que a internet voltar" e a internet boa.

`permanente: true` sobrou só para o payload inteiro inválido — caso que a
interface deste app não produz. Ele nunca impede a conclusão do treino.

### A gravação aceita sessão já encerrada

Desde que seja do próprio aluno. Recusar fechava a porta na cara do dado que a
fila existe para salvar: uma sessão encerrada com série ainda guardada no
aparelho nunca mais receberia essa série. O volume é calculado na leitura,
então o resumo se corrige sozinho; só `duration_seconds` fica como registrado.

### Uma chave de `localStorage` por sessão

`repsclub.execucao.fila.v1:<sessionId>`, e nunca uma chave global. Com chave
única, entrar numa segunda sessão apagava a fila da primeira — o efeito de
persistência roda na montagem com a fila recém-inicializada, e o `removeItem`
levava junto o que era da outra. O caso real é celular emprestado na academia.

### Contagem do servidor não é evidência de sessão vazia

A tela de sessão pendente é cliente por causa disto. Um treino feito sem sinal
tem zero linhas no banco e N na fila do aparelho; decidir por `series === 0`
**deletava a linha de `workout_sessions`** — o treino inteiro — enquanto a tela
dizia "ainda não tem nenhuma série". Agora o componente envia o que o aparelho
guarda daquela sessão antes de oferecer qualquer coisa, e enquanto houver série
guardada a ação de encerrar não existe na tela.

### Concluir nunca descarta o que está na fila

`esvaziar()` devolve "a fila ficou vazia", não "o lote que enviei foi aceito" —
a diferença é uma série confirmada entre um `await` e outro. `descartar()`
recusa quando a fila não está vazia, e os botões que enfileiram (o ✓ e "pular
exercício") ficam travados enquanto a conclusão viaja.

### Sessão pendente: encerrar, nunca apagar

Decisão do PM. Sessão de outro treino com séries registradas é **encerrada e
salva** como treino incompleto; só a sessão com zero séries é descartada de
verdade. Série que o aluno executou não é apagada nem com confirmação.

A regra agora também é do banco, não só do código: `workout_sessions_delete`
exige `finished_at is null` (migration 0010). Antes, um DELETE direto na sessão
concluída levava as séries por cascata — a decisão do PM valia no app e não
valia na API.

### Correção de série já feita

Tocar numa série concluída reabre os steppers com os valores atuais. O toque
acidental não altera nada: mudar o registro exige um segundo toque deliberado
no ✓, e há um ✕ para sair. A correção passa pela mesma fila e pelo mesmo
upsert, então não abre caminho novo de perda. Correção não inicia descanso.

### Timer por timestamp

O descanso guarda **o instante em que termina** e deriva o restante do relógio.
Um contador que decrementa para quando o celular bloqueia a tela — e é
exatamente aí que o aluno precisa do valor certo. Sem service worker não há
alarme sonoro com a tela apagada: o app mostra o tempo certo quando o aluno
olha (Fase 4).

## Referência histórica e recordes (M2-03)

O que a execução grava passou a ser lido de volta pela própria execução — a
pílula "última vez: 60 kg × 10" — e pela conclusão — o recorde batido. Quem for
escrever o progresso (M2-04) reusa isto em vez de recalcular.

### A identidade do exercício não é `workout_exercise_id`

É o par `(exercise_source, exercise_id)`, montado por `chaveDoExercicio`.
`session_sets` guarda `workout_exercise_id`, que é **uma linha de prescrição**:
o mesmo supino tem uma linha por treino e outra a cada programa novo. Agrupar
por ela responderia "a última vez que fiz supino nesta linha", e o aluno que
trocou de macrotreino veria a pílula sumir no dia seguinte.

`lib/domain/recordes.ts` trata a chave como texto opaco de propósito — quem a
monta é a camada de dados, que conhece as duas colunas.

### `UltimaVez` carrega duas coisas, e não é redundância

`carga`/`reps` são a **série mais pesada** daquela sessão — o que a pílula
mostra, porque resume o dia numa linha. `porSerie` é a sessão inteira, série por
série — o que abre o stepper no peso certo.

São duas perguntas diferentes: "como foi da última vez?" e "com quanto eu começo
esta série?". Quem rampa (50, 60, 60, 65) precisa da segunda, e foi decisão do
Otávio que a série 2 abra em 60 e não na série 1 de hoje. A chave de `porSerie`
é o `set_number` **em texto**: o objeto atravessa a fronteira servidor→cliente
como JSON, onde chave numérica vira string de qualquer jeito.

### As duas leituras são diferentes, e é fácil confundi-las

| Pergunta | Função | O que devolve |
|---|---|---|
| "Com quanto eu saí da última vez?" | `ultimaVezPorExercicio` | a série mais pesada da **última sessão concluída** com aquele exercício |
| "Qual é o meu melhor de todos?" | `recordePorExercicio` | a **maior carga já levantada**, em qualquer sessão |

Trocar uma pela outra dá uma tela plausível e errada: a pílula mostraria o
recorde (e nunca desceria depois de um dia ruim), e o recorde mostraria o
último treino (e todo dia mais pesado que o anterior viraria "recorde").

### Recortes que não são detalhe

1. **Sessão em andamento nunca entra** (`finished_at` não nulo). Contá-la faria
   a pílula mostrar a série que o aluno acabou de confirmar.
2. **A conclusão pede o recorde `exceto` a sessão que fechou.** Sem isso a marca
   nova é o próprio teto e nenhum recorde aparece nunca.
3. **Série pulada não conta** para referência nem para recorde.
4. **Carga nula é peso corporal** — a referência cai nas repetições, e recorde
   de carga não existe ali. **Carga zero é o stepper onde abriu** e também não
   vira marca: senão a sessão seguinte anuncia "0 kg → 20 kg".
5. **Estreia não é recorde.** Sem marca anterior não há o que superar.
6. **`load_kg` chega como string.** `Number()` antes de comparar, senão `"9"`
   fica maior que `"80"`.
7. **Uma consulta paginada para o treino inteiro**, com `range` até a página vir
   curta — o corte do PostgREST é silencioso, e a página perdida esconderia
   justamente o dia mais pesado.

### Recorde é a maior carga, e isso contraria o doc 03

Decisão do PM, registrada no `CLAUDE.md` e repetida aqui para não ser
"corrigida" por engano: o doc 03 pede "maior carga com pelo menos as reps
alvo"; aqui é a maior carga, ponto. Limite aceito: premia quem tira repetição
para pôr peso. Mudar isso é mudar `cargaDeRecorde`, e só ela.

## Segurança verificada (SQL, com dois personais e dois alunos)

| Caso | Resultado |
|---|---|
| Segunda sessão aberta para o mesmo aluno | recusada pelo índice único parcial (23505) |
| Mesma série enviada duas vezes | 1 linha, valores atualizados (upsert) |
| Aluno gravando série em sessão de outro aluno | recusado (42501) |
| Aluno alterando/apagando série de sessão alheia | 0 linhas |
| Aluno lendo séries de sessão alheia | 0 linhas |
| Personal gravando/alterando série do aluno | recusado (42501) / 0 linhas |
| Personal lendo séries do próprio aluno | vê tudo |
| Aluno fechando ou apagando sessão alheia | 0 linhas |
| Aluno gravando série na própria sessão já fechada | permitido (é o que salva a série tardia) |

**Furo encontrado e corrigido aqui** (migration `0009`): `session_sets_write`
exigia só `private.owns_session(session_id)` — conferia de quem era a sessão,
mas não de quem era a linha da prescrição. Um aluno podia gravar séries na
própria sessão apontando para o `workout_exercises.id` do treino de outro
aluno, inflando a contagem de `series_por_exercicio` no histórico de um
estranho. Provado por SQL antes da migration (gravou 1 linha) e recusado depois
(42501). É a mesma lição da `0007`: **dono da linha não é dono do
relacionamento**.

## Lições que valem para os próximos cards

- **O render de hidratação roda no cliente, com `window` disponível.** Testar
  `typeof window` não protege nada: ler `localStorage` ali desenha o que não
  está no HTML do servidor, e — pior — um efeito de persistência disparado
  nesse render **apaga** o que estava guardado. O que separa os dois momentos é
  `useSyncExternalStore` (`lib/usar-montado.ts`), usado para trocar a `key` do
  componente e só então ler o armazenamento.
- **O lint recusa `setState` dentro de efeito**, então hidratar estado com
  `useEffect` não é opção — inicializador de `useState` no componente remontado
  resolve os dois problemas de uma vez.
- **`numeric` do Postgres chega como string** no cliente JS. Somar sem
  converter concatena.
- **O RLS deixa o aluno gravar série na própria sessão já fechada** —
  `owns_session` não olha `finished_at`. Quem barra é a Server Action, que só
  aceita sessão em andamento. Não é furo entre usuários, mas quem escrever
  outra rota de escrita precisa repetir a checagem.
- **Alvo de toque estoura o layout antes de estourar o design.** Dois steppers
  de 44px numa linha de grid vazaram os 390px de um celular comum; o defeito só
  apareceu no screenshot em viewport real, não no build.
- **`rm -rf .next` derruba o `typecheck`** porque os tipos de rota são gerados:
  rodar `npm run build` (ou `npx next typegen`) antes do `typecheck`.
- **Chave de armazenamento compartilhada entre sessões é apagamento disfarçado.**
  O efeito de persistência roda na montagem com o estado ainda vazio; se a
  chave for global, ele limpa o que era de outra sessão. Chavear por id.
- **Contagem do servidor não prova ausência quando existe fila local.** Todo
  ramo destrutivo decidido por `count === 0` precisa consultar antes o que o
  aparelho ainda guarda.
- **`await` no meio de uma conclusão é uma janela de escrita.** Ou se trava o
  que enfileira, ou se reconfere depois — de preferência os dois. Ler estado de
  React entre `await`s dá o valor de um render antigo: a verdade tem que estar
  numa `ref` atualizada de forma síncrona.
- **Recusar um lote inteiro por causa de um item transforma erro de um em
  prejuízo de todos.** Validação em lote devolve quais itens recusou.

## Fora do escopo (confirmado com o PM)

Foto do treino e post no feed (M3); bottom sheet do menu ⋮ (M2); service worker,
sincronização offline completa e alarme de fim de descanso (Fase 4).

~~Recordes pessoais e referência "última vez"~~ — entregues no M2-03, seção
acima.
