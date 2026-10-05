import type { Idioma } from "@/lib/domain/idioma";
import type { PeriodoDoSocial } from "@/lib/domain/feed";

/**
 * O feed do painel (`/painel/social`), os controles do post e o que a consulta
 * escreve no lugar de um nome que não chegou.
 *
 * O período vem em duas formas: o rótulo do filtro ("Últimos 7 dias") e o
 * pedaço da frase do vazio ("nos últimos 7 dias"). Em português bastava pôr em
 * minúscula; em inglês e espanhol a preposição muda, então são frases inteiras.
 */
const pt = {
  titulo: "Feed",
  subtitulo: "Todas as publicações dos seus alunos, das mais recentes às mais antigas",
  faixa: "Atividade de todos os alunos",
  publicacoes: { um: "1 publicação", outros: "{n} publicações" },
  semResposta: { um: "1 sem sua resposta", outros: "{n} sem sua resposta" },
  postDe: "Post de {nome}, {dia}",
  filtros: {
    porAluno: "Filtrar por aluno",
    todosOsAlunos: "Todos os alunos",
    porPeriodo: "Filtrar por período",
    periodos: {
      tudo: "Todo o período",
      "7": "Últimos 7 dias",
      "30": "Últimos 30 dias",
      "90": "Últimos 90 dias",
    } satisfies Record<PeriodoDoSocial, string>,
  },
  vazio: {
    nenhumTitulo: "Nenhum aluno publicou ainda",
    nenhumApoio:
      "Quando um aluno registrar um treino com foto, o post aparece aqui — inclusive os marcados para só você ver.",
    alunoTudo: "Este aluno ainda não publicou",
    /** O título quando há aluno e período escolhidos. */
    alunoNoPeriodo: {
      tudo: "",
      "7": "Nada deste aluno nos últimos 7 dias",
      "30": "Nada deste aluno nos últimos 30 dias",
      "90": "Nada deste aluno nos últimos 90 dias",
    } satisfies Record<PeriodoDoSocial, string>,
    tirarFiltro: "Escolha “Todos os alunos” para ver a turma inteira.",
    noPeriodo: {
      tudo: "",
      "7": "Nada publicado nos últimos 7 dias",
      "30": "Nada publicado nos últimos 30 dias",
      "90": "Nada publicado nos últimos 90 dias",
    } satisfies Record<PeriodoDoSocial, string>,
    abrirPeriodo: "Experimente “Todo o período”.",
  },
  controles: {
    curtir: "Curtir",
    descurtir: "Descurtir",
    curtidas: { um: "curtida", outros: "curtidas" },
    adicionar: "Adicionar comentário…",
    responderA: "Responder a {nome}",
    enviarResposta: "Enviar resposta",
    enviar: "Enviar",
  },
  erros: {
    postInvalido: "Post inválido.",
    vazio: "Escreva alguma coisa.",
    longo: "O comentário pode ter até {n} caracteres.",
    falha: "Não conseguimos enviar sua resposta agora.",
  },
  /** O que a consulta escreve quando o dado não chega. */
  dados: {
    aluno: "Aluno",
    exercicioRemovido: "Exercício removido",
    pulado: "pulado",
  },
};

export type TextosDoSocial = typeof pt;

