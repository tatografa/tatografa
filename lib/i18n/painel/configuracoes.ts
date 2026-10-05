import type { Idioma } from "@/lib/domain/idioma";

/**
 * Configurações (`/painel/configuracoes`) e "Treinar como aluno"
 * (`/painel/treinar`): perfil, idioma, alerta de inatividade, segurança e o
 * perfil de aluno do próprio personal.
 */
const pt = {
  titulo: "Configurações",
  subtitulo: "Ajuste seu perfil, o idioma, o alerta de inatividade e a segurança da conta",
  editarPerfil: "Editar perfil",
  perfil: {
    titulo: "Perfil",
    nome: "Seu nome",
    nomeApoio: "É como seus alunos veem você no app.",
    whatsapp: "WhatsApp",
    whatsappExemplo: "(11) 99999-9999",
    whatsappApoio: "Com DDD. Em branco, o botão de WhatsApp some do app dos alunos.",
    email: "E-mail",
    emailNaoEdita: "É o seu login, e por isso não se edita aqui.",
    emailLogin: "É o seu login.",
    comWhatsapp: "Seus alunos têm um botão que abre a conversa com você.",
    semWhatsapp: "Informe o número e seus alunos ganham um botão que abre a conversa com você.",
  },
  idioma: {
    titulo: "Idioma do painel",
    apoio:
      "Muda o idioma do painel neste navegador. Treinos, exercícios e anotações continuam como você escreveu.",
  },
  alerta: {
    titulo: "Alerta de inatividade",
    explicacao:
      "Passado esse tempo sem concluir treino, o aluno aparece em “Precisam de atenção”, na tela de Alunos.",
    rotulo: "Dias sem treinar até o alerta",
    apoio: "Entre {min} e {max}. O padrão é 7.",
  },
  seguranca: {
    titulo: "Segurança",
    senha: "Senha",
    atual: "Senha atual",
    nova: "Senha nova",
    repita: "Repita a senha nova",
    trocando: "Trocando…",
    trocar: "Trocar senha",
    trocada: "Senha trocada. Use a nova no próximo login.",
    pedimosAtual:
      "Para trocar, pedimos a atual antes — quem achar o painel aberto não consegue tirar você da sua conta.",
    sair: "Sair da conta",
    sairApoio:
      "Encerra a sessão neste navegador. Em computador que outras pessoas usam, saia ao terminar.",
  },
  erros: {
    informeDias: "Informe um número de dias.",
    diasInteiro: "Use um número inteiro de dias.",
    diasMin: "O mínimo é {n} dia.",
    diasMax: "O máximo é {n} dias.",
    falhaSalvar: "Não deu para salvar agora. Tente de novo.",
    informeNome: "Informe seu nome.",
    nomeLongo: "Use no máximo 80 caracteres.",
    telefone: "Informe um número com DDD, como (11) 99999-9999.",
    informeAtual: "Informe a senha que você usa hoje.",
    diferentes: "As duas senhas novas precisam ser iguais.",
    sessaoTerminou: "Sua sessão terminou. Entre de novo para trocar a senha.",
    atualErrada: "Essa não é a sua senha atual.",
  },
  treinar: {
    titulo: "Treinar como aluno",
    subtitulo: "Você também treina: monte o seu macrotreino e execute pelo app do aluno",
    explicacao:
      "Aqui você vira aluno de si mesmo: monta o próprio macrotreino no mesmo editor, executa pelo app do aluno no celular e aparece no feed junto com a sua turma.",
    prontoTitulo: "Seu perfil de aluno está pronto",
    pronto:
      "Você aparece na sua lista de alunos como qualquer outro — é por lá que se monta o seu macrotreino. Para treinar, abra o app do aluno; a volta para cá fica no topo da tela.",
    abrirApp: "Abrir o app do aluno",
    criarTitulo: "Criar seu perfil de aluno",
    criar:
      "Usa o nome e o e-mail que já estão na sua conta. Depois disso você aparece na sua própria lista de alunos, e é de lá que sai o seu macrotreino.",
    abrindo: "Abrindo…",
    botao: "Criar meu perfil de aluno",
    emailEmUso:
      "Já existe um aluno cadastrado com {email}. Como o e-mail não se repete entre alunos, esse endereço precisa ser liberado antes.",
    falha: "Não conseguimos abrir seu perfil de aluno agora. Tente de novo.",
  },
};

