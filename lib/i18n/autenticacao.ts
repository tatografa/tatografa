import type { Idioma } from "@/lib/domain/idioma";

/**
 * O texto das telas de entrada — entrar, acesso do aluno, cadastro do personal,
 * recuperar e criar nova senha — e da moldura em volta delas, nos três
 * idiomas (etapa 1 da tradução, 05/10).
 *
 * Neutro: o layout e as páginas (servidor) escolhem o idioma e passam o pedaço
 * certo aos formulários (cliente); as Server Actions leem daqui as mensagens de
 * validação. "Personal" vira *trainer* em inglês e *entrenador* em espanhol, e
 * "aluno", *client* e *alumno* — as mesmas escolhas da landing.
 */
export type TextosDaAutenticacao = {
  moldura: {
    personal: { selo: string; titulo: string; apoio: string };
    aluno: { selo: string; titulo: string; apoio: string };
  };
  idioma: string;
  voltar: string;
  rodapeLegal: { termos: string; privacidade: string; versao: string };
  login: {
    personal: { titulo: string; apoio: string; placeholder: string; botao: string };
    aluno: { titulo: string; apoio: string; placeholder: string; botao: string };
    email: string;
    senha: string;
    esqueci: string;
    entrando: string;
    semConta: string;
    criarConta: string;
    alunoSemConta: string;
  };
  avisos: {
    semPerfilPersonal: string;
    semPerfilAluno: string;
    linkInvalido: string;
    sessaoEncerrada: string;
  };
  cadastro: {
    titulo: string;
    apoio: string;
    nome: string;
    nomePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    senha: string;
    botao: string;
    criando: string;
    jaTemConta: string;
    entrar: string;
    confirmeTitulo: string;
    confirmeAntes: string;
    confirmeDepois: string;
    voltarAoLogin: string;
  };
  /** `depois` traz o próprio espaço: em inglês o ponto cola no link. */
  aceite: { antes: string; termos: string; e: string; privacidade: string; depois: string };
  recuperar: {
    voltarAoLogin: string;
    titulo: string;
    apoio: string;
    email: string;
    emailPlaceholder: string;
    botao: string;
    enviando: string;
    enviadoTitulo: string;
    enviadoAntes: string;
    enviadoDepois: string;
  };
  novaSenha: {
    titulo: string;
    nova: string;
    repita: string;
    botao: string;
    salvando: string;
  };
  validacao: {
    emailVazio: string;
    emailInvalido: string;
    senhaVazia: string;
    nome: string;
    termos: string;
    senhasDiferentes: string;
    linkExpirado: string;
  };
};

const pt: TextosDaAutenticacao = {
  moldura: {
    personal: {
      selo: "Área do personal trainer",
      titulo: "Seus alunos, seus treinos, um só painel.",
      apoio:
        "Monte os treinos, acompanhe as execuções e veja a evolução de cada aluno série por série.",
    },
    aluno: {
      selo: "Área do aluno",
      titulo: "Seu treino, sua evolução, no seu bolso.",
      apoio:
        "Veja o treino que seu personal montou, registre carga e repetições na academia e acompanhe sua evolução.",
    },
  },
  idioma: "Idioma",
  voltar: "Voltar",
  rodapeLegal: { termos: "Termos de uso", privacidade: "Privacidade", versao: "Versão" },
  login: {
    personal: {
      titulo: "Entrar com senha",
      apoio: "Vale para personal e para aluno. Use o e-mail da sua conta.",
      placeholder: "voce@assessoria.com",
      botao: "Entrar no painel",
    },
    aluno: {
      titulo: "Entrar",
      apoio: "Use o e-mail e a senha que você criou quando aceitou o convite.",
      placeholder: "voce@email.com",
      botao: "Entrar no app",
    },
    email: "E-mail",
    senha: "Senha",
    esqueci: "Esqueci minha senha",
    entrando: "Entrando…",
    semConta: "Ainda não tem conta?",
    criarConta: "Criar conta de personal",
    alunoSemConta: "Ainda não tem conta? Peça o convite ao seu personal.",
  },
  avisos: {
    semPerfilPersonal:
      "Sua conta existe, mas não está ligada a um perfil de personal. Fale com quem te cadastrou.",
    semPerfilAluno: "Sua conta não está ligada a nenhum personal. Peça um convite.",
    linkInvalido: "Esse link expirou ou já foi usado. Peça outro.",
    sessaoEncerrada: "Sua sessão expirou. Entre de novo.",
  },
  cadastro: {
    titulo: "Criar conta de personal",
    apoio: "Leva menos de um minuto. Depois é só convidar seus alunos.",
    nome: "Nome",
    nomePlaceholder: "Como seus alunos te chamam",
    email: "E-mail",
    emailPlaceholder: "voce@assessoria.com",
    senha: "Senha",
    botao: "Criar conta",
    criando: "Criando…",
    jaTemConta: "Já tem conta?",
    entrar: "Entrar",
    confirmeTitulo: "Confirme seu e-mail",
    confirmeAntes: "Enviamos um link para",
    confirmeDepois: ". Abra o link e sua conta estará pronta.",
    voltarAoLogin: "Voltar ao login",
  },
  aceite: {
    antes: "Aceito os",
    termos: "termos de uso",
    e: "e a",
    privacidade: "política de privacidade",
    depois: " do Reps Club.",
  },
  recuperar: {
    voltarAoLogin: "Voltar ao login",
    titulo: "Recuperar acesso",
    apoio: "Informe seu e-mail e enviamos um link para criar uma nova senha.",
    email: "E-mail",
    emailPlaceholder: "voce@email.com",
    botao: "Enviar link",
    enviando: "Enviando…",
    enviadoTitulo: "Link enviado",
    enviadoAntes: "Se existir uma conta com",
    enviadoDepois: ", o link para criar uma nova senha chega em instantes.",
  },
  novaSenha: {
    titulo: "Criar nova senha",
    nova: "Nova senha",
    repita: "Repita a senha",
    botao: "Salvar e entrar",
    salvando: "Salvando…",
  },
  validacao: {
    emailVazio: "Informe seu e-mail.",
    emailInvalido: "E-mail inválido.",
    senhaVazia: "Informe sua senha.",
    nome: "Informe seu nome.",
    termos: "É preciso aceitar os termos para criar a conta.",
    senhasDiferentes: "As duas senhas precisam ser iguais.",
    linkExpirado: "Esse link expirou ou já foi usado. Peça outro em “Esqueci minha senha”.",
  },
};

