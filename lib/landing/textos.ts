import type { Idioma, PerfilDaLanding } from "@/lib/domain/idioma";
import type { ErroDaLista } from "@/lib/domain/lista-de-espera";

/**
 * Todo o texto da landing, nos três idiomas (pedido do Otávio, 05/10).
 *
 * Um arquivo só, e neutro: a página (servidor), o campo da lista e o aviso de
 * cookies (clientes) leem daqui. Texto espalhado em três componentes é como
 * uma frase muda em português e fica velha em inglês.
 *
 * Login, cadastro, convite, termos e política também falam os três idiomas
 * (etapa 1 da tradução). Termos e política em inglês e espanhol são
 * **referência**: a própria página avisa que a versão que vale é a em
 * português. As capturas de tela continuam sendo do produto em português. "Aluno" vira "client" em inglês, a
 * palavra de quem trabalha com personal, e "alumno" em espanhol.
 */
export type TextosDaLanding = {
  descricao: string;
  navegacao: { principal: string; inicio: string; rodape: string; idioma: string };
  perfis: Record<PerfilDaLanding, string>;
  porPerfil: Record<
    PerfilDaLanding,
    {
      selo: string;
      titulo: string;
      apoio: string;
      fechamento: string;
      fechamentoApoio: string;
      entrar: { rotulo: string; curto: string };
    }
  >;
  demonstracao: {
    eyebrow: string;
    titulo: string;
    pilares: [Pilar, Pilar, Pilar];
  };
  capturas: { painel: string; execucao: string; home: string; progresso: string };
  rodape: { demonstracao: string; termos: string; privacidade: string; cookies: string };
  lista: {
    rotulo: string;
    botao: string;
    enviando: string;
    sucessoAntes: string;
    sucessoDepois: string;
    apoio: string;
    privacidade: string;
    erros: Record<ErroDaLista, string>;
  };
  cookies: {
    regiao: string;
    titulo: string;
    texto: string;
    saibaMais: string;
    recusar: string;
    aceitar: string;
  };
};

type Pilar = { eyebrow: string; titulo: string; texto: string; alt: string };