const en: TextosDoSocial = {
  titulo: "Feed",
  subtitulo: "Every post from your clients, newest first",
  faixa: "Activity from all clients",
  publicacoes: { um: "1 post", outros: "{n} posts" },
  semResposta: { um: "1 without your reply", outros: "{n} without your reply" },
  postDe: "Post by {nome}, {dia}",
  filtros: {
    porAluno: "Filter by client",
    todosOsAlunos: "All clients",
    porPeriodo: "Filter by period",
    periodos: {
      tudo: "All time",
      "7": "Last 7 days",
      "30": "Last 30 days",
      "90": "Last 90 days",
    },
  },
  vazio: {
    nenhumTitulo: "No client has posted yet",
    nenhumApoio:
      "When a client logs a workout with a photo, the post shows up here — including the ones marked for your eyes only.",
    alunoTudo: "This client hasn't posted yet",
    alunoNoPeriodo: {
      tudo: "",
      "7": "Nothing from this client in the last 7 days",
      "30": "Nothing from this client in the last 30 days",
      "90": "Nothing from this client in the last 90 days",
    },
    tirarFiltro: "Choose “All clients” to see the whole group.",
    noPeriodo: {
      tudo: "",
      "7": "Nothing posted in the last 7 days",
      "30": "Nothing posted in the last 30 days",
      "90": "Nothing posted in the last 90 days",
    },
    abrirPeriodo: "Try “All time”.",
  },
  controles: {
    curtir: "Like",
    descurtir: "Unlike",
    curtidas: { um: "like", outros: "likes" },
    adicionar: "Add a comment…",
    responderA: "Reply to {nome}",
    enviarResposta: "Send reply",
    enviar: "Send",
  },
  erros: {
    postInvalido: "Invalid post.",
    vazio: "Write something.",
    longo: "The comment can be up to {n} characters.",
    falha: "We couldn't send your reply right now.",
  },
  dados: {
    aluno: "Client",
    exercicioRemovido: "Removed exercise",
    pulado: "skipped",
  },
};

const es: TextosDoSocial = {
  titulo: "Feed",
  subtitulo: "Todas las publicaciones de tus alumnos, de las más recientes a las más antiguas",
  faixa: "Actividad de todos los alumnos",
  publicacoes: { um: "1 publicación", outros: "{n} publicaciones" },
  semResposta: { um: "1 sin tu respuesta", outros: "{n} sin tu respuesta" },
  postDe: "Publicación de {nome}, {dia}",
  filtros: {
    porAluno: "Filtrar por alumno",
    todosOsAlunos: "Todos los alumnos",
    porPeriodo: "Filtrar por período",
    periodos: {
      tudo: "Todo el período",
      "7": "Últimos 7 días",
      "30": "Últimos 30 días",
      "90": "Últimos 90 días",
    },
  },
  vazio: {
    nenhumTitulo: "Ningún alumno publicó todavía",
    nenhumApoio:
      "Cuando un alumno registre un entrenamiento con foto, la publicación aparece aquí — incluidas las marcadas para que solo tú las veas.",
    alunoTudo: "Este alumno todavía no publicó",
    alunoNoPeriodo: {
      tudo: "",
      "7": "Nada de este alumno en los últimos 7 días",
      "30": "Nada de este alumno en los últimos 30 días",
      "90": "Nada de este alumno en los últimos 90 días",
    },
    tirarFiltro: "Elige “Todos los alumnos” para ver todo el grupo.",
    noPeriodo: {
      tudo: "",
      "7": "Nada publicado en los últimos 7 días",
      "30": "Nada publicado en los últimos 30 días",
      "90": "Nada publicado en los últimos 90 días",
    },
    abrirPeriodo: "Prueba con “Todo el período”.",
  },
  controles: {
    curtir: "Me gusta",
    descurtir: "Quitar me gusta",
    curtidas: { um: "me gusta", outros: "me gusta" },
    adicionar: "Agregar comentario…",
    responderA: "Responder a {nome}",
    enviarResposta: "Enviar respuesta",
    enviar: "Enviar",
  },
  erros: {
    postInvalido: "Publicación no válida.",
    vazio: "Escribe algo.",
    longo: "El comentario puede tener hasta {n} caracteres.",
    falha: "No pudimos enviar tu respuesta ahora.",
  },
  dados: {
    aluno: "Alumno",
    exercicioRemovido: "Ejercicio eliminado",
    pulado: "saltado",
  },
};

export const SOCIAL: Record<Idioma, TextosDoSocial> = { pt, en, es };
