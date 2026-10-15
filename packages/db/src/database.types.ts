// Hand-written to match supabase/migrations until the local stack can run.
// Regenerate with `npm run db:types` (requires Docker + `supabase start`) and
// this file will be replaced by the generated version.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Timestamp = string

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; created_at: Timestamp; updated_at: Timestamp }
        Insert: { id: string; display_name?: string | null; created_at?: Timestamp; updated_at?: Timestamp }
        Update: { id?: string; display_name?: string | null; created_at?: Timestamp; updated_at?: Timestamp }
        Relationships: []
      }
      titles: {
        Row: {
          id: string
          slug: string
          kind: Database['public']['Enums']['title_kind']
          name: string
          synopsis: string | null
          poster_url: string | null
          backdrop_url: string | null
          release_year: number | null
          maturity_rating: string | null
          genres: string[]
          is_free: boolean
          is_featured: boolean
          published_at: Timestamp | null
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: {
          id?: string
          slug: string
          kind?: Database['public']['Enums']['title_kind']
          name: string
          synopsis?: string | null
          poster_url?: string | null
          backdrop_url?: string | null
          release_year?: number | null
          maturity_rating?: string | null
          genres?: string[]
          is_free?: boolean
          is_featured?: boolean
          published_at?: Timestamp | null
          created_at?: Timestamp
          updated_at?: Timestamp
        }
        Update: Partial<Database['public']['Tables']['titles']['Insert']>
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          title_id: string
          season_number: number | null
          episode_number: number | null
          name: string
          synopsis: string | null
          duration_seconds: number | null
          status: Database['public']['Enums']['video_status']
          mux_upload_id: string | null
          mux_asset_id: string | null
          mux_playback_id: string | null
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: {
          id?: string
          title_id: string
          season_number?: number | null
          episode_number?: number | null
          name: string
          synopsis?: string | null
          duration_seconds?: number | null
          status?: Database['public']['Enums']['video_status']
          mux_upload_id?: string | null
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          created_at?: Timestamp
          updated_at?: Timestamp
        }
        Update: Partial<Database['public']['Tables']['videos']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'videos_title_id_fkey'
            columns: ['title_id']
            isOneToOne: false
            referencedRelation: 'titles'
            referencedColumns: ['id']
          },
        ]
      }
      plans: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          price_minor: number
          currency: string
          period_days: number
          is_active: boolean
          created_at: Timestamp
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          price_minor: number
          currency?: string
          period_days: number
          is_active?: boolean
          created_at?: Timestamp
        }
        Update: Partial<Database['public']['Tables']['plans']['Insert']>
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: Database['public']['Enums']['subscription_status']
          provider: string
          provider_reference: string | null
          current_period_end: Timestamp | null
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: Database['public']['Enums']['subscription_status']
          provider: string
          provider_reference?: string | null
          current_period_end?: Timestamp | null
          created_at?: Timestamp
          updated_at?: Timestamp
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'subscriptions_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
        ]
      }
      watch_progress: {
        Row: {
          user_id: string
          video_id: string
          position_seconds: number
          completed: boolean
          updated_at: Timestamp
        }
        Insert: {
          user_id: string
          video_id: string
          position_seconds?: number
          completed?: boolean
          updated_at?: Timestamp
        }
        Update: Partial<Database['public']['Tables']['watch_progress']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'watch_progress_video_id_fkey'
            columns: ['video_id']
            isOneToOne: false
            referencedRelation: 'videos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      title_kind: 'movie' | 'series'
      video_status: 'waiting_upload' | 'processing' | 'ready' | 'errored'
      subscription_status: 'pending' | 'active' | 'cancelled' | 'expired'
    }
    CompositeTypes: { [_ in never]: never }
  }
}
