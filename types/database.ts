/**
 * Tipos gerados a partir do schema do Supabase. NÃO EDITE À MÃO.
 *
 * Para regerar depois de uma migration, use o MCP do Supabase
 * (`generate_typescript_types`) ou a CLI:
 *   npx supabase gen types typescript --project-id <ref> > types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          created_at: string
          default_rest_seconds: number
          equipment: Database["public"]["Enums"]["equipment"]
          id: string
          is_bodyweight: boolean
          is_unilateral: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          default_rest_seconds?: number
          equipment: Database["public"]["Enums"]["equipment"]
          id?: string
          is_bodyweight?: boolean
          is_unilateral?: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          default_rest_seconds?: number
          equipment?: Database["public"]["Enums"]["equipment"]
          id?: string
          is_bodyweight?: boolean
          is_unilateral?: boolean
          muscle_group?: Database["public"]["Enums"]["muscle_group"]
          name?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises_catalog: {
        Row: {
          default_rest_seconds: number
          equipment: Database["public"]["Enums"]["equipment"]
          id: string
          is_bodyweight: boolean
          is_unilateral: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
        }
        Insert: {
          default_rest_seconds?: number
          equipment: Database["public"]["Enums"]["equipment"]
          id?: string
          is_bodyweight?: boolean
          is_unilateral?: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
        }
        Update: {
          default_rest_seconds?: number
          equipment?: Database["public"]["Enums"]["equipment"]
          id?: string
          is_bodyweight?: boolean
          is_unilateral?: boolean
          muscle_group?: Database["public"]["Enums"]["muscle_group"]
          name?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          name: string
          token: string
          trainer_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          name: string
          token: string
          trainer_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          name?: string
          token?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      mesocycles: {
        Row: {
          created_at: string
          id: string
          name: string
          started_at: string
          status: Database["public"]["Enums"]["mesocycle_status"]
          student_id: string
          total_weeks: number
          trainer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          started_at?: string
          status?: Database["public"]["Enums"]["mesocycle_status"]
          student_id: string
          total_weeks: number
          trainer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          started_at?: string
          status?: Database["public"]["Enums"]["mesocycle_status"]
          student_id?: string
          total_weeks?: number
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mesocycles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesocycles_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sets: {
        Row: {
          completed_at: string
          id: string
          load_kg: number | null
          reps: number | null
          session_id: string
          set_number: number
          skipped: boolean
          workout_exercise_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          load_kg?: number | null
          reps?: number | null
          session_id: string
          set_number: number
          skipped?: boolean
          workout_exercise_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          load_kg?: number | null
          reps?: number | null
          session_id?: string
          set_number?: number
          skipped?: boolean
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          goal: Database["public"]["Enums"]["student_goal"] | null
          height_cm: number | null
          id: string
          name: string
          onboarded_at: string | null
          status: Database["public"]["Enums"]["student_status"]
          trainer_id: string
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email: string
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          goal?: Database["public"]["Enums"]["student_goal"] | null
          height_cm?: number | null
          id: string
          name: string
          onboarded_at?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          trainer_id: string
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          goal?: Database["public"]["Enums"]["student_goal"] | null
          height_cm?: number | null
          id?: string
          name?: string
          onboarded_at?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          trainer_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          exercise_id: string
          exercise_source: Database["public"]["Enums"]["exercise_source"]
          id: string
          notes: string | null
          position: number
          reps_target: string
          rest_seconds: number
          sets: number
          technique: string | null
          workout_id: string
        }
        Insert: {
          exercise_id: string
          exercise_source: Database["public"]["Enums"]["exercise_source"]
          id?: string
          notes?: string | null
          position?: number
          reps_target: string
          rest_seconds?: number
          sets: number
          technique?: string | null
          workout_id: string
        }
        Update: {
          exercise_id?: string
          exercise_source?: Database["public"]["Enums"]["exercise_source"]
          id?: string
          notes?: string | null
          position?: number
          reps_target?: string
          rest_seconds?: number
          sets?: number
          technique?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          duration_seconds: number | null
          finished_at: string | null
          id: string
          notes: string | null
          started_at: string
          student_id: string
          workout_id: string
        }
        Insert: {
          duration_seconds?: number | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          student_id: string
          workout_id: string
        }
        Update: {
          duration_seconds?: number | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          student_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          id: string
          label: string
          mesocycle_id: string
          name: string
          notes: string | null
          position: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          mesocycle_id: string
          name: string
          notes?: string | null
          position?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          mesocycle_id?: string
          name?: string
          notes?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "workouts_mesocycle_id_fkey"
            columns: ["mesocycle_id"]
            isOneToOne: false
            referencedRelation: "mesocycles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convite_por_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          nome: string
          personal: string
        }[]
      }
      series_por_exercicio: {
        Args: { p_workout_id: string }
        Returns: {
          total: number
          workout_exercise_id: string
        }[]
      }
    }
    Enums: {
      equipment:
        | "barra"
        | "halter"
        | "cabo"
        | "maquina"
        | "peso_corporal"
        | "anilha"
        | "smith"
        | "elastico"
        | "cardio"
      exercise_source: "catalog" | "custom"
      experience_level: "iniciante" | "intermediario" | "avancado"
      mesocycle_status: "ativo" | "concluido" | "arquivado"
      muscle_group:
        | "peito"
        | "costas"
        | "ombros"
        | "trapezio"
        | "biceps"
        | "triceps"
        | "antebraco"
        | "quadriceps"
        | "posterior"
        | "gluteos"
        | "panturrilha"
        | "abdomen"
        | "lombar"
        | "cardio"
      student_goal: "massa" | "gordura" | "condicionamento" | "saude"
      student_status: "convidado" | "ativo" | "inativo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      equipment: [
        "barra",
        "halter",
        "cabo",
        "maquina",
        "peso_corporal",
        "anilha",
        "smith",
        "elastico",
        "cardio",
      ],
      exercise_source: ["catalog", "custom"],
      experience_level: ["iniciante", "intermediario", "avancado"],
      mesocycle_status: ["ativo", "concluido", "arquivado"],
      muscle_group: [
        "peito",
        "costas",
        "ombros",
        "trapezio",
        "biceps",
        "triceps",
        "antebraco",
        "quadriceps",
        "posterior",
        "gluteos",
        "panturrilha",
        "abdomen",
        "lombar",
        "cardio",
      ],
      student_goal: ["massa", "gordura", "condicionamento", "saude"],
      student_status: ["convidado", "ativo", "inativo"],
    },
  },
} as const
