import type { Idioma } from "@/lib/domain/idioma";

/** Histórico (lista e sessão) e progresso (planilha e gráfico). */
const pt = {
  historico: {
    voltar: "← Treinos",
    titulo: "Histórico",
    registrados: { um: "1 treino registrado", outros: "{n} treinos registrados" },
    limite: "Mostrando os {n} treinos mais recentes.",
    vazioTitulo: "Seu histórico começa no primeiro treino",
    vazioTexto:
      "Assim que você terminar um treino, ele aparece aqui com a carga e as repetições de cada série.",
    verTreinos: "Ver meus treinos",
    seriesDe: "{feitas} de {total} séries",
    incompleto: "Incompleto",
  },
  sessao: {
    resumo: "Resumo da sessão",
    duracao: "Duração",
    series: "Séries",
    volume: "Volume",
    semVolume:
      "Exercício de peso corporal não entra no volume — somar repetições a quilos daria um número sem significado.",
    observacao: "Observação do treino",
    semSeries: "Esta sessão não tem séries registradas.",
    prescrito: "Prescrito: {sets} × {reps}",
    pulada: "Série pulada",
    naoRegistrada: "Não registrada",
  },
  progresso: {
    titulo: "Progresso",
    comHistorico: { um: "1 exercício com histórico", outros: "{n} exercícios com histórico" },
    comoVer: "Como ver o progresso",
    planilha: "Planilha",
    grafico: "Gráfico",
    treinos: { um: "1 treino", outros: "{n} treinos" },
    maisRecentes: "As {n} mais recentes. O resto está no gráfico.",
    serie: "Série {n}",
    exercicios: "← Exercícios",
    teto: "Mostrando os {n} treinos mais recentes deste exercício.",
    vazioTitulo: "Sua evolução começa no primeiro treino",
    vazioTexto:
      "Depois de dois treinos do mesmo exercício já dá para ver a linha subir — ou não, e aí você sabe o que ajustar.",
    verTreinos: "Ver meus treinos",
    intervalo: "Intervalo do gráfico",
    sessoes: "{n} sessões",
    total: "Total",
    semCarga:
      "Este exercício é de peso corporal: não há carga para desenhar. As repetições de cada série estão na planilha.",
    min: "mín",
    max: "máx",
    seriesDe: "Séries de {data}",
    escolha: "Escolha um ponto para ver as séries daquele dia.",
    tendencia: {
      semCarga: "{nome}: sem carga registrada.",
      um: "{nome}: {carga} num treino registrado.",
      igual: "{nome}: {carga} em {treinos}, sem variação.",
      alta: "{nome}: de {de} a {ate} em {treinos}, alta de {diferenca}.",
      queda: "{nome}: de {de} a {ate} em {treinos}, queda de {diferenca}.",
    },
  },
};

export type TextosDoHistorico = typeof pt;

const en: TextosDoHistorico = {
  historico: {
    voltar: "← Workouts",
    titulo: "History",
    registrados: { um: "1 workout logged", outros: "{n} workouts logged" },
    limite: "Showing the {n} most recent workouts.",
    vazioTitulo: "Your history starts with your first workout",
    vazioTexto:
      "As soon as you finish a workout, it shows up here with the load and reps of every set.",
    verTreinos: "See my workouts",
    seriesDe: "{feitas} of {total} sets",
    incompleto: "Incomplete",
  },
  sessao: {
    resumo: "Session summary",
    duracao: "Duration",
    series: "Sets",
    volume: "Volume",
    semVolume:
      "Bodyweight exercises don't count toward volume — adding reps to kilos would give a meaningless number.",
    observacao: "Workout note",
    semSeries: "This session has no sets logged.",
    prescrito: "Prescribed: {sets} × {reps}",
    pulada: "Set skipped",
    naoRegistrada: "Not logged",
  },
  progresso: {
    titulo: "Progress",
    comHistorico: { um: "1 exercise with history", outros: "{n} exercises with history" },
    comoVer: "How to view progress",
    planilha: "Table",
    grafico: "Chart",
    treinos: { um: "1 workout", outros: "{n} workouts" },
    maisRecentes: "The {n} most recent. The rest is in the chart.",
    serie: "Set {n}",
    exercicios: "← Exercises",
    teto: "Showing the {n} most recent workouts for this exercise.",
    vazioTitulo: "Your progress starts with your first workout",
    vazioTexto:
      "After two workouts with the same exercise you can already see the line go up — or not, and then you know what to adjust.",
    verTreinos: "See my workouts",
    intervalo: "Chart range",
    sessoes: "{n} sessions",
    total: "All",
    semCarga:
      "This is a bodyweight exercise: there's no load to chart. The reps of each set are in the table.",
    min: "min",
    max: "max",
    seriesDe: "Sets on {data}",
    escolha: "Pick a point to see that day's sets.",
    tendencia: {
      semCarga: "{nome}: no load logged.",
      um: "{nome}: {carga} in one logged workout.",
      igual: "{nome}: {carga} over {treinos}, no change.",
      alta: "{nome}: from {de} to {ate} over {treinos}, up {diferenca}.",
      queda: "{nome}: from {de} to {ate} over {treinos}, down {diferenca}.",
    },
  },
};