const en: TextosDaAutenticacao = {
  moldura: {
    personal: {
      selo: "Personal trainer area",
      titulo: "Your clients, your workouts, one dashboard.",
      apoio:
        "Build workouts, follow every session and see each client's progress set by set.",
    },
    aluno: {
      selo: "Client area",
      titulo: "Your workout, your progress, in your pocket.",
      apoio:
        "See the workout your trainer built, log weight and reps at the gym and follow your progress.",
    },
  },
  idioma: "Language",
  voltar: "Back",
  rodapeLegal: { termos: "Terms of use", privacidade: "Privacy", versao: "Version" },
  login: {
    personal: {
      titulo: "Sign in with password",
      apoio: "Works for trainers and clients. Use your account email.",
      placeholder: "you@yourstudio.com",
      botao: "Sign in to the dashboard",
    },
    aluno: {
      titulo: "Sign in",
      apoio: "Use the email and password you created when you accepted the invite.",
      placeholder: "you@email.com",
      botao: "Sign in to the app",
    },
    email: "Email",
    senha: "Password",
    esqueci: "Forgot my password",
    entrando: "Signing in…",
    semConta: "Don't have an account yet?",
    criarConta: "Create a trainer account",
    alunoSemConta: "Don't have an account yet? Ask your trainer for an invite.",
  },
  avisos: {
    semPerfilPersonal:
      "Your account exists, but it isn't linked to a trainer profile. Talk to whoever signed you up.",
    semPerfilAluno: "Your account isn't linked to any trainer. Ask for an invite.",
    linkInvalido: "This link has expired or was already used. Ask for a new one.",
    sessaoEncerrada: "Your session has expired. Please sign in again.",
  },
  cadastro: {
    titulo: "Create a trainer account",
    apoio: "It takes less than a minute. Then just invite your clients.",
    nome: "Name",
    nomePlaceholder: "What your clients call you",
    email: "Email",
    emailPlaceholder: "you@yourstudio.com",
    senha: "Password",
    botao: "Create account",
    criando: "Creating…",
    jaTemConta: "Already have an account?",
    entrar: "Sign in",
    confirmeTitulo: "Confirm your email",
    confirmeAntes: "We sent a link to",
    confirmeDepois: ". Open the link and your account will be ready.",
    voltarAoLogin: "Back to sign in",
  },
  aceite: {
    antes: "I accept the Reps Club",
    termos: "terms of use",
    e: "and",
    privacidade: "privacy policy",
    depois: ".",
  },
  recuperar: {
    voltarAoLogin: "Back to sign in",
    titulo: "Recover access",
    apoio: "Enter your email and we'll send you a link to create a new password.",
    email: "Email",
    emailPlaceholder: "you@email.com",
    botao: "Send link",
    enviando: "Sending…",
    enviadoTitulo: "Link sent",
    enviadoAntes: "If there's an account with",
    enviadoDepois: ", the link to create a new password will arrive shortly.",
  },
  novaSenha: {
    titulo: "Create a new password",
    nova: "New password",
    repita: "Repeat the password",
    botao: "Save and sign in",
    salvando: "Saving…",
  },
  validacao: {
    emailVazio: "Enter your email.",
    emailInvalido: "Invalid email.",
    senhaVazia: "Enter your password.",
    nome: "Enter your name.",
    termos: "You need to accept the terms to create an account.",
    senhasDiferentes: "The two passwords must match.",
    linkExpirado: "This link has expired or was already used. Ask for a new one in “Forgot my password”.",
  },
};

