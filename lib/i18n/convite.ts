import type { Idioma } from "@/lib/domain/idioma";

/**
 * O texto do convite do aluno — as duas etapas do onboarding, os avisos de link
 * vencido e o "Tudo pronto" —, nos três idiomas (etapa 1 da tradução, 05/10).
 *
 * `{n}`, `{nome}` são trocados na tela: o dicionário atravessa a fronteira do
 * servidor para o cliente como dado, e função não atravessa.
 *
 * **Sem artigo antes do nome do personal.** O português dizia "os treinos *da*
 * Augusto Barros" e "conectada *à* …": o artigo afirma o gênero de alguém que
 * a tela não conhece. As frases foram reescritas para o nome ficar sem artigo,
 * nos três idiomas.
 */
export type TextosDoConvite = {
  idioma: string;
  etapa: string;
  quaseLa: string;
  defina: string;
  email: string;
  emailConfirmado: string;
  senha: string;
  mostrar: string;
  ocultar: string;
  continuar: string;
  contaPraGente: string;
  usaEssesDados: string;
  objetivo: string;
  objetivos: { massa: string; gordura: string; condicionamento: string; saude: string };
  nascimento: string;
  peso: string;
  pesoPlaceholder: string;
  altura: string;
  nivel: string;
  niveis: { iniciante: string; intermediario: string; avancado: string };
  concluir: string;
  criando: string;
  voltar: string;
  confirmeTitulo: string;
  confirmeAntes: string;
  confirmeDepois: string;
  termosObrigatorios: string;
  conviteInvalido: string;
  expiradoTitulo: string;
  expiradoTexto: string;
  falhaTitulo: string;
  falhaTexto: string;
  voltarAoInicio: string;
  prontoTitulo: string;
  prontoTexto: string;
  verTreinos: string;
};

