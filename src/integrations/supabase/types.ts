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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      club_accounts: {
        Row: {
          created_at: string
          email: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      club_points: {
        Row: {
          created_at: string
          order_id: string
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string
          order_id: string
          points: number
          user_id: string
        }
        Update: {
          created_at?: string
          order_id?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      club_redemptions: {
        Row: {
          balance_after: number
          benefit: string
          created_at: string
          customer_email: string
          customer_name: string
          fulfilled: boolean
          id: string
          points: number
          purchases: Json
          reward_id: string | null
          reward_name: string
          user_id: string
        }
        Insert: {
          balance_after: number
          benefit: string
          created_at?: string
          customer_email: string
          customer_name: string
          fulfilled?: boolean
          id?: string
          points: number
          purchases?: Json
          reward_id?: string | null
          reward_name: string
          user_id: string
        }
        Update: {
          balance_after?: number
          benefit?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          fulfilled?: boolean
          id?: string
          points?: number
          purchases?: Json
          reward_id?: string | null
          reward_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "club_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      club_rewards: {
        Row: {
          active: boolean
          benefit: string
          created_at: string
          id: string
          name: string
          points: number
        }
        Insert: {
          active?: boolean
          benefit: string
          created_at?: string
          id?: string
          name: string
          points: number
        }
        Update: {
          active?: boolean
          benefit?: string
          created_at?: string
          id?: string
          name?: string
          points?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: Json
          created_at: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          address?: Json
          created_at?: string
          id?: string
          name: string
          phone?: string
        }
        Update: {
          address?: Json
          created_at?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string | null
          vehicle: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          vehicle?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          vehicle?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          due_date: string
          id: string
          paid: boolean
          supplier_id: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          description: string
          due_date?: string
          id?: string
          paid?: boolean
          supplier_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          paid?: boolean
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json
          change_for: string | null
          club_earned_points: number
          club_user_id: string | null
          created_at: string
          customer_name: string
          customer_whatsapp: string
          delivery: number
          discount: number
          driver_id: string | null
          id: string
          items: Json
          notes: string | null
          number: number
          payment_method: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address: Json
          change_for?: string | null
          club_earned_points?: number
          club_user_id?: string | null
          created_at?: string
          customer_name: string
          customer_whatsapp: string
          delivery?: number
          discount?: number
          driver_id?: string | null
          id?: string
          items: Json
          notes?: string | null
          number?: number
          payment_method: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: Json
          change_for?: string | null
          club_earned_points?: number
          club_user_id?: string | null
          created_at?: string
          customer_name?: string
          customer_whatsapp?: string
          delivery?: number
          discount?: number
          driver_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          number?: number
          payment_method?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string
          cost: number
          created_at: string
          description: string
          emoji: string
          featured: boolean
          id: string
          image_url: string | null
          items: string[]
          min_stock: number
          name: string
          old_price: number | null
          price: number
          sort_order: number
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          cost?: number
          created_at?: string
          description?: string
          emoji?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          items?: string[]
          min_stock?: number
          name: string
          old_price?: number | null
          price?: number
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          cost?: number
          created_at?: string
          description?: string
          emoji?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          items?: string[]
          min_stock?: number
          name?: string
          old_price?: number | null
          price?: number
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          kind: string
          note: string | null
          product_id: string
          qty: number
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          product_id: string
          qty: number
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          product_id?: string
          qty?: number
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      create_manual_sale: { Args: { payload: Json }; Returns: number }
      create_order: { Args: { payload: Json }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_club: { Args: never; Returns: undefined }
      order_statuses: {
        Args: { _numbers: number[] }
        Returns: {
          number: number
          status: string
        }[]
      }
      redeem_club_reward: { Args: { reward: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