const pt: TextosDaLanding = {
  descricao:
    "Personal trainers montam os treinos, acompanham cada série e a evolução de cada aluno. Alunos recebem o treino no celular e registram carga e repetições na academia.",
  navegacao: {
    principal: "Principal",
    inicio: "Reps Club, página inicial",
    rodape: "Rodapé",
    idioma: "Idioma",
  },
  perfis: { personal: "Para Personais", aluno: "Para Alunos" },
  porPerfil: {
    personal: {
      selo: "Para personal trainers",
      titulo: "A plataforma completa para gerenciar seus alunos.",
      apoio:
        "Crie treinos, cadastre exercícios, veja cada série que seus alunos registram e acompanhe a evolução de cada um em um só lugar.",
      fechamento: "Gerencie seus alunos com o Reps Club.",
      fechamentoApoio: "Deixe seu e-mail e a gente fala com você.",
      entrar: { rotulo: "Entrar no painel", curto: "Entrar" },
    },
    aluno: {
      selo: "Para alunos",
      titulo: "Seu treino, sua evolução, no seu bolso.",
      apoio:
        "Receba os treinos que seu personal monta, veja como fazer cada exercício, registre carga e repetições na academia e acompanhe sua evolução.",
      fechamento: "Treine com acompanhamento real, direto no seu bolso.",
      fechamentoApoio: "Deixe seu e-mail e a gente fala com você.",
      entrar: { rotulo: "Entrar no app", curto: "Entrar" },
    },
  },
  demonstracao: {
    eyebrow: "Demonstração da plataforma",
    titulo: "Tudo que você precisa para gerenciar seus alunos.",
    pilares: [
      {
        eyebrow: "Gestão de alunos",
        titulo: "Todos os seus alunos, em um só painel",
        texto:
          "Acompanhe aderência, último treino e status de cada aluno sem precisar de planilhas soltas ou grupos de WhatsApp.",
        alt: "A tela de alunos do painel: indicadores da carteira e uma tabela com programa, perfil biológico, status, último treino e aderência de cada aluno",
      },
      {
        eyebrow: "Treinos e exercícios",
        titulo: "Crie treinos e cadastre exercícios em minutos",
        texto:
          "Monte a divisão de treino do aluno com séries, repetições e RIR, a partir de uma biblioteca de exercícios própria, e envie direto para o app dele.",
        alt: "O editor de divisão de treino: o aluno, o objetivo e a frequência à esquerda, e um cartão por treino com os exercícios prescritos",
      },
      {
        eyebrow: "Acompanhamento de cada treino",
        titulo: "Veja a execução e a evolução de cada aluno",
        texto:
          "Cada série que o aluno registra chega ao perfil dele, com carga e repetições. Acompanhe a evolução das cargas, a frequência e as reavaliações.",
        alt: "O perfil do aluno: dados e sessões à esquerda, os treinos registrados no meio e o programa atual à direita",
      },
    ],
  },
  capturas: {
    painel:
      "O painel do personal: alunos ativos, treinos na semana, aderência média, reavaliações, quem precisa de atenção, a evolução da carteira e o top 10 de progressões",
    execucao:
      "A execução do treino: o exercício, a última vez que foi feito, o RIR em palavras e as séries com carga e repetições",
    home: "A home do aluno: dias seguidos, sessões totais, o programa ativo e o próximo treino",
    progresso: "O progresso do aluno: a evolução da carga no supino nas últimas seis sessões",
  },
  rodape: {
    demonstracao: "Demonstração",
    termos: "Termos",
    privacidade: "Privacidade",
    cookies: "Cookies",
  },
  lista: {
    rotulo: "Seu e-mail",
    botao: "Entrar na lista",
    enviando: "Enviando…",
    sucessoAntes: "Você está na lista. Vamos escrever para",
    sucessoDepois: ".",
    apoio: "Só o e-mail, e só para avisar você.",
    privacidade: "Privacidade",
    erros: {
      vazio: "Digite seu e-mail.",
      longo: "E-mail muito longo.",
      invalido: "Esse e-mail não parece certo.",
      falha: "Não conseguimos registrar agora. Tente de novo em instantes.",
    },
  },
  cookies: {
    regiao: "Aviso de cookies",
    titulo: "Cookies",
    texto:
      "Usamos cookies essenciais para o site funcionar e manter você conectado. Cookies de medição de uso só entram se você aceitar — e nunca usamos cookies de publicidade.",
    saibaMais: "Saiba mais",
    recusar: "Recusar",
    aceitar: "Aceitar",
  },
};

