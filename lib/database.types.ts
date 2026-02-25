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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          min_age: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          min_age?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          min_age?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      match_events: {
        Row: {
          id: string
          match_id: string | null
          player_id: string | null
          team_id: string | null
          event_type: string
          minute: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id?: string | null
          player_id?: string | null
          team_id?: string | null
          event_type: string
          minute?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string | null
          player_id?: string | null
          team_id?: string | null
          event_type?: string
          minute?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "match_events_match_id_fkey"; columns: ["match_id"]; referencedRelation: "matches"; referencedColumns: ["id"] },
          { foreignKeyName: "match_events_player_id_fkey"; columns: ["player_id"]; referencedRelation: "players"; referencedColumns: ["id"] },
          { foreignKeyName: "match_events_team_id_fkey"; columns: ["team_id"]; referencedRelation: "teams"; referencedColumns: ["id"] },
        ]
      }
      matches: {
        Row: {
          id: string
          round_id: string | null
          tournament_id: string | null
          home_team_id: string | null
          away_team_id: string | null
          home_score: number | null
          away_score: number | null
          field_number: number | null
          match_time: string | null
          match_date: string | null
          status: string | null
          stage_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          round_id?: string | null
          tournament_id?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          field_number?: number | null
          match_time?: string | null
          match_date?: string | null
          status?: string | null
          stage_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          round_id?: string | null
          tournament_id?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          field_number?: number | null
          match_time?: string | null
          match_date?: string | null
          status?: string | null
          stage_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "matches_round_id_fkey"; columns: ["round_id"]; referencedRelation: "rounds"; referencedColumns: ["id"] },
          { foreignKeyName: "matches_tournament_id_fkey"; columns: ["tournament_id"]; referencedRelation: "tournaments"; referencedColumns: ["id"] },
          { foreignKeyName: "matches_home_team_id_fkey"; columns: ["home_team_id"]; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "matches_away_team_id_fkey"; columns: ["away_team_id"]; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "matches_stage_id_fkey"; columns: ["stage_id"]; referencedRelation: "stages"; referencedColumns: ["id"] },
        ]
      }
      players: {
        Row: {
          id: string
          name: string
          nickname: string | null
          position: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          nickname?: string | null
          position?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          position?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      team_players: {
        Row: {
          id: string
          team_id: string
          player_id: string
          tournament_id: string | null
          shirt_number: number | null
          is_captain: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          player_id: string
          tournament_id?: string | null
          shirt_number?: number | null
          is_captain?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          player_id?: string
          tournament_id?: string | null
          shirt_number?: number | null
          is_captain?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "team_players_team_id_fkey"; columns: ["team_id"]; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "team_players_player_id_fkey"; columns: ["player_id"]; referencedRelation: "players"; referencedColumns: ["id"] },
          { foreignKeyName: "team_players_tournament_id_fkey"; columns: ["tournament_id"]; referencedRelation: "tournaments"; referencedColumns: ["id"] },
        ]
      }
      rounds: {
        Row: {
          id: string
          stage_id: string | null
          tournament_id: string | null
          round_number: number
          date: string | null
          name: string | null
        }
        Insert: {
          id?: string
          stage_id?: string | null
          tournament_id?: string | null
          round_number: number
          date?: string | null
          name?: string | null
        }
        Update: {
          id?: string
          stage_id?: string | null
          tournament_id?: string | null
          round_number?: number
          date?: string | null
          name?: string | null
        }
        Relationships: [
          { foreignKeyName: "rounds_stage_id_fkey"; columns: ["stage_id"]; referencedRelation: "stages"; referencedColumns: ["id"] },
          { foreignKeyName: "rounds_tournament_id_fkey"; columns: ["tournament_id"]; referencedRelation: "tournaments"; referencedColumns: ["id"] },
        ]
      }
      stages: {
        Row: {
          id: string
          tournament_id: string | null
          name: string
          slug: string
          order_num: number
          type: string
        }
        Insert: {
          id?: string
          tournament_id?: string | null
          name: string
          slug: string
          order_num: number
          type: string
        }
        Update: {
          id?: string
          tournament_id?: string | null
          name?: string
          slug?: string
          order_num?: number
          type?: string
        }
        Relationships: [
          { foreignKeyName: "stages_tournament_id_fkey"; columns: ["tournament_id"]; referencedRelation: "tournaments"; referencedColumns: ["id"] },
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          short_name: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      tournament_teams: {
        Row: {
          id: string
          tournament_id: string
          team_id: string
          group_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tournament_id: string
          team_id: string
          group_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tournament_id?: string
          team_id?: string
          group_name?: string | null
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "tournament_teams_tournament_id_fkey"; columns: ["tournament_id"]; referencedRelation: "tournaments"; referencedColumns: ["id"] },
          { foreignKeyName: "tournament_teams_team_id_fkey"; columns: ["team_id"]; referencedRelation: "teams"; referencedColumns: ["id"] },
        ]
      }
      tournaments: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          year: number
          semester: number
          status: string | null
          start_date: string | null
          end_date: string | null
          location: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          year: number
          semester: number
          status?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          year?: number
          semester?: number
          status?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "tournaments_category_id_fkey"; columns: ["category_id"]; referencedRelation: "categories"; referencedColumns: ["id"] },
        ]
      }
    }
    Views: {
      standings: {
        Row: {
          team_id: string | null
          tournament_id: string | null
          team_name: string | null
          short_name: string | null
          group_name: string | null
          logo_url: string | null
          primary_color: string | null
          played: number | null
          wins: number | null
          draws: number | null
          losses: number | null
          goals_for: number | null
          goals_against: number | null
          goal_difference: number | null
          points: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience helpers
type PublicSchema = Database["public"]

export type Tables<T extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])> =
  (PublicSchema["Tables"] & PublicSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T] extends { Update: infer U } ? U : never
