# Handoff · Prescrição de treino

> Contrato de leitura que as telas do aluno (M1-04 execução, M1-05 histórico)
> consomem. Escrito no card **M1-03 — Editor de treino no painel**.
> Mudou aqui? Avise os dois cards dependentes antes de mergear.

## Onde está

| O quê | Arquivo |
|---|---|
| Leitura do treino com a prescrição | `lib/queries/treinos.ts` → `lerTreino(id)` |
| Lista de treinos por aluno | `lib/queries/treinos.ts` → `listarTreinosPorAluno()` |
| Macrotreino e rotação | `docs/handoffs/macrotreino.md` (M2-01) |
| Busca e resolução de exercícios | `lib/queries/exercicios.ts` |
| Formato de repetições e ordem | `lib/domain/prescricao.ts` |
| Rótulos em português dos enums | `lib/rotulos.ts` |

## O que `lerTreino(id)` devolve

```ts
type TreinoCompleto = {
  id: string;
  label: string;        // "A", "B"…
  name: string;         // "Peito e tríceps"
  notes: string | null; // observação do personal, aparece no topo do treino
  position: number;
  aluno: { id: string; name: string };
  macrotreino: { id: string; name: string; total_weeks: number; started_at: string };
  exercicios: ExercicioPrescrito[];  // já ordenados por `position`
  total_series: number;              // de lib/domain/treino.ts
  duracao_min: number;               // idem
};

type ExercicioPrescrito = {
  id: string;            // workout_exercises.id — É A CHAVE DE session_sets
  position: number;      // 0, 1, 2… sem buracos, renumerado na leitura
  sets: number;
  reps_target: string;   // "12" ou "8-10" — TEXTO, nunca número
  rest_seconds: number;
  technique: string | null;
  notes: string | null;
  exercicio: {
    id: string;
    source: "catalog" | "custom";
    name: string;
    muscle_group: Enums<"muscle_group">;
    equipment: Enums<"equipment">;
    is_bodyweight: boolean;   // true = a tela de execução NÃO pede carga
    is_unilateral: boolean;
    default_rest_seconds: number;
  };
  series_registradas: number;  // séries já executadas nesta linha
};
```

`lerTreino` devolve `null` tanto para id inexistente quanto para treino de outro
personal — os dois casos são "não existe" para quem está olhando. Distinguir na
resposta contaria a um estranho que aquele id existe.

## O que a tela de execução precisa saber

1. **`exercicio.id` (do catálogo) não é a chave da execução.** `session_sets`
   referencia `ExercicioPrescrito.id`, que é `workout_exercises.id`. Gravar série
   com o id do catálogo quebra a fk.
2. **`reps_target` é texto e pode ser faixa.** Mostrar como veio ("8-10"); o que o
   aluno realizou vai em `session_sets.reps`, que é número.
3. **`is_bodyweight` muda a tela:** exercício de peso corporal não pede carga, e
   `volumeDaSessao` já ignora carga nula.
4. **`position` é a ordem, e é índice confiável.** Vem sempre de 0 em diante e sem
   buracos: a gravação renumera, e a leitura renumera de novo sobre as linhas que
   sobraram. Pode indexar por ela ("exercício 3 de 5"). Não reordene por outro
   critério.
5. **Uma linha órfã é pulada, não quebra a tela.** `exercise_id` não tem fk; se um
   exercício próprio for apagado, `lerTreino` omite a linha em vez de estourar — e
   é por isso que a posição é renumerada na leitura, senão a linha pulada deixaria
   um buraco (0, 2) para quem conta em cima dela.

## Decisões deste card

### ~~Macrotreino: o personal nomeia no primeiro treino~~ (substituída no M2-01)