const en: TextosDaLanding = {
  descricao:
    "Personal trainers build the workouts and follow every set and each client's progress. Clients get their workout on their phone and log weight and reps at the gym.",
  navegacao: {
    principal: "Main",
    inicio: "Reps Club, home page",
    rodape: "Footer",
    idioma: "Language",
  },
  perfis: { personal: "For Trainers", aluno: "For Clients" },
  porPerfil: {
    personal: {
      selo: "For personal trainers",
      titulo: "The complete platform to manage your clients.",
      apoio:
        "Build workouts, add exercises, see every set your clients log and follow each one's progress in one place.",
      fechamento: "Manage your clients with Reps Club.",
      fechamentoApoio: "Leave your email and we'll get in touch.",
      entrar: { rotulo: "Sign in to the dashboard", curto: "Sign in" },
    },
    aluno: {
      selo: "For clients",
      titulo: "Your workout, your progress, in your pocket.",
      apoio:
        "Get the workouts your trainer builds, see how to do each exercise, log weight and reps at the gym and follow your progress.",
      fechamento: "Train with real coaching, right in your pocket.",
      fechamentoApoio: "Leave your email and we'll get in touch.",
      entrar: { rotulo: "Sign in to the app", curto: "Sign in" },
    },
  },
  demonstracao: {
    eyebrow: "Platform demo",
    titulo: "Everything you need to manage your clients.",
    pilares: [
      {
        eyebrow: "Client management",
        titulo: "All your clients, in one dashboard",
        texto:
          "Track adherence, last workout and status for each client — no scattered spreadsheets or WhatsApp groups.",
        alt: "The clients screen of the dashboard: roster indicators and a table with each client's program, biological profile, status, last workout and adherence",
      },
      {
        eyebrow: "Workouts and exercises",
        titulo: "Build workouts and add exercises in minutes",
        texto:
          "Set up the client's training split with sets, reps and RIR, from your own exercise library, and send it straight to their app.",
        alt: "The training split editor: the client, goal and frequency on the left, and one card per workout with the prescribed exercises",
      },
      {
        eyebrow: "Every workout, followed",
        titulo: "See each client's sessions and progress",
        texto:
          "Every set a client logs reaches their profile, with weight and reps. Follow load progression, frequency and reassessments.",
        alt: "The client profile: details and sessions on the left, logged workouts in the middle and the current program on the right",
      },
    ],
  },
  capturas: {
    painel:
      "The trainer dashboard: active clients, workouts this week, average adherence, reassessments, who needs attention, roster growth and the top 10 progressions",
    execucao:
      "A workout in progress: the exercise, the last time it was done, the RIR in words and the sets with weight and reps",
    home: "The client's home screen: day streak, total sessions, the active program and the next workout",
    progresso: "The client's progress: bench press load over the last six sessions",
  },
  rodape: {
    demonstracao: "Demo",
    termos: "Terms",
    privacidade: "Privacy",
    cookies: "Cookies",
  },
  lista: {
    rotulo: "Your email",
    botao: "Join the list",
    enviando: "Sending…",
    sucessoAntes: "You're on the list. We'll write to",
    sucessoDepois: ".",
    apoio: "Just your email, and only to let you know.",
    privacidade: "Privacy",
    erros: {
      vazio: "Enter your email.",
      longo: "That email is too long.",
      invalido: "That email doesn't look right.",
      falha: "We couldn't sign you up right now. Try again in a moment.",
    },
  },
  cookies: {
    regiao: "Cookie notice",
    titulo: "Cookies",
    texto:
      "We use essential cookies to make the site work and keep you signed in. Usage-measurement cookies are only used if you accept — and we never use advertising cookies.",
    saibaMais: "Learn more",
    recusar: "Decline",
    aceitar: "Accept",
  },
};