const pt: TextosDoConvite = {
  idioma: "Idioma",
  etapa: "Etapa {n} de 2",
  quaseLa: "Quase lá, {nome}!",
  defina: "Defina sua senha para acessar os treinos que {personal} monta para você.",
  email: "E-mail",
  emailConfirmado: "E-mail confirmado pelo convite",
  senha: "Senha",
  mostrar: "Mostrar",
  ocultar: "Ocultar",
  continuar: "Continuar",
  contaPraGente: "Conta pra gente",
  usaEssesDados: "{personal} usa esses dados para montar e ajustar seus treinos.",
  objetivo: "Objetivo principal",
  objetivos: {
    massa: "Ganhar massa",
    gordura: "Perder gordura",
    condicionamento: "Condicionamento",
    saude: "Saúde",
  },
  nascimento: "Data de nascimento",
  peso: "Peso atual (kg)",
  pesoPlaceholder: "78,5",
  altura: "Altura (cm)",
  nivel: "Nível de experiência",
  niveis: { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" },
  concluir: "Concluir e entrar",
  criando: "Criando…",
  voltar: "Voltar",
  confirmeTitulo: "Confirme seu e-mail",
  confirmeAntes: "Enviamos um link para",
  confirmeDepois: ". Abra o link e seus treinos estarão prontos.",
  termosObrigatorios: "É preciso aceitar os termos para continuar.",
  conviteInvalido: "Esse convite não vale mais. Peça um novo ao seu personal.",
  expiradoTitulo: "Esse link não vale mais",
  expiradoTexto:
    "Convites valem por 7 dias e só podem ser usados uma vez. Peça um novo para o seu personal.",
  falhaTitulo: "Não conseguimos abrir seu convite",
  falhaTexto: "Foi um problema nosso, não com o seu link. Tente de novo em alguns instantes.",
  voltarAoInicio: "Voltar ao início",
  prontoTitulo: "Tudo pronto, {nome}!",
  prontoTexto: "Sua conta está pronta e conectada a {personal}.",
  verTreinos: "Ver meus treinos",
};

const en: TextosDoConvite = {
  idioma: "Language",
  etapa: "Step {n} of 2",
  quaseLa: "Almost there, {nome}!",
  defina: "Set your password to access the workouts {personal} builds for you.",
  email: "Email",
  emailConfirmado: "Email confirmed by the invite",
  senha: "Password",
  mostrar: "Show",
  ocultar: "Hide",
  continuar: "Continue",
  contaPraGente: "Tell us about you",
  usaEssesDados: "{personal} uses this to build and adjust your workouts.",
  objetivo: "Main goal",
  objetivos: {
    massa: "Build muscle",
    gordura: "Lose fat",
    condicionamento: "Conditioning",
    saude: "Health",
  },
  nascimento: "Date of birth",
  peso: "Current weight (kg)",
  pesoPlaceholder: "78.5",
  altura: "Height (cm)",
  nivel: "Experience level",
  niveis: { iniciante: "Beginner", intermediario: "Intermediate", avancado: "Advanced" },
  concluir: "Finish and sign in",
  criando: "Creating…",
  voltar: "Back",
  confirmeTitulo: "Confirm your email",
  confirmeAntes: "We sent a link to",
  confirmeDepois: ". Open the link and your workouts will be ready.",
  termosObrigatorios: "You need to accept the terms to continue.",
  conviteInvalido: "This invite is no longer valid. Ask your trainer for a new one.",
  expiradoTitulo: "This link is no longer valid",
  expiradoTexto:
    "Invites last 7 days and can only be used once. Ask your trainer for a new one.",
  falhaTitulo: "We couldn't open your invite",
  falhaTexto: "The problem is on our side, not with your link. Try again in a moment.",
  voltarAoInicio: "Back to home",
  prontoTitulo: "All set, {nome}!",
  prontoTexto: "Your account is ready and connected to {personal}.",
  verTreinos: "See my workouts",
};

const es: TextosDoConvite = {
  idioma: "Idioma",
  etapa: "Paso {n} de 2",
  quaseLa: "¡Casi listo, {nome}!",
  defina: "Crea tu contraseña para acceder a los entrenamientos que {personal} arma para ti.",
  email: "Correo",
  emailConfirmado: "Correo confirmado por la invitación",
  senha: "Contraseña",
  mostrar: "Mostrar",
  ocultar: "Ocultar",
  continuar: "Continuar",
  contaPraGente: "Cuéntanos sobre ti",
  usaEssesDados: "{personal} usa estos datos para armar y ajustar tus entrenamientos.",
  objetivo: "Objetivo principal",
  objetivos: {
    massa: "Ganar masa muscular",
    gordura: "Perder grasa",
    condicionamento: "Acondicionamiento",
    saude: "Salud",
  },
  nascimento: "Fecha de nacimiento",
  peso: "Peso actual (kg)",
  pesoPlaceholder: "78,5",
  altura: "Altura (cm)",
  nivel: "Nivel de experiencia",
  niveis: { iniciante: "Principiante", intermediario: "Intermedio", avancado: "Avanzado" },
  concluir: "Terminar y entrar",
  criando: "Creando…",
  voltar: "Volver",
  confirmeTitulo: "Confirma tu correo",
  confirmeAntes: "Enviamos un enlace a",
  confirmeDepois: ". Abre el enlace y tus entrenamientos estarán listos.",
  termosObrigatorios: "Tienes que aceptar los términos para continuar.",
  conviteInvalido: "Esta invitación ya no es válida. Pide una nueva a tu entrenador.",
  expiradoTitulo: "Este enlace ya no es válido",
  expiradoTexto:
    "Las invitaciones duran 7 días y solo se pueden usar una vez. Pide una nueva a tu entrenador.",
  falhaTitulo: "No pudimos abrir tu invitación",
  falhaTexto: "El problema es nuestro, no de tu enlace. Inténtalo de nuevo en un momento.",
  voltarAoInicio: "Volver al inicio",
  prontoTitulo: "¡Todo listo, {nome}!",
  prontoTexto: "Tu cuenta está lista y conectada con {personal}.",
  verTreinos: "Ver mis entrenamientos",
};

export const TEXTOS_DO_CONVITE: Record<Idioma, TextosDoConvite> = { pt, en, es };

// As ferramentas moram em `texto.ts` desde a etapa 2; ficam exportadas daqui
// para quem já as importava do convite.
export { partesEmVolta, preencher } from "./texto";
