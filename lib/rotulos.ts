import type { Enums } from "@/types/database";

/**
 * Rótulos em português dos enums do banco.
 *
 * Os valores do enum são sem acento por serem identificadores; a interface é
 * em português do Brasil e precisa do acento. Um lugar só para as duas telas
 * (painel e app do aluno) não divergirem.
 */
export const GRUPO_MUSCULAR: Record<Enums<"muscle_group">, string> = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  trapezio: "Trapézio",
  biceps: "Bíceps",
  triceps: "Tríceps",
  antebraco: "Antebraço",
  quadriceps: "Quadríceps",
  posterior: "Posterior de coxa",
  gluteos: "Glúteos",
  panturrilha: "Panturrilha",
  abdomen: "Abdômen",
  lombar: "Lombar",
  cardio: "Cardio",
};

export const OBJETIVO: Record<Enums<"student_goal">, string> = {
  massa: "Ganhar massa",
  gordura: "Perder gordura",
  condicionamento: "Condicionamento",
  saude: "Saúde",
};

export const NIVEL: Record<Enums<"experience_level">, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

/** O enum é identificador; a interface é em português e não mostra "ativo" cru. */
export const STATUS_DO_ALUNO: Record<Enums<"student_status">, string> = {
  convidado: "Convidado",
  ativo: "Ativo",
  inativo: "Inativo",
};

export const EQUIPAMENTO: Record<Enums<"equipment">, string> = {
  barra: "Barra",
  halter: "Halter",
  cabo: "Cabo",
  maquina: "Máquina",
  peso_corporal: "Peso corporal",
  anilha: "Anilha",
  smith: "Smith",
  elastico: "Elástico",
  cardio: "Cardio",
};
