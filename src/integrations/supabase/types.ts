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
      chats: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      lead_ratings: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          lead_id: string
          rating: number
          review: string | null
          successful_sale: boolean | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          lead_id: string
          rating: number
          review?: string | null
          successful_sale?: boolean | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          rating?: number
          review?: string | null
          successful_sale?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_ratings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          appointment_time: string | null
          buyer_id: string | null
          buyer_name: string | null
          confirmation_status: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          expiration_warning_sent: boolean | null
          id: string
          location: string
          price: number
          purchased_at: string | null
          quality_rating: number | null
          seller_id: string
          seller_name: string | null
          status: string
          type: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          appointment_time?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          confirmation_status?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          expiration_warning_sent?: boolean | null
          id?: string
          location: string
          price: number
          purchased_at?: string | null
          quality_rating?: number | null
          seller_id: string
          seller_name?: string | null
          status?: string
          type: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          appointment_time?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          confirmation_status?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          expiration_warning_sent?: boolean | null
          id?: string
          location?: string
          price?: number
          purchased_at?: string | null
          quality_rating?: number | null
          seller_id?: string
          seller_name?: string | null
          status?: string
          type?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_name: string | null
          sender_type: string
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_name?: string | null
          sender_type: string
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_name?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_attempts: {
        Row: {
          attempt_count: number
          attempted_at: string
          completed_at: string | null
          created_at: string
          error_details: string | null
          function_response: Json | null
          id: string
          lead_id: string
          notification_type: string
          status: string
        }
        Insert: {
          attempt_count?: number
          attempted_at?: string
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          function_response?: Json | null
          id?: string
          lead_id: string
          notification_type: string
          status: string
        }
        Update: {
          attempt_count?: number
          attempted_at?: string
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          function_response?: Json | null
          id?: string
          lead_id?: string
          notification_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_attempts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string
          id: string
          phone: string | null
          rating: number | null
          referral_source: string | null
          role: string
          sms_notifications_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name: string
          id: string
          phone?: string | null
          rating?: number | null
          referral_source?: string | null
          role: string
          sms_notifications_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string
          id?: string
          phone?: string | null
          rating?: number | null
          referral_source?: string | null
          role?: string
          sms_notifications_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          buyer_id: string
          created_at: string
          id: string
          lead_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          buyer_id: string
          created_at?: string
          id?: string
          lead_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          buyer_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          email_notifications_enabled: boolean
          id: string
          preferred_lead_types: string[] | null
          preferred_locations: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications_enabled?: boolean
          id?: string
          preferred_lead_types?: string[] | null
          preferred_locations?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications_enabled?: boolean
          id?: string
          preferred_lead_types?: string[] | null
          preferred_locations?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_reset_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_buyer_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          full_name: string
          id: string
        }[]
      }
      get_notification_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_attempts: number
          successful_attempts: number
          failed_attempts: number
          pending_attempts: number
          success_rate: number
        }[]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_buyer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_owner: {
        Args: { record_user_id: string }
        Returns: boolean
      }
      is_seller: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_role: {
        Args: { role_to_check: string }
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
    Enums: {},
  },
} as const
