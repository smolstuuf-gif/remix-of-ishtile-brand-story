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
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          facebook_url: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          is_active: boolean
          logo_url: string | null
          motto: string | null
          name: string
          slug: string
          social_links: Json
          sort_order: number
          updated_at: string
          video_url: string | null
          website_url: string | null
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          motto?: string | null
          name: string
          slug: string
          social_links?: Json
          sort_order?: number
          updated_at?: string
          video_url?: string | null
          website_url?: string | null
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          motto?: string | null
          name?: string
          slug?: string
          social_links?: Json
          sort_order?: number
          updated_at?: string
          video_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      collection_products: {
        Row: {
          collection_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          campaign_label: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          show_homepage: boolean
          slug: string
          sort_order: number
          starts_at: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          campaign_label?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          show_homepage?: boolean
          slug: string
          sort_order?: number
          starts_at?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          campaign_label?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          show_homepage?: boolean
          slug?: string
          sort_order?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string
          delivery_address: string
          email: string | null
          full_name: string
          id: string
          mobile_number: string
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          delivery_address: string
          email?: string | null
          full_name: string
          id?: string
          mobile_number: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          delivery_address?: string
          email?: string | null
          full_name?: string
          id?: string
          mobile_number?: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          mobile_image_url: string | null
          mobile_video_url: string | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          mobile_image_url?: string | null
          mobile_video_url?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          mobile_image_url?: string | null
          mobile_video_url?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      lookbook_look_products: {
        Row: {
          created_at: string
          default_color: string | null
          default_quantity: number
          default_size: string | null
          look_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          default_color?: string | null
          default_quantity?: number
          default_size?: string | null
          look_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          default_color?: string | null
          default_quantity?: number
          default_size?: string | null
          look_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "lookbook_look_products_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "lookbook_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookbook_look_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lookbook_looks: {
        Row: {
          alt_text: string | null
          collection_id: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          season: string | null
          slug: string
          sort_order: number
          starts_at: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          alt_text?: string | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          season?: string | null
          slug: string
          sort_order?: number
          starts_at?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          alt_text?: string | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          season?: string | null
          slug?: string
          sort_order?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookbook_looks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          brand_name: string
          color: string | null
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          season: string | null
          size: string | null
          unit_price: number
        }
        Insert: {
          brand_name: string
          color?: string | null
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          season?: string | null
          size?: string | null
          unit_price: number
        }
        Update: {
          brand_name?: string
          color?: string | null
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          season?: string | null
          size?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          fulfillment_status: string
          id: string
          order_number: string
          payment_method: string
          payment_status: string
          shipping_address: string
          shipping_city: string | null
          shipping_fee: number
          shipping_postal: string | null
          special_note: string | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          fulfillment_status?: string
          id?: string
          order_number: string
          payment_method: string
          payment_status?: string
          shipping_address: string
          shipping_city?: string | null
          shipping_fee?: number
          shipping_postal?: string | null
          special_note?: string | null
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          fulfillment_status?: string
          id?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          shipping_address?: string
          shipping_city?: string | null
          shipping_fee?: number
          shipping_postal?: string | null
          special_note?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand_id: string
          care_instructions: string | null
          category: string
          colors: Json
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          image_urls: string[]
          is_active: boolean
          is_featured: boolean
          is_out_of_stock: boolean
          name: string
          price: number
          size_guide: Json
          sizes: string[]
          sku: string | null
          slug: string
          stock_quantity: number | null
          tags: string[]
          updated_at: string
          video_url: string | null
        }
        Insert: {
          brand_id: string
          care_instructions?: string | null
          category: string
          colors?: Json
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          is_active?: boolean
          is_featured?: boolean
          is_out_of_stock?: boolean
          name: string
          price: number
          size_guide?: Json
          sizes?: string[]
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          tags?: string[]
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          brand_id?: string
          care_instructions?: string | null
          category?: string
          colors?: Json
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          is_active?: boolean
          is_featured?: boolean
          is_out_of_stock?: boolean
          name?: string
          price?: number
          size_guide?: Json
          sizes?: string[]
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          tags?: string[]
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      site_brand_info: {
        Row: {
          about_text: string | null
          address: string | null
          contact_numbers: string[]
          editorial_art_image_url: string | null
          editorial_fashion_image_url: string | null
          footer_band_image_url: string | null
          footer_building_image_url: string | null
          hero_autoplay_ms: number
          homepage_editorial_image_url: string | null
          homepage_summer_image_url: string | null
          id: number
          logo_url: string | null
          motto: string | null
          social_links: Json
          stores_image_url: string | null
          symbol_url: string | null
          updated_at: string
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          contact_numbers?: string[]
          editorial_art_image_url?: string | null
          editorial_fashion_image_url?: string | null
          footer_band_image_url?: string | null
          footer_building_image_url?: string | null
          hero_autoplay_ms?: number
          homepage_editorial_image_url?: string | null
          homepage_summer_image_url?: string | null
          id?: number
          logo_url?: string | null
          motto?: string | null
          social_links?: Json
          stores_image_url?: string | null
          symbol_url?: string | null
          updated_at?: string
        }
        Update: {
          about_text?: string | null
          address?: string | null
          contact_numbers?: string[]
          editorial_art_image_url?: string | null
          editorial_fashion_image_url?: string | null
          footer_band_image_url?: string | null
          footer_building_image_url?: string | null
          hero_autoplay_ms?: number
          homepage_editorial_image_url?: string | null
          homepage_summer_image_url?: string | null
          id?: number
          logo_url?: string | null
          motto?: string | null
          social_links?: Json
          stores_image_url?: string | null
          symbol_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_lookbook_look: {
        Args: { p_look: Json; p_products: Json }
        Returns: string
      }
      submit_store_order: {
        Args: { p_customer: Json; p_items: Json; p_payment_method: string }
        Returns: Json
      }
      admin_update_store_order: {
        Args: { p_order_id: string; p_order: Json; p_items: Json }
        Returns: undefined
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
    Enums: {},
  },
} as const
