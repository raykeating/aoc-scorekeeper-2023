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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          github_url?: string | null
          id?: number
          is_completed?: boolean
          is_using_copilot: boolean
          language_id: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          github_url?: string | null
          id?: number
          is_completed?: boolean
          is_using_copilot?: boolean
          language_id?: number
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
      get_random_language: {
        Args: {
          selecteddifficulty: string
        }
        Returns: number
      }
      get_submission_count: {
        Args: {
          lang: number
        }
        Returns: number
      }
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
