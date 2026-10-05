import type { Idioma } from "@/lib/domain/idioma";

/** O feed: lista, post, compositor e as mensagens das ações. */
const pt = {
  titulo: "Feed",
  publicar: "Publicar",
  oQueMostrar: "O que mostrar no feed",
  daTurma: "Da turma",
  comPersonal: "Com meu personal",
  soPersonalVe: "Só o seu personal vê",
  soPersonalVePost: "Só o seu personal vê este post",
  fotoDe: "Foto do treino de {nome}",
  fotoDeVoce: "Foto do seu treino",
  curtidas: { um: "curtida", outros: "curtidas" },
  comentarios: { um: "comentário", outros: "comentários" },
  nComentarios: { um: "1 comentário", outros: "{n} comentários" },
  vazio: {
    foraTitulo: "A turma não aparece mais",
    turmaTitulo: "Ninguém postou ainda",
    personalTitulo: "Nada por aqui ainda",
    turma: "Quando alguém que treina com {nome} compartilhar um treino, aparece aqui.",
    personal:
      "Ao terminar um treino você pode registrar uma foto. Ela fica visível só para {nome}, a não ser que você escolha mostrar para a turma.",
  },
  /*
   * O que a tela diz a quem foi arquivado. Três frases e não uma: o feed vazio
   * explica **por que** está vazio, o compositor **por que** a opção sumiu, e a
   * aba privada deixa de prometer "a não ser que você escolha mostrar para a
   * turma" — escolha que não existe mais (achado no screenshot dos quatro
   * vazios lado a lado, 26/09). Nenhuma diz "arquivado" nem "inativo": são
   * palavras do painel, e não explicam nada a quem lê.
   */
  foraDaTurma: {
    feed:
      "Você não está mais na turma de {nome}, então os treinos que os outros alunos compartilham não aparecem aqui. Seu histórico e seus recordes continuam seus, e o que você já publicou continua no lugar.",
    compositor: "Você não está mais na turma, então este treino vai só para {nome}.",
    abaDoPersonal:
      "Ao terminar um treino você pode registrar uma foto. Ela fica visível só para {nome}.",
  },
  post: {
    voltar: "← Feed",
    ninguemComentou: "Ninguém comentou ainda.",
    curtir: "Curtir",
    descurtir: "Descurtir",
    apagarTitulo: "Apagar este post?",
    apagarComFoto:
      "A foto sai do Reps Club e os comentários somem junto, inclusive os do seu personal. Não dá para desfazer.",
    apagarSemFoto:
      "Os comentários somem junto, inclusive os do seu personal. Não dá para desfazer.",
    comentar: "Comentar",
    comentarExemplo: "Escreva um comentário",
  },
  compositor: {
    titulo: "Publicar treino",
    previa: "Prévia da foto escolhida",
    removerFoto: "Remover a foto",
    escolherFoto: "Tirar ou escolher uma foto",
    opcional: "Opcional — dá para publicar só com texto.",
    preparando: "Preparando a foto…",
    erroDaFoto: "Não conseguimos ler essa imagem. Tente outra foto.",
    legenda: "Legenda",
    legendaExemplo: "Como foi o treino?",
    restantes: { um: "1 caractere restante", outros: "{n} caracteres restantes" },
    quemVe: "Quem pode ver",
    so: "Só {nome}",
    eATurma: "{nome} e a turma",
    publicando: "Publicando…",
  },
  acoes: {
    alcance: "Escolha quem pode ver este post.",
    legendaLonga: "A legenda pode ter até {n} caracteres.",
    vazio: "Escreva algo ou escolha uma foto.",
    tipoDaFoto: "A foto precisa ser JPG, PNG ou WEBP.",
    tamanhoDaFoto: "A foto passa de 5 MB. Tire outra ou escolha uma menor.",
    falhaFoto: "Não conseguimos enviar a foto agora. Tente de novo.",
    falhaPublicar: "Não conseguimos publicar agora. Tente de novo.",
    comentarioVazio: "Escreva alguma coisa.",
    comentarioLongo: "O comentário pode ter até {n} caracteres.",
    falhaComentario: "Não conseguimos enviar seu comentário agora.",
    postInvalido: "Post inválido.",
    postSumiu: "Este post não existe mais.",
    falhaApagar: "Não conseguimos apagar agora. Tente de novo.",
  },
  /** Quando o nome do autor não chega (`nomes_no_feed` não devolveu). */
  aluno: "Aluno",
  alguemDaTurma: "Alguém da turma",
};

