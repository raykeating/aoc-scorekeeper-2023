export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Language: {
        Row: {
          difficulty: string | null
          id: number
          name: string | null
        }
        Insert: {
          difficulty?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          difficulty?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      Score: {
        Row: {
          copilot: number
          created_at: string
          id: number
          part_1: number
          part_2: number
          placement: number
          total: number
          user_id: string | null
        }
        Insert: {
          copilot?: number
          created_at?: string
          id?: number
          part_1?: number
          part_2?: number
          placement?: number
          total?: number
          user_id?: string | null
        }
        Update: {
          copilot?: number
          created_at?: string
          id?: number
          part_1?: number
          part_2?: number
          placement?: number
          total?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Score_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Submission: {
        Row: {
          created_at: string
          github_url: string | null
          id: number
          is_completed: boolean
          is_using_copilot: boolean
          language_id: number
          part_1_completed: boolean
          part_2_completed: boolean
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          github_url?: string | null
          id?: number
          is_completed?: boolean
          is_using_copilot?: boolean
          language_id: number
          part_1_completed?: boolean
          part_2_completed?: boolean
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          github_url?: string | null
          id?: number
          is_completed?: boolean
          is_using_copilot?: boolean
          language_id?: number
          part_1_completed?: boolean
          part_2_completed?: boolean
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Submission_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "Language"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submission_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      User: {
        Row: {
          created_at: string
          id: string
          user_metadata: any
        }
        Insert: {
          created_at?: string
          id: string
          user_metadata?: any
        }
        Update: {
          created_at?: string
          id?: string
          user_metadata?: any
        }
        Relationships: [
          {
            foreignKeyName: "User_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Difficulty: "Easy" | "Medium" | "Hard"
      Status: "Not Started" | "In Progress" | "Complete" | "Raincheck"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