export type TextosDasConfiguracoes = typeof pt;

const en: TextosDasConfiguracoes = {
  titulo: "Settings",
  subtitulo: "Adjust your profile, the language, the inactivity alert and your account security",
  editarPerfil: "Edit profile",
  perfil: {
    titulo: "Profile",
    nome: "Your name",
    nomeApoio: "This is how your clients see you in the app.",
    whatsapp: "WhatsApp",
    whatsappExemplo: "(11) 99999-9999",
    whatsappApoio: "With area code. If blank, the WhatsApp button disappears from your clients' app.",
    email: "Email",
    emailNaoEdita: "It's your login, so it can't be edited here.",
    emailLogin: "It's your login.",
    comWhatsapp: "Your clients have a button that opens a chat with you.",
    semWhatsapp: "Add your number and your clients get a button that opens a chat with you.",
  },
  idioma: {
    titulo: "Dashboard language",
    apoio:
      "Changes the dashboard language in this browser. Workouts, exercises and notes stay as you wrote them.",
  },
  alerta: {
    titulo: "Inactivity alert",
    explicacao:
      "After this long without finishing a workout, the client shows up under “Need attention”, on the Clients screen.",
    rotulo: "Days without training before the alert",
    apoio: "Between {min} and {max}. The default is 7.",
  },
  seguranca: {
    titulo: "Security",
    senha: "Password",
    atual: "Current password",
    nova: "New password",
    repita: "Repeat the new password",
    trocando: "Changing…",
    trocar: "Change password",
    trocada: "Password changed. Use the new one next time you sign in.",
    pedimosAtual:
      "To change it, we ask for the current one first — someone who finds the dashboard open can't lock you out of your account.",
    sair: "Sign out",
    sairApoio:
      "Ends the session in this browser. On a computer other people use, sign out when you're done.",
  },
  erros: {
    informeDias: "Enter a number of days.",
    diasInteiro: "Use a whole number of days.",
    diasMin: "The minimum is {n} day.",
    diasMax: "The maximum is {n} days.",
    falhaSalvar: "We couldn't save right now. Try again.",
    informeNome: "Enter your name.",
    nomeLongo: "Use at most 80 characters.",
    telefone: "Enter a number with area code, like (11) 99999-9999.",
    informeAtual: "Enter the password you use today.",
    diferentes: "The two new passwords need to match.",
    sessaoTerminou: "Your session has ended. Sign in again to change the password.",
    atualErrada: "That isn't your current password.",
  },
  treinar: {
    titulo: "Train as a client",
    subtitulo: "You train too: build your own macrocycle and do it in the client app",
    explicacao:
      "Here you become your own client: you build your own macrocycle in the same editor, do it in the client app on your phone and show up in the feed along with your group.",
    prontoTitulo: "Your client profile is ready",
    pronto:
      "You show up in your client list like anyone else — that's where you build your macrocycle. To train, open the client app; the way back here is at the top of the screen.",
    abrirApp: "Open the client app",
    criarTitulo: "Create your client profile",
    criar:
      "It uses the name and email already on your account. After that you show up in your own client list, and that's where your macrocycle comes from.",
    abrindo: "Opening…",
    botao: "Create my client profile",
    emailEmUso:
      "There's already a client registered with {email}. Since emails can't repeat between clients, that address has to be freed first.",
    falha: "We couldn't open your client profile right now. Try again.",
  },
};

