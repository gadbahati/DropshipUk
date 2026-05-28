export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activation_payments: {
        Row: {
          amount_kes: number
          amount_usd: number
          created_at: string | null
          id: string
          payment_method: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_kes?: number
          amount_usd?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_kes?: number
          amount_usd?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          is_read: boolean | null
          message: string
          payment_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          is_read?: boolean | null
          message: string
          payment_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          is_read?: boolean | null
          message?: string
          payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "required_item_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_paid: number
          booking_percentage: number | null
          created_at: string | null
          id: string
          is_paid: boolean | null
          level: Database["public"]["Enums"]["booking_level"]
          outcome_amount: number
          payment_method: string | null
          status: Database["public"]["Enums"]["shipment_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          booking_percentage?: number | null
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          level: Database["public"]["Enums"]["booking_level"]
          outcome_amount: number
          payment_method?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          booking_percentage?: number | null
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          level?: Database["public"]["Enums"]["booking_level"]
          outcome_amount?: number
          payment_method?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dropship_applications: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_complete: boolean | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_complete?: boolean | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_complete?: boolean | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dropship_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_payments: {
        Row: {
          account_identifier: string
          amount_paid: number
          created_at: string
          id: string
          package_level: string
          payment_date: string
          status: string
          transaction_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_identifier: string
          amount_paid: number
          created_at?: string
          id?: string
          package_level: string
          payment_date?: string
          status?: string
          transaction_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_identifier?: string
          amount_paid?: number
          created_at?: string
          id?: string
          package_level?: string
          payment_date?: string
          status?: string
          transaction_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      membership_subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_refundable: boolean | null
          payment_method: string | null
          subscribed_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_refundable?: boolean | null
          payment_method?: string | null
          subscribed_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_refundable?: boolean | null
          payment_method?: string | null
          subscribed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          membership_id: string | null
          metadata: Json | null
          payment_method: string
          payment_provider: string
          provider_reference: string | null
          provider_transaction_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          membership_id?: string | null
          metadata?: Json | null
          payment_method: string
          payment_provider: string
          provider_reference?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          membership_id?: string | null
          metadata?: Json | null
          payment_method?: string
          payment_provider?: string
          provider_reference?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "membership_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_verifications: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          payment_reason: string
          payment_type: string
          transaction_code: string
          user_id: string
          verification_due_at: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          payment_reason: string
          payment_type: string
          transaction_code: string
          user_id: string
          verification_due_at: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          payment_reason?: string
          payment_type?: string
          transaction_code?: string
          user_id?: string
          verification_due_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_verifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activation_paid_at: string | null
          activation_status: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          payment_verified: boolean | null
          payment_verified_at: string | null
          phone: string | null
          updated_at: string | null
          verification_due_at: string | null
          verification_paid_at: string | null
          verification_pending: boolean | null
          verification_status: string | null
        }
        Insert: {
          activation_paid_at?: string | null
          activation_status?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          payment_verified?: boolean | null
          payment_verified_at?: string | null
          phone?: string | null
          updated_at?: string | null
          verification_due_at?: string | null
          verification_paid_at?: string | null
          verification_pending?: boolean | null
          verification_status?: string | null
        }
        Update: {
          activation_paid_at?: string | null
          activation_status?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          payment_verified?: boolean | null
          payment_verified_at?: string | null
          phone?: string | null
          updated_at?: string | null
          verification_due_at?: string | null
          verification_paid_at?: string | null
          verification_pending?: boolean | null
          verification_status?: string | null
        }
        Relationships: []
      }
      required_item_payments: {
        Row: {
          amount_kes: number
          amount_usd: number
          created_at: string | null
          gateway_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          required_item_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount_kes: number
          amount_usd: number
          created_at?: string | null
          gateway_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          required_item_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount_kes?: number
          amount_usd?: number
          created_at?: string | null
          gateway_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          required_item_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "required_item_payments_required_item_id_fkey"
            columns: ["required_item_id"]
            isOneToOne: false
            referencedRelation: "required_items"
            referencedColumns: ["id"]
          },
        ]
      }
      required_items: {
        Row: {
          amount_kes: number
          amount_usd: number
          created_at: string | null
          description: string
          id: string
          key: string
          order_index: number
          type: Database["public"]["Enums"]["required_item_type"]
        }
        Insert: {
          amount_kes?: number
          amount_usd?: number
          created_at?: string | null
          description: string
          id?: string
          key: string
          order_index: number
          type: Database["public"]["Enums"]["required_item_type"]
        }
        Update: {
          amount_kes?: number
          amount_usd?: number
          created_at?: string | null
          description?: string
          id?: string
          key?: string
          order_index?: number
          type?: Database["public"]["Enums"]["required_item_type"]
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          description: string | null
          id: string
          payment_method: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_required_item_status: {
        Row: {
          created_at: string | null
          id: string
          required_item_id: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          required_item_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          required_item_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_required_item_status_required_item_id_fkey"
            columns: ["required_item_id"]
            isOneToOne: false
            referencedRelation: "required_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_payments: {
        Row: {
          amount_kes: number
          amount_usd: number
          created_at: string | null
          id: string
          payment_method: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_kes?: number
          amount_usd?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_kes?: number
          amount_usd?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          id: string
          pending_withdrawal: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          pending_withdrawal?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          id?: string
          pending_withdrawal?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          admin_note: string | null
          amount: number
          client_note: string | null
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
          user_id: string
          withdraw_code: string | null
        }
        Insert: {
          admin_note?: string | null
          amount: number
          client_note?: string | null
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
          withdraw_code?: string | null
        }
        Update: {
          admin_note?: string | null
          amount?: number
          client_note?: string | null
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          withdraw_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super_admin"
      booking_level: "beginner" | "standard" | "expert"
      payment_status: "pending" | "paid" | "waived" | "rejected"
      required_item_type:
        | "refund"
        | "verification_code"
        | "processing_fee"
        | "membership_fee"
      shipment_status: "pending" | "in_transit" | "delivered" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "super_admin"],
      booking_level: ["beginner", "standard", "expert"],
      payment_status: ["pending", "paid", "waived", "rejected"],
      required_item_type: [
        "refund",
        "verification_code",
        "processing_fee",
        "membership_fee",
      ],
      shipment_status: ["pending", "in_transit", "delivered", "cancelled"],
    },
  },
} as const
