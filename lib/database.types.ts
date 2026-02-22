export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          id: string
          min_age: number | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_age?: number | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          min_age?: number | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          match_id: string | null
          minute: number | null
          notes: string | null
          player_id: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          match_id?: string | null
          minute?: number | null
          notes?: string | null
          player_id?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          match_id?: string | null
          minute?: number | null
          notes?: string | null
          player_id?: string | null
          team_id?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string | null
          field_number: number | null
          home_score: number | null
          home_team_id: string | null
          id: string
          match_date: string | null
          match_time: string | null
          round_id: string | null
          stage_id: string | null
          status: string | null
          tournament_id: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          field_number?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_date?: string | null
          match_time?: string | null
          round_id?: string | null
          stage_id?: string | null
          status?: string | null
          tournament_id?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          field_number?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_date?: string | null
          match_time?: string | null
          round_id?: string | null
          stage_id?: string | null
          status?: string | null
          tournament_id?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string | null
          id: string
          is_captain: boolean | null
          name: string
          nickname: string | null
          position: string | null
          shirt_number: number | null
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_captain?: boolean | null
          name: string
          nickname?: string | null
          position?: string | null
          shirt_number?: number | null
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_captain?: boolean | null
          name?: string
          nickname?: string | null
          position?: string | null
          shirt_number?: number | null
          team_id?: string | null
        }
        Relationships: []
      }
      rounds: {
        Row: {
          date: string | null
          id: string
          name: string | null
          round_number: number
          stage_id: string | null
          tournament_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          name?: string | null
          round_number: number
          stage_id?: string | null
          tournament_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          name?: string | null
          round_number?: number
          stage_id?: string | null
          tournament_id?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      stages: {
        Row: {
          id: string
          name: string
          order_num: number
          slug: string
          tournament_id: string | null
          type: string
        }
        Insert: {
          id?: string
          name: string
          order_num: number
          slug: string
          tournament_id?: string | null
          type: string
        }
        Update: {
          id?: string
          name?: string
          order_num?: number
          slug?: string
          tournament_id?: string | null
          type?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          group_name: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          short_name: string | null
          sponsor_id: string | null
          tournament_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          short_name?: string | null
          sponsor_id?: string | null
          tournament_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          short_name?: string | null
          sponsor_id?: string | null
          tournament_id?: string | null
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          category_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          semester: number
          slug: string
          start_date: string | null
          status: string | null
          year: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          semester: number
          slug: string
          start_date?: string | null
          status?: string | null
          year: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          semester?: number
          slug?: string
          start_date?: string | null
          status?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      standings: {
        Row: {
          draws: number | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          group_name: string | null
          logo_url: string | null
          losses: number | null
          played: number | null
          points: number | null
          primary_color: string | null
          short_name: string | null
          team_id: string | null
          team_name: string | null
          tournament_id: string | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> =
  (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
