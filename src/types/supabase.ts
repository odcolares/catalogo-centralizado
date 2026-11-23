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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          icon: string
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          icon?: string
          id: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_engagement: {
        Row: {
          created_at: string
          event_type: string
          id: number
          product_id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          product_id: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          product_id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      product_suppliers: {
        Row: {
          cost: number
          is_preferred: boolean | null
          lead_time_days: number | null
          min_order_qty: number | null
          product_id: string
          supplier_id: string
          supplier_sku: string | null
        }
        Insert: {
          cost: number
          is_preferred?: boolean | null
          lead_time_days?: number | null
          min_order_qty?: number | null
          product_id: string
          supplier_id: string
          supplier_sku?: string | null
        }
        Update: {
          cost?: number
          is_preferred?: boolean | null
          lead_time_days?: number | null
          min_order_qty?: number | null
          product_id?: string
          supplier_id?: string
          supplier_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string
          code: string
          cost: number
          created_at: string | null
          highlights: Json
          id: string
          image_url: string | null
          margin_target: number | null
          name: string
          price: number
          price_max: number | null
          qty_on_hand: number
          reorder_point: number | null
          sort_order: number | null
          status: string
          tags: Json
          track_stock: boolean
          updated_at: string | null
          updated_by: string
          visible_to_client: boolean
        }
        Insert: {
          barcode?: string | null
          category_id: string
          code: string
          cost?: number
          created_at?: string | null
          highlights?: Json
          id: string
          image_url?: string | null
          margin_target?: number | null
          name: string
          price?: number
          price_max?: number | null
          qty_on_hand?: number
          reorder_point?: number | null
          sort_order?: number | null
          status?: string
          tags?: Json
          track_stock?: boolean
          updated_at?: string | null
          updated_by?: string
          visible_to_client?: boolean
        }
        Update: {
          barcode?: string | null
          category_id?: string
          code?: string
          cost?: number
          created_at?: string | null
          highlights?: Json
          id?: string
          image_url?: string | null
          margin_target?: number | null
          name?: string
          price?: number
          price_max?: number | null
          qty_on_hand?: number
          reorder_point?: number | null
          sort_order?: number | null
          status?: string
          tags?: Json
          track_stock?: boolean
          updated_at?: string | null
          updated_by?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          batch_number: string | null
          created_at: string | null
          created_by: string
          expiry_date: string | null
          from_location_id: string | null
          id: number
          notes: string | null
          product_id: string
          qty: number
          reason_code: string | null
          reference_doc: string | null
          reference_id: string | null
          subtype: string | null
          to_location_id: string | null
          type: string
          unit_cost: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          created_by: string
          expiry_date?: string | null
          from_location_id?: string | null
          id?: number
          notes?: string | null
          product_id: string
          qty: number
          reason_code?: string | null
          reference_doc?: string | null
          reference_id?: string | null
          subtype?: string | null
          to_location_id?: string | null
          type: string
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          created_by?: string
          expiry_date?: string | null
          from_location_id?: string | null
          id?: number
          notes?: string | null
          product_id?: string
          qty?: number
          reason_code?: string | null
          reference_doc?: string | null
          reference_id?: string | null
          subtype?: string | null
          to_location_id?: string | null
          type?: string
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
          contact: string | null
          created_at: string | null
          email: string | null
          id: string
          lead_time_days: number | null
          name: string
          phone: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          lead_time_days?: number | null
          name: string
          phone?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name?: string
          phone?: string | null
        }
        Relationships: []
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
