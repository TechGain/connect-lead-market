
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
      leads: {
        Row: {
          id: string
          type: string
          location: string
          description: string
          price: number
          quality_rating: number
          status: 'new' | 'pending' | 'sold'
          seller_id: string
          buyer_id: string | null
          created_at: string
          purchased_at: string | null
          contact_name: string
          contact_email: string
          contact_phone: string
        }
        Insert: {
          id?: string
          type: string
          location: string
          description: string
          price: number
          quality_rating: number
          status: 'new' | 'pending' | 'sold'
          seller_id: string
          buyer_id?: string | null
          created_at?: string
          purchased_at?: string | null
          contact_name: string
          contact_email: string
          contact_phone: string
        }
        Update: {
          id?: string
          type?: string
          location?: string
          description?: string
          price?: number
          quality_rating?: number
          status?: 'new' | 'pending' | 'sold'
          seller_id?: string
          buyer_id?: string | null
          created_at?: string
          purchased_at?: string | null
          contact_name?: string
          contact_email?: string
          contact_phone?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'seller' | 'buyer'
          company: string | null
          rating: number | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role: 'seller' | 'buyer'
          company?: string | null
          rating?: number | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'seller' | 'buyer'
          company?: string | null
          rating?: number | null
        }
      }
      lead_ratings: {
        Row: {
          id: string
          lead_id: string
          buyer_id: string
          rating: number
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          buyer_id: string
          rating: number
          review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          buyer_id?: string
          rating?: number
          review?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
