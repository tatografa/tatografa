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
      appointments: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          body_fat_pct: number | null
          created_at: string
          id: string
          notes: string | null
          photo_back_path: string | null
          photo_front_path: string | null
          photo_side_path: string | null
          released_at: string
          student_id: string
          submitted_at: string | null
          trainer_id: string
          weight_kg: number | null
        }
        Insert: {
          body_fat_pct?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_back_path?: string | null
          photo_front_path?: string | null
          photo_side_path?: string | null
          released_at?: string
          student_id: string
          submitted_at?: string | null
          trainer_id: string
          weight_kg?: number | null
        }
        Update: {
          body_fat_pct?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_back_path?: string | null
          photo_front_path?: string | null
          photo_side_path?: string | null
          released_at?: string
          student_id?: string
          submitted_at?: string | null
          trainer_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
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
      post_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_path: string | null
          session_id: string | null
          student_id: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_path?: string | null
          session_id?: string | null
          student_id: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_path?: string | null
          session_id?: string | null
          student_id?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
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
      student_measurements: {
        Row: {
          assessment_id: string
          region: Database["public"]["Enums"]["body_region"]
          value_cm: number
        }
        Insert: {
          assessment_id: string
          region: Database["public"]["Enums"]["body_region"]
          value_cm: number
        }
        Update: {
          assessment_id?: string
          region?: Database["public"]["Enums"]["body_region"]
          value_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_measurements_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
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
      term_acceptances: {
        Row: {
          aceito_em: string
          documento: string
          id: string
          user_id: string
          versao: string
        }
        Insert: {
          aceito_em?: string
          documento: string
          id?: string
          user_id: string
          versao: string
        }
        Update: {
          aceito_em?: string
          documento?: string
          id?: string
          user_id?: string
          versao?: string
        }
        Relationships: []
      }
      trainer_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          student_id: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          student_id: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          student_id?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_notes_trainer_id_fkey"
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
          dias_para_alerta: number
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dias_para_alerta?: number
          email: string
          id: string
          name: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dias_para_alerta?: number
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
      ativar_macrotreino: {
        Args: { p_mesocycle_id: string }
        Returns: undefined
      }
      convite_por_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          nome: string
          personal: string
        }[]
      }
      dias_de_treino: {
        Args: { p_student_id: string }
        Returns: {
          dia: string
        }[]
      }
      duplicar_macrotreino: {
        Args: { p_mesocycle_id: string; p_name: string; p_student_id: string }
        Returns: string
      }
      duplicar_treino: {
        Args: { p_workout_id: string }
        Returns: string
      }
      enviar_reavaliacao: {
        Args: {
          p_assessment_id: string
          p_body_fat_pct?: number
          p_medidas?: Json
          p_notes?: string
          p_photo_back?: string
          p_photo_front?: string
          p_photo_side?: string
          p_weight_kg?: number
        }
        Returns: undefined
      }
      nomes_no_feed: {
        Args: { p_ids: string[] }
        Returns: {
          id: string
          name: string
        }[]
      }
      sessoes_na_semana: {
        Args: { p_ate: string; p_de: string }
        Returns: {
          student_id: string
          total: number
        }[]
      }
      series_por_exercicio: {
        Args: { p_workout_id: string }
        Returns: {
          total: number
          workout_exercise_id: string
        }[]
      }
      ultima_sessao_por_aluno: {
        Args: Record<PropertyKey, never>
        Returns: {
          finished_at: string
          student_id: string
        }[]
      }
      treinos_feitos_na_semana: {
        Args: { p_ate: string; p_de: string; p_student_id: string }
        Returns: {
          total: number
          workout_id: string
        }[]
      }
    }
    Enums: {
      appointment_status: "agendada" | "realizada" | "faltou" | "cancelada"
      body_region: "braco" | "peito" | "cintura" | "quadril" | "coxa"
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
      post_visibility: "personal" | "publico"
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
      appointment_status: ["agendada", "realizada", "faltou", "cancelada"],
      body_region: ["braco", "peito", "cintura", "quadril", "coxa"],
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
      post_visibility: ["personal", "publico"],
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
