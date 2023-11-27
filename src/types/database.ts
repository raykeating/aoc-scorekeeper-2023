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
      Submission: {
        Row: {
          created_at: string
          github_url: string | null
          id: number
          is_completed: boolean
          is_using_copilot: boolean
          language_id: number
          part_1_completed: boolean | null
          part_2_completed: boolean | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          github_url?: string | null
          id?: number
          is_completed?: boolean
          is_using_copilot: boolean
          language_id: number
          part_1_completed?: boolean | null
          part_2_completed?: boolean | null
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
          part_1_completed?: boolean | null
          part_2_completed?: boolean | null
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
          user_metadata: Json | null
        }
        Insert: {
          created_at?: string
          id: string
          user_metadata?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          user_metadata?: Json | null
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
