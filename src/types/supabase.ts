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
      profiles: {
        Row: {
          id: number
          user_id: string
          telegram_id: string | null
          username: string
          avatar_url: string | null
          rating: number | null
          wins: number | null
          losses: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          telegram_id?: string | null
          username: string
          avatar_url?: string | null
          rating?: number | null
          wins?: number | null
          losses?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          telegram_id?: string | null
          username?: string
          avatar_url?: string | null
          rating?: number | null
          wins?: number | null
          losses?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: number
          game_uuid: string
          player1_id: string
          player2_id: string | null
          current_turn: string | null
          winner_id: string | null
          status: 'waiting' | 'active' | 'finished'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          game_uuid?: string
          player1_id: string
          player2_id?: string | null
          current_turn?: string | null
          winner_id?: string | null
          status?: 'waiting' | 'active' | 'finished'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          game_uuid?: string
          player1_id?: string
          player2_id?: string | null
          current_turn?: string | null
          winner_id?: string | null
          status?: 'waiting' | 'active' | 'finished'
          created_at?: string
          updated_at?: string
        }
      }
      moves: {
        Row: {
          id: number
          game_id: number
          player_id: string
          move_type: 'move' | 'wall'
          row_from: number | null
          col_from: number | null
          row_to: number | null
          col_to: number | null
          created_at: string
        }
        Insert: {
          id?: number
          game_id: number
          player_id: string
          move_type: 'move' | 'wall'
          row_from?: number | null
          col_from?: number | null
          row_to?: number | null
          col_to?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          game_id?: number
          player_id?: string
          move_type?: 'move' | 'wall'
          row_from?: number | null
          col_from?: number | null
          row_to?: number | null
          col_to?: number | null
          created_at?: string
        }
      }
      walls: {
        Row: {
          id: number
          game_id: number
          player_id: string
          row_pos: number
          col_pos: number
          orientation: 'horizontal' | 'vertical'
          created_at: string
        }
        Insert: {
          id?: number
          game_id: number
          player_id: string
          row_pos: number
          col_pos: number
          orientation: 'horizontal' | 'vertical'
          created_at?: string
        }
        Update: {
          id?: number
          game_id?: number
          player_id?: string
          row_pos?: number
          col_pos?: number
          orientation?: 'horizontal' | 'vertical'
          created_at?: string
        }
      }
    }
    Views: {
      player_state: {
        Row: {
          game_id: number
          game_uuid: string
          status: 'waiting' | 'active' | 'finished'
          current_turn: string | null
          winner_id: string | null
          player1_id: string | null
          player1_username: string | null
          player2_id: string | null
          player2_username: string | null
          player1_walls_used: number
          player2_walls_used: number
          player1_position: Json | null
          player2_position: Json | null
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      handle_updated_at: {
        Args: Record<string, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 