const es: TextosDaAutenticacao = {
  moldura: {
    personal: {
      selo: "Área del entrenador personal",
      titulo: "Tus alumnos, tus entrenamientos, un solo panel.",
      apoio:
        "Arma los entrenamientos, sigue cada sesión y mira la evolución de cada alumno serie por serie.",
    },
    aluno: {
      selo: "Área del alumno",
      titulo: "Tu entrenamiento, tu evolución, en tu bolsillo.",
      apoio:
        "Mira el entrenamiento que armó tu entrenador, anota peso y repeticiones en el gimnasio y sigue tu evolución.",
    },
  },
  idioma: "Idioma",
  voltar: "Volver",
  rodapeLegal: { termos: "Términos de uso", privacidade: "Privacidad", versao: "Versión" },
  login: {
    personal: {
      titulo: "Entrar con contraseña",
      apoio: "Sirve para entrenadores y alumnos. Usa el correo de tu cuenta.",
      placeholder: "tu@estudio.com",
      botao: "Entrar al panel",
    },
    aluno: {
      titulo: "Entrar",
      apoio: "Usa el correo y la contraseña que creaste cuando aceptaste la invitación.",
      placeholder: "tu@correo.com",
      botao: "Entrar a la app",
    },
    email: "Correo",
    senha: "Contraseña",
    esqueci: "Olvidé mi contraseña",
    entrando: "Entrando…",
    semConta: "¿Todavía no tienes cuenta?",
    criarConta: "Crear cuenta de entrenador",
    alunoSemConta: "¿Todavía no tienes cuenta? Pide la invitación a tu entrenador.",
  },
  avisos: {
    semPerfilPersonal:
      "Tu cuenta existe, pero no está vinculada a un perfil de entrenador. Habla con quien te registró.",
    semPerfilAluno: "Tu cuenta no está vinculada a ningún entrenador. Pide una invitación.",
    linkInvalido: "Este enlace venció o ya se usó. Pide otro.",
    sessaoEncerrada: "Tu sesión venció. Entra de nuevo.",
  },
  cadastro: {
    titulo: "Crear cuenta de entrenador",
    apoio: "Toma menos de un minuto. Después solo invita a tus alumnos.",
    nome: "Nombre",
    nomePlaceholder: "Cómo te llaman tus alumnos",
    email: "Correo",
    emailPlaceholder: "tu@estudio.com",
    senha: "Contraseña",
    botao: "Crear cuenta",
    criando: "Creando…",
    jaTemConta: "¿Ya tienes cuenta?",
    entrar: "Entrar",
    confirmeTitulo: "Confirma tu correo",
    confirmeAntes: "Enviamos un enlace a",
    confirmeDepois: ". Abre el enlace y tu cuenta estará lista.",
    voltarAoLogin: "Volver al inicio de sesión",
  },
  aceite: {
    antes: "Acepto los",
    termos: "términos de uso",
    e: "y la",
    privacidade: "política de privacidad",
    depois: " de Reps Club.",
  },
  recuperar: {
    voltarAoLogin: "Volver al inicio de sesión",
    titulo: "Recuperar acceso",
    apoio: "Escribe tu correo y te enviamos un enlace para crear una nueva contraseña.",
    email: "Correo",
    emailPlaceholder: "tu@correo.com",
    botao: "Enviar enlace",
    enviando: "Enviando…",
    enviadoTitulo: "Enlace enviado",
    enviadoAntes: "Si existe una cuenta con",
    enviadoDepois: ", el enlace para crear una nueva contraseña llegará en instantes.",
  },
  novaSenha: {
    titulo: "Crear nueva contraseña",
    nova: "Nueva contraseña",
    repita: "Repite la contraseña",
    botao: "Guardar y entrar",
    salvando: "Guardando…",
  },
  validacao: {
    emailVazio: "Escribe tu correo.",
    emailInvalido: "Correo no válido.",
    senhaVazia: "Escribe tu contraseña.",
    nome: "Escribe tu nombre.",
    termos: "Tienes que aceptar los términos para crear la cuenta.",
    senhasDiferentes: "Las dos contraseñas tienen que ser iguales.",
    linkExpirado: "Este enlace venció o ya se usó. Pide otro en “Olvidé mi contraseña”.",
  },
};

export const TEXTOS_DA_AUTENTICACAO: Record<Idioma, TextosDaAutenticacao> = { pt, en, es };