const es: TextosDasConfiguracoes = {
  titulo: "Configuración",
  subtitulo: "Ajusta tu perfil, el idioma, la alerta de inactividad y la seguridad de la cuenta",
  editarPerfil: "Editar perfil",
  perfil: {
    titulo: "Perfil",
    nome: "Tu nombre",
    nomeApoio: "Es como tus alumnos te ven en la app.",
    whatsapp: "WhatsApp",
    whatsappExemplo: "(11) 99999-9999",
    whatsappApoio: "Con código de área. En blanco, el botón de WhatsApp desaparece de la app de tus alumnos.",
    email: "Correo",
    emailNaoEdita: "Es tu acceso, y por eso no se edita aquí.",
    emailLogin: "Es tu acceso.",
    comWhatsapp: "Tus alumnos tienen un botón que abre la conversación contigo.",
    semWhatsapp: "Indica el número y tus alumnos tendrán un botón que abre la conversación contigo.",
  },
  idioma: {
    titulo: "Idioma del panel",
    apoio:
      "Cambia el idioma del panel en este navegador. Los entrenamientos, ejercicios y notas siguen como los escribiste.",
  },
  alerta: {
    titulo: "Alerta de inactividad",
    explicacao:
      "Pasado ese tiempo sin terminar un entrenamiento, el alumno aparece en “Necesitan atención”, en la pantalla de Alumnos.",
    rotulo: "Días sin entrenar hasta la alerta",
    apoio: "Entre {min} y {max}. Por defecto son 7.",
  },
  seguranca: {
    titulo: "Seguridad",
    senha: "Contraseña",
    atual: "Contraseña actual",
    nova: "Contraseña nueva",
    repita: "Repite la contraseña nueva",
    trocando: "Cambiando…",
    trocar: "Cambiar contraseña",
    trocada: "Contraseña cambiada. Usa la nueva la próxima vez que entres.",
    pedimosAtual:
      "Para cambiarla, pedimos primero la actual — quien encuentre el panel abierto no puede dejarte fuera de tu cuenta.",
    sair: "Cerrar sesión",
    sairApoio:
      "Cierra la sesión en este navegador. En una computadora que usan otras personas, cierra la sesión al terminar.",
  },
  erros: {
    informeDias: "Indica un número de días.",
    diasInteiro: "Usa un número entero de días.",
    diasMin: "El mínimo es {n} día.",
    diasMax: "El máximo es {n} días.",
    falhaSalvar: "No pudimos guardar ahora. Inténtalo de nuevo.",
    informeNome: "Indica tu nombre.",
    nomeLongo: "Usa como máximo 80 caracteres.",
    telefone: "Indica un número con código de área, como (11) 99999-9999.",
    informeAtual: "Indica la contraseña que usas hoy.",
    diferentes: "Las dos contraseñas nuevas tienen que ser iguales.",
    sessaoTerminou: "Tu sesión terminó. Vuelve a entrar para cambiar la contraseña.",
    atualErrada: "Esa no es tu contraseña actual.",
  },
  treinar: {
    titulo: "Entrenar como alumno",
    subtitulo: "Tú también entrenas: arma tu macrociclo y ejecútalo en la app del alumno",
    explicacao:
      "Aquí te conviertes en tu propio alumno: armas tu macrociclo en el mismo editor, lo ejecutas en la app del alumno en el celular y apareces en el feed junto con tu grupo.",
    prontoTitulo: "Tu perfil de alumno está listo",
    pronto:
      "Apareces en tu lista de alumnos como cualquier otro — es ahí donde se arma tu macrociclo. Para entrenar, abre la app del alumno; la vuelta aquí está arriba de la pantalla.",
    abrirApp: "Abrir la app del alumno",
    criarTitulo: "Crear tu perfil de alumno",
    criar:
      "Usa el nombre y el correo que ya están en tu cuenta. Después apareces en tu propia lista de alumnos, y de ahí sale tu macrociclo.",
    abrindo: "Abriendo…",
    botao: "Crear mi perfil de alumno",
    emailEmUso:
      "Ya hay un alumno registrado con {email}. Como el correo no se repite entre alumnos, esa dirección tiene que liberarse antes.",
    falha: "No pudimos abrir tu perfil de alumno ahora. Inténtalo de nuevo.",
  },
};

export const CONFIGURACOES: Record<Idioma, TextosDasConfiguracoes> = { pt, en, es };
