import type { Idioma } from "@/lib/domain/idioma";
import {
  EQUIPAMENTO,
  GRUPO_MUSCULAR,
  NIVEL,
  OBJETIVO,
  OBJETIVO_DO_PROGRAMA,
  PERFIL_BIOLOGICO,
  STATUS_DO_ALUNO,
} from "@/lib/rotulos";
import { ROTULO_DA_SITUACAO } from "@/lib/domain/agenda";
import type { Enums } from "@/types/database";

/**
 * Os rótulos dos valores do banco nos três idiomas (etapa 3 da tradução).
 *
 * **O português é o de `lib/rotulos.ts`**, não uma cópia: é a lista que o resto
 * do produto já usa, e duas cópias de "Posterior de coxa" divergiriam na
 * primeira correção. As traduções seguem a mesma ordem dos enums.
 */
export type RotulosDoBanco = {
  grupo: Record<Enums<"muscle_group">, string>;
  equipamento: Record<Enums<"equipment">, string>;
  objetivo: Record<Enums<"student_goal">, string>;
  objetivoDoPrograma: Record<Enums<"training_goal">, string>;
  nivel: Record<Enums<"experience_level">, string>;
  perfilBiologico: Record<Enums<"biological_profile">, string>;
  status: Record<Enums<"student_status">, string>;
  situacao: Record<Enums<"appointment_status">, string>;
};

const pt: RotulosDoBanco = {
  grupo: GRUPO_MUSCULAR,
  equipamento: EQUIPAMENTO,
  objetivo: OBJETIVO,
  objetivoDoPrograma: OBJETIVO_DO_PROGRAMA,
  nivel: NIVEL,
  perfilBiologico: PERFIL_BIOLOGICO,
  status: STATUS_DO_ALUNO,
  situacao: ROTULO_DA_SITUACAO,
};

const en: RotulosDoBanco = {
  grupo: {
    peito: "Chest",
    costas: "Back",
    ombros: "Shoulders",
    trapezio: "Traps",
    biceps: "Biceps",
    triceps: "Triceps",
    antebraco: "Forearms",
    quadriceps: "Quads",
    posterior: "Hamstrings",
    gluteos: "Glutes",
    panturrilha: "Calves",
    abdomen: "Abs",
    lombar: "Lower back",
    cardio: "Cardio",
  },
  equipamento: {
    barra: "Barbell",
    halter: "Dumbbell",
    cabo: "Cable",
    maquina: "Machine",
    peso_corporal: "Bodyweight",
    anilha: "Plate",
    smith: "Smith",
    elastico: "Band",
    cardio: "Cardio",
  },
  objetivo: {
    massa: "Build muscle",
    gordura: "Lose fat",
    condicionamento: "Conditioning",
    saude: "Health",
  },
  objetivoDoPrograma: {
    hipertrofia: "Hypertrophy",
    forca: "Strength",
    resistencia: "Endurance",
    emagrecimento: "Fat loss",
    condicionamento: "Conditioning",
  },
  nivel: { iniciante: "Beginner", intermediario: "Intermediate", avancado: "Advanced" },
  perfilBiologico: { natural: "Natural", reposicao: "Replacement therapy", hormonizado: "Hormone use" },
  status: { convidado: "Invited", ativo: "Active", inativo: "Inactive" },
  situacao: { agendada: "Scheduled", realizada: "Done", faltou: "No-show", cancelada: "Canceled" },
};

const es: RotulosDoBanco = {
  grupo: {
    peito: "Pecho",
    costas: "Espalda",
    ombros: "Hombros",
    trapezio: "Trapecio",
    biceps: "Bíceps",
    triceps: "Tríceps",
    antebraco: "Antebrazo",
    quadriceps: "Cuádriceps",
    posterior: "Isquiotibiales",
    gluteos: "Glúteos",
    panturrilha: "Pantorrilla",
    abdomen: "Abdomen",
    lombar: "Lumbar",
    cardio: "Cardio",
  },
  equipamento: {
    barra: "Barra",
    halter: "Mancuerna",
    cabo: "Polea",
    maquina: "Máquina",
    peso_corporal: "Peso corporal",
    anilha: "Disco",
    smith: "Smith",
    elastico: "Banda elástica",
    cardio: "Cardio",
  },
  objetivo: {
    massa: "Ganar masa muscular",
    gordura: "Perder grasa",
    condicionamento: "Acondicionamiento",
    saude: "Salud",
  },
  objetivoDoPrograma: {
    hipertrofia: "Hipertrofia",
    forca: "Fuerza",
    resistencia: "Resistencia",
    emagrecimento: "Pérdida de grasa",
    condicionamento: "Acondicionamiento",
  },
  nivel: { iniciante: "Principiante", intermediario: "Intermedio", avancado: "Avanzado" },
  perfilBiologico: { natural: "Natural", reposicao: "Reposición", hormonizado: "Hormonizado" },
  status: { convidado: "Invitado", ativo: "Activo", inativo: "Inactivo" },
  situacao: { agendada: "Agendada", realizada: "Realizada", faltou: "Faltó", cancelada: "Cancelada" },
};

export const ROTULOS: Record<Idioma, RotulosDoBanco> = { pt, en, es };
