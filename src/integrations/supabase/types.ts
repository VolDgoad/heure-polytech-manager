export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      course_elements: {
        Row: {
          created_at: string
          id: string
          name: string
          teaching_unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          teaching_unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          teaching_unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_elements_teaching_unit_id_fkey"
            columns: ["teaching_unit_id"]
            isOneToOne: false
            referencedRelation: "teaching_units"
            referencedColumns: ["id"]
          },
        ]
      }
      declarations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cm_hours: number
          course_element_id: string
          created_at: string
          declaration_date: string
          department_id: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["declaration_status"]
          td_hours: number
          teacher_id: string
          tp_hours: number
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cm_hours?: number
          course_element_id: string
          created_at?: string
          declaration_date?: string
          department_id: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["declaration_status"]
          td_hours?: number
          teacher_id: string
          tp_hours?: number
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cm_hours?: number
          course_element_id?: string
          created_at?: string
          declaration_date?: string
          department_id?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["declaration_status"]
          td_hours?: number
          teacher_id?: string
          tp_hours?: number
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "declarations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_course_element_id_fkey"
            columns: ["course_element_id"]
            isOneToOne: false
            referencedRelation: "course_elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      levels: {
        Row: {
          created_at: string
          id: string
          name: string
          program_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          program_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "levels_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          email: string
          first_name: string
          grade: Database["public"]["Enums"]["teacher_grade"] | null
          id: string
          last_name: string
          photo_url: string | null
          reset_token: string | null
          reset_token_expires_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          signature_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email: string
          first_name: string
          grade?: Database["public"]["Enums"]["teacher_grade"] | null
          id: string
          last_name: string
          photo_url?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          signature_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string
          first_name?: string
          grade?: Database["public"]["Enums"]["teacher_grade"] | null
          id?: string
          last_name?: string
          photo_url?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          signature_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          department_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      semesters: {
        Row: {
          created_at: string
          id: string
          level_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "semesters_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      teaching_units: {
        Row: {
          created_at: string
          id: string
          name: string
          semester_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          semester_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          semester_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_units_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      declaration_status:
        | "brouillon"
        | "soumise"
        | "verifiee"
        | "validee"
        | "rejetee"
        | "approuvee"
      payment_status: "non_paye" | "en_cours" | "paye"
      teacher_grade:
        | "Professeur Titulaire des Universités"
        | "Maitre de Conférences Assimilé"
        | "Maitre de Conférences Assimilé Stagiaire"
        | "Maitre de Conférences Titulaire"
        | "Maitre-assistant"
        | "Assistant de Deuxième Classe"
        | "Assistant dispensant des Cours Magistraux"
        | "Assistant ne dispensant pas de Cours Magistraux"
      user_role:
        | "enseignant"
        | "chef_departement"
        | "directrice_etudes"
        | "scolarite"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      declaration_status: [
        "brouillon",
        "soumise",
        "verifiee",
        "validee",
        "rejetee",
        "approuvee",
      ],
      payment_status: ["non_paye", "en_cours", "paye"],
      teacher_grade: [
        "Professeur Titulaire des Universités",
        "Maitre de Conférences Assimilé",
        "Maitre de Conférences Assimilé Stagiaire",
        "Maitre de Conférences Titulaire",
        "Maitre-assistant",
        "Assistant de Deuxième Classe",
        "Assistant dispensant des Cours Magistraux",
        "Assistant ne dispensant pas de Cours Magistraux",
      ],
      user_role: [
        "enseignant",
        "chef_departement",
        "directrice_etudes",
        "scolarite",
        "admin",
      ],
    },
  },
} as const
