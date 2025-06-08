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
      api_usage: {
        Row: {
          id: string
          endpoint: string
          tokens_used: number
          cost: number
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          endpoint: string
          tokens_used: number
          cost: number
          timestamp?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          endpoint?: string
          tokens_used?: number
          cost?: number
          timestamp?: string
          metadata?: Json | null
        }
      }
      assets: {
        Row: {
          id: string
          file_path: string
          file_type: string
          associated_book: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_path: string
          file_type: string
          associated_book?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_path?: string
          file_type?: string
          associated_book?: string | null
          created_at?: string
        }
      }
      book_generations: {
        Row: {
          id: string
          title: string
          subtitle: string
          chapters: string[] | null
          content: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle: string
          chapters?: string[] | null
          content?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          chapters?: string[] | null
          content?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      download_logs: {
        Row: {
          id: string
          session_id: string | null
          book_title: string | null
          customer_email: string | null
          downloaded_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          book_title?: string | null
          customer_email?: string | null
          downloaded_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          book_title?: string | null
          customer_email?: string | null
          downloaded_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number | null
          stripe_product_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price?: number | null
          stripe_product_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number | null
          stripe_product_id?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          payment_status: string
          download_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          payment_status?: string
          download_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          payment_status?: string
          download_token?: string | null
          created_at?: string
        }
      }
      title_votes: {
        Row: {
          id: string
          title_id: string
          voter_ip: string | null
          voted_at: string
        }
        Insert: {
          id?: string
          title_id: string
          voter_ip?: string | null
          voted_at?: string
        }
        Update: {
          id?: string
          title_id?: string
          voter_ip?: string | null
          voted_at?: string
        }
      }
      user_generated_titles: {
        Row: {
          id: string
          title: string
          subtitle: string
          generated_at: string
          submitter_ip: string | null
          is_approved: boolean
          vote_count: number
        }
        Insert: {
          id?: string
          title: string
          subtitle: string
          generated_at?: string
          submitter_ip?: string | null
          is_approved?: boolean
          vote_count?: number
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          generated_at?: string
          submitter_ip?: string | null
          is_approved?: boolean
          vote_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_global_generation_rate_limit: {
        Args: {
          p_max_per_hour?: number
        }
        Returns: boolean
      }
      check_user_generation_rate_limit: {
        Args: {
          p_submitter_ip: string
          p_max_per_day?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']