export type TextosDoFeed = typeof pt;

const en: TextosDoFeed = {
  titulo: "Feed",
  publicar: "Post",
  oQueMostrar: "What to show in the feed",
  daTurma: "Group",
  comPersonal: "With my trainer",
  soPersonalVe: "Only your trainer sees this",
  soPersonalVePost: "Only your trainer sees this post",
  fotoDe: "{nome}'s workout photo",
  fotoDeVoce: "Your workout photo",
  curtidas: { um: "like", outros: "likes" },
  comentarios: { um: "comment", outros: "comments" },
  nComentarios: { um: "1 comment", outros: "{n} comments" },
  vazio: {
    foraTitulo: "The group no longer shows up",
    turmaTitulo: "No one has posted yet",
    personalTitulo: "Nothing here yet",
    turma: "When someone who trains with {nome} shares a workout, it shows up here.",
    personal:
      "When you finish a workout you can add a photo. Only {nome} can see it, unless you choose to show it to the group.",
  },
  foraDaTurma: {
    feed:
      "You're no longer in {nome}'s group, so the workouts other clients share don't show up here. Your history and your records are still yours, and what you already posted stays where it is.",
    compositor: "You're no longer in the group, so this workout goes only to {nome}.",
    abaDoPersonal: "When you finish a workout you can add a photo. Only {nome} can see it.",
  },
  post: {
    voltar: "← Feed",
    ninguemComentou: "No one has commented yet.",
    curtir: "Like",
    descurtir: "Unlike",
    apagarTitulo: "Delete this post?",
    apagarComFoto:
      "The photo leaves Reps Club and the comments go with it, including your trainer's. This can't be undone.",
    apagarSemFoto:
      "The comments go with it, including your trainer's. This can't be undone.",
    comentar: "Comment",
    comentarExemplo: "Write a comment",
  },
  compositor: {
    titulo: "Post a workout",
    previa: "Preview of the chosen photo",
    removerFoto: "Remove the photo",
    escolherFoto: "Take or choose a photo",
    opcional: "Optional — you can post just text.",
    preparando: "Preparing the photo…",
    erroDaFoto: "We couldn't read that image. Try another photo.",
    legenda: "Caption",
    legendaExemplo: "How was the workout?",
    restantes: { um: "1 character left", outros: "{n} characters left" },
    quemVe: "Who can see it",
    so: "Only {nome}",
    eATurma: "{nome} and the group",
    publicando: "Posting…",
  },
  acoes: {
    alcance: "Choose who can see this post.",
    legendaLonga: "The caption can be up to {n} characters.",
    vazio: "Write something or choose a photo.",
    tipoDaFoto: "The photo must be JPG, PNG or WEBP.",
    tamanhoDaFoto: "The photo is over 5 MB. Take another or choose a smaller one.",
    falhaFoto: "We couldn't upload the photo right now. Try again.",
    falhaPublicar: "We couldn't post right now. Try again.",
    comentarioVazio: "Write something.",
    comentarioLongo: "The comment can be up to {n} characters.",
    falhaComentario: "We couldn't send your comment right now.",
    postInvalido: "Invalid post.",
    postSumiu: "This post no longer exists.",
    falhaApagar: "We couldn't delete it right now. Try again.",
  },
  aluno: "Client",
  alguemDaTurma: "Someone in the group",
};