const es: TextosDoHistorico = {
  historico: {
    voltar: "← Entrenamientos",
    titulo: "Historial",
    registrados: {
      um: "1 entrenamiento registrado",
      outros: "{n} entrenamientos registrados",
    },
    limite: "Mostrando los {n} entrenamientos más recientes.",
    vazioTitulo: "Tu historial empieza en el primer entrenamiento",
    vazioTexto:
      "En cuanto termines un entrenamiento, aparece aquí con la carga y las repeticiones de cada serie.",
    verTreinos: "Ver mis entrenamientos",
    seriesDe: "{feitas} de {total} series",
    incompleto: "Incompleto",
  },
  sessao: {
    resumo: "Resumen de la sesión",
    duracao: "Duración",
    series: "Series",
    volume: "Volumen",
    semVolume:
      "Los ejercicios de peso corporal no entran en el volumen — sumar repeticiones a kilos daría un número sin sentido.",
    observacao: "Nota del entrenamiento",
    semSeries: "Esta sesión no tiene series registradas.",
    prescrito: "Prescrito: {sets} × {reps}",
    pulada: "Serie saltada",
    naoRegistrada: "No registrada",
  },
  progresso: {
    titulo: "Progreso",
    comHistorico: { um: "1 ejercicio con historial", outros: "{n} ejercicios con historial" },
    comoVer: "Cómo ver el progreso",
    planilha: "Tabla",
    grafico: "Gráfico",
    treinos: { um: "1 entrenamiento", outros: "{n} entrenamientos" },
    maisRecentes: "Las {n} más recientes. El resto está en el gráfico.",
    serie: "Serie {n}",
    exercicios: "← Ejercicios",
    teto: "Mostrando los {n} entrenamientos más recientes de este ejercicio.",
    vazioTitulo: "Tu evolución empieza en el primer entrenamiento",
    vazioTexto:
      "Después de dos entrenamientos del mismo ejercicio ya se ve si la línea sube — o no, y entonces sabes qué ajustar.",
    verTreinos: "Ver mis entrenamientos",
    intervalo: "Rango del gráfico",
    sessoes: "{n} sesiones",
    total: "Todo",
    semCarga:
      "Este ejercicio es de peso corporal: no hay carga para dibujar. Las repeticiones de cada serie están en la tabla.",
    min: "mín",
    max: "máx",
    seriesDe: "Series del {data}",
    escolha: "Elige un punto para ver las series de ese día.",
    tendencia: {
      semCarga: "{nome}: sin carga registrada.",
      um: "{nome}: {carga} en un entrenamiento registrado.",
      igual: "{nome}: {carga} en {treinos}, sin variación.",
      alta: "{nome}: de {de} a {ate} en {treinos}, subida de {diferenca}.",
      queda: "{nome}: de {de} a {ate} en {treinos}, bajada de {diferenca}.",
    },
  },
};

export const HISTORICO: Record<Idioma, TextosDoHistorico> = { pt, en, es };