const es: TextosDaLanding = {
  descricao:
    "Los entrenadores personales arman los entrenamientos y siguen cada serie y la evolución de cada alumno. Los alumnos reciben el entrenamiento en el celular y anotan peso y repeticiones en el gimnasio.",
  navegacao: {
    principal: "Principal",
    inicio: "Reps Club, página de inicio",
    rodape: "Pie de página",
    idioma: "Idioma",
  },
  perfis: { personal: "Para Entrenadores", aluno: "Para Alumnos" },
  porPerfil: {
    personal: {
      selo: "Para entrenadores personales",
      titulo: "La plataforma completa para gestionar a tus alumnos.",
      apoio:
        "Crea entrenamientos, registra ejercicios, mira cada serie que anotan tus alumnos y sigue la evolución de cada uno en un solo lugar.",
      fechamento: "Gestiona a tus alumnos con Reps Club.",
      fechamentoApoio: "Déjanos tu correo y te escribimos.",
      entrar: { rotulo: "Entrar al panel", curto: "Entrar" },
    },
    aluno: {
      selo: "Para alumnos",
      titulo: "Tu entrenamiento, tu evolución, en tu bolsillo.",
      apoio:
        "Recibe los entrenamientos que arma tu entrenador, mira cómo hacer cada ejercicio, anota peso y repeticiones en el gimnasio y sigue tu evolución.",
      fechamento: "Entrena con acompañamiento real, directo en tu bolsillo.",
      fechamentoApoio: "Déjanos tu correo y te escribimos.",
      entrar: { rotulo: "Entrar a la app", curto: "Entrar" },
    },
  },
  demonstracao: {
    eyebrow: "Demostración de la plataforma",
    titulo: "Todo lo que necesitas para gestionar a tus alumnos.",
    pilares: [
      {
        eyebrow: "Gestión de alumnos",
        titulo: "Todos tus alumnos, en un solo panel",
        texto:
          "Sigue la adherencia, el último entrenamiento y el estado de cada alumno sin planillas sueltas ni grupos de WhatsApp.",
        alt: "La pantalla de alumnos del panel: indicadores de la cartera y una tabla con el programa, el perfil biológico, el estado, el último entrenamiento y la adherencia de cada alumno",
      },
      {
        eyebrow: "Entrenamientos y ejercicios",
        titulo: "Crea entrenamientos y registra ejercicios en minutos",
        texto:
          "Arma la división de entrenamiento del alumno con series, repeticiones y RIR, a partir de tu propia biblioteca de ejercicios, y envíala directo a su app.",
        alt: "El editor de división de entrenamiento: el alumno, el objetivo y la frecuencia a la izquierda, y una tarjeta por entrenamiento con los ejercicios prescritos",
      },
      {
        eyebrow: "Seguimiento de cada entrenamiento",
        titulo: "Mira la ejecución y la evolución de cada alumno",
        texto:
          "Cada serie que anota el alumno llega a su perfil, con peso y repeticiones. Sigue la evolución de las cargas, la frecuencia y las reevaluaciones.",
        alt: "El perfil del alumno: datos y sesiones a la izquierda, los entrenamientos registrados en el medio y el programa actual a la derecha",
      },
    ],
  },
  capturas: {
    painel:
      "El panel del entrenador: alumnos activos, entrenamientos de la semana, adherencia media, reevaluaciones, quién necesita atención, la evolución de la cartera y el top 10 de progresiones",
    execucao:
      "La ejecución del entrenamiento: el ejercicio, la última vez que se hizo, el RIR en palabras y las series con peso y repeticiones",
    home: "El inicio del alumno: días seguidos, sesiones totales, el programa activo y el próximo entrenamiento",
    progresso: "El progreso del alumno: la evolución de la carga en press de banca en las últimas seis sesiones",
  },
  rodape: {
    demonstracao: "Demostración",
    termos: "Términos",
    privacidade: "Privacidad",
    cookies: "Cookies",
  },
  lista: {
    rotulo: "Tu correo",
    botao: "Unirme a la lista",
    enviando: "Enviando…",
    sucessoAntes: "Ya estás en la lista. Te escribiremos a",
    sucessoDepois: ".",
    apoio: "Solo tu correo, y solo para avisarte.",
    privacidade: "Privacidad",
    erros: {
      vazio: "Escribe tu correo.",
      longo: "Ese correo es demasiado largo.",
      invalido: "Ese correo no parece correcto.",
      falha: "No pudimos registrarte ahora. Inténtalo de nuevo en un momento.",
    },
  },
  cookies: {
    regiao: "Aviso de cookies",
    titulo: "Cookies",
    texto:
      "Usamos cookies esenciales para que el sitio funcione y para mantener tu sesión iniciada. Las cookies de medición de uso solo se activan si aceptas — y nunca usamos cookies de publicidad.",
    saibaMais: "Más información",
    recusar: "Rechazar",
    aceitar: "Aceptar",
  },
};

export const TEXTOS_DA_LANDING: Record<Idioma, TextosDaLanding> = { pt, en, es };