> **Obsoleta.** No M1 o editor pedia o nome do programa e o total de semanas ao
> salvar o primeiro treino do aluno — muleta para o schema, enquanto não havia
> tela de macrotreino. O card **M2-01** substituiu isso por gestão de verdade:
> o programa é criado em `/painel/macrotreinos` e chega ao editor pela URL, que
> não pergunta mais aluno nem programa. `macrotreinosAtivos()` deixou de
> existir. O contrato novo está em `docs/handoffs/macrotreino.md`.

### Salvamento por Server Action única

O editor não salva sozinho. O rascunho vive no navegador e vai inteiro para
`salvarTreino` no clique de Salvar. O personal monta o treino sentado no
computador; salvar a cada tecla multiplicaria idas ao banco e deixaria treino
meio-salvo se ele desistir no meio.

### A edição preserva as linhas que continuam

`session_sets` referencia `workout_exercises.id` com `on delete cascade`. Apagar a
prescrição e recriar a cada salvamento seria mais simples e **levaria o histórico
do aluno junto**. Então a gravação:

1. lê os ids atuais do treino;
2. faz `upsert` das linhas que ficam, com o mesmo id e a posição renumerada;
3. só depois apaga as que o personal removeu de fato.

Um id que não pertence ao treino é tratado como linha nova — sem isso, uma
requisição forjada poderia sequestrar a linha de outro treino do mesmo personal.
Na interface, remover exercício com `series_registradas > 0` pede confirmação
explícita, dizendo quantas séries somem.

### Busca do catálogo

`buscarExercicios({ termo, grupo, equipamento })` roda no servidor, filtra grupo e
equipamento no banco, compara o nome **sem acento e sem caixa** em memória, e
devolve no máximo 30 resultados, ordenados por nome. Catálogo e exercícios
próprios do personal saem na mesma lista, cada um com sua `source`.

Por que o nome é comparado em memória: `ilike` do Postgres ignora maiúscula mas
não ignora acento, e o personal digita "triceps". Com 117 exercícios de catálogo
a lista filtrada cabe folgada numa página. Quando o catálogo crescer, isso vira um
índice com `unaccent` no banco — a assinatura da função não muda.

## Segurança verificada (SQL, com dois personais)

- Personal de outra carteira **não lê** aluno, macrotreino, treino nem prescrição
  alheios (todas as contagens deram 0).
- Personal de outra carteira **não escreve**: update, delete e insert em treino e
  prescrição alheios afetam 0 linhas ou são recusados pelo RLS.
- **Furo encontrado e corrigido aqui** (migration `0007`): `mesocycles_write`
  exigia só `trainer_id = auth.uid()`, sem conferir de quem era o aluno. Um
  personal qualquer podia criar um macrotreino com o próprio `trainer_id` e o
  `student_id` de um aluno alheio e, a partir dele, empurrar treinos que o aluno
  via na tela. A policy passou a exigir também `private.trainer_of(student_id)`.

## Lições que valem para os próximos cards

- **Não crie macrotreino e treino no mesmo statement SQL.** `can_write_mesocycle`
  é `stable`: dentro de um `with ... insert`, ela não enxerga o macrotreino que a
  própria consulta acabou de inserir, e o insert do treino é recusado pelo RLS.
  A Server Action faz em statements separados de propósito.
- **Dono da linha não é o mesmo que dono do relacionamento.** Uma policy que só
  confere o `trainer_id` da própria linha deixa passar `student_id` alheio.
- **Campo desabilitado não entra no `FormData`.** O select de aluno fica travado na
  edição; sem um `hidden` com o mesmo valor, a Server Action recebia `alunoId`
  vazio e reprovava num campo que o personal não consegue mexer.
- **`z.string().uuid()` do zod v4 é estrito.** Ele confere os bits de versão e
  variante do RFC, então uuid "bonito" de fixture (`1111...`) é recusado enquanto
  o `gen_random_uuid()` do Postgres (v4) passa. Ao montar dado de teste para as
  telas do aluno, gere uuid de verdade.
- **Contar em memória o que o banco pode agregar esconde truncamento.** O corte de
  página do PostgREST não avisa; a contagem só volta menor.