const es: TextosDoFeed = {
  titulo: "Feed",
  publicar: "Publicar",
  oQueMostrar: "Qué mostrar en el feed",
  daTurma: "Del grupo",
  comPersonal: "Con mi entrenador",
  soPersonalVe: "Solo tu entrenador lo ve",
  soPersonalVePost: "Solo tu entrenador ve esta publicación",
  fotoDe: "Foto del entrenamiento de {nome}",
  fotoDeVoce: "Foto de tu entrenamiento",
  curtidas: { um: "me gusta", outros: "me gusta" },
  comentarios: { um: "comentario", outros: "comentarios" },
  nComentarios: { um: "1 comentario", outros: "{n} comentarios" },
  vazio: {
    foraTitulo: "El grupo ya no aparece",
    turmaTitulo: "Nadie publicó todavía",
    personalTitulo: "Todavía no hay nada",
    turma: "Cuando alguien que entrena con {nome} comparta un entrenamiento, aparece aquí.",
    personal:
      "Al terminar un entrenamiento puedes subir una foto. Solo la ve {nome}, a menos que elijas mostrarla al grupo.",
  },
  foraDaTurma: {
    feed:
      "Ya no estás en el grupo de {nome}, así que los entrenamientos que comparten los demás alumnos no aparecen aquí. Tu historial y tus récords siguen siendo tuyos, y lo que ya publicaste sigue en su lugar.",
    compositor: "Ya no estás en el grupo, así que este entrenamiento va solo a {nome}.",
    abaDoPersonal: "Al terminar un entrenamiento puedes subir una foto. Solo la ve {nome}.",
  },
  post: {
    voltar: "← Feed",
    ninguemComentou: "Nadie comentó todavía.",
    curtir: "Me gusta",
    descurtir: "Quitar me gusta",
    apagarTitulo: "¿Borrar esta publicación?",
    apagarComFoto:
      "La foto sale de Reps Club y los comentarios se van con ella, incluidos los de tu entrenador. No se puede deshacer.",
    apagarSemFoto:
      "Los comentarios se van con ella, incluidos los de tu entrenador. No se puede deshacer.",
    comentar: "Comentar",
    comentarExemplo: "Escribe un comentario",
  },
  compositor: {
    titulo: "Publicar entrenamiento",
    previa: "Vista previa de la foto elegida",
    removerFoto: "Quitar la foto",
    escolherFoto: "Sacar o elegir una foto",
    opcional: "Opcional — puedes publicar solo texto.",
    preparando: "Preparando la foto…",
    erroDaFoto: "No pudimos leer esa imagen. Prueba con otra foto.",
    legenda: "Texto",
    legendaExemplo: "¿Cómo fue el entrenamiento?",
    restantes: { um: "Queda 1 carácter", outros: "Quedan {n} caracteres" },
    quemVe: "Quién puede verla",
    so: "Solo {nome}",
    eATurma: "{nome} y el grupo",
    publicando: "Publicando…",
  },
  acoes: {
    alcance: "Elige quién puede ver esta publicación.",
    legendaLonga: "El texto puede tener hasta {n} caracteres.",
    vazio: "Escribe algo o elige una foto.",
    tipoDaFoto: "La foto tiene que ser JPG, PNG o WEBP.",
    tamanhoDaFoto: "La foto pasa de 5 MB. Saca otra o elige una más pequeña.",
    falhaFoto: "No pudimos subir la foto ahora. Inténtalo de nuevo.",
    falhaPublicar: "No pudimos publicar ahora. Inténtalo de nuevo.",
    comentarioVazio: "Escribe algo.",
    comentarioLongo: "El comentario puede tener hasta {n} caracteres.",
    falhaComentario: "No pudimos enviar tu comentario ahora.",
    postInvalido: "Publicación no válida.",
    postSumiu: "Esta publicación ya no existe.",
    falhaApagar: "No pudimos borrarla ahora. Inténtalo de nuevo.",
  },
  aluno: "Alumno",
  alguemDaTurma: "Alguien del grupo",
};

export const FEED: Record<Idioma, TextosDoFeed> = { pt, en, es };
