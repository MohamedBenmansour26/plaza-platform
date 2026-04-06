// ============================================================
// Plaza Platform — Supabase Database Types
// Auto-generated from: supabase gen types typescript --local
// Migration: 20260406000000_initial_schema
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// -------------------------------------------------------
// Enums
// -------------------------------------------------------

export type PaymentMethod = 'cod' | 'card_terminal' | 'card'
export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type OrderStatus   = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'
export type DeliveryType  = 'same_city' | 'inter_city'
export type DeliveryStatus = 'pending' | 'dispatched' | 'completed' | 'failed'

// -------------------------------------------------------
// Database shape (matches Supabase codegen output format)
// -------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id:          string
          user_id:     string
          store_name:  string
          store_slug:  string
          description: string | null
          logo_url:    string | null
          created_at:  string
        }
        Insert: {
          id?:         string
          user_id:     string
          store_name:  string
          store_slug:  string
          description?: string | null
          logo_url?:   string | null
          created_at?: string
        }
        Update: {
          id?:         string
          user_id?:    string
          store_name?: string
          store_slug?: string
          description?: string | null
          logo_url?:   string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'merchants_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      products: {
        Row: {
          id:             string
          merchant_id:    string
          name_fr:        string
          name_ar:        string
          description_fr: string | null
          description_ar: string | null
          price:          number
          stock:          number
          image_url:      string | null
          is_active:      boolean
          created_at:     string
        }
        Insert: {
          id?:             string
          merchant_id:     string
          name_fr:         string
          name_ar:         string
          description_fr?: string | null
          description_ar?: string | null
          price:           number
          stock?:          number
          image_url?:      string | null
          is_active?:      boolean
          created_at?:     string
        }
        Update: {
          id?:             string
          merchant_id?:    string
          name_fr?:        string
          name_ar?:        string
          description_fr?: string | null
          description_ar?: string | null
          price?:          number
          stock?:          number
          image_url?:      string | null
          is_active?:      boolean
          created_at?:     string
        }
        Relationships: [
          {
            foreignKeyName: 'products_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: false
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id:               string
          merchant_id:      string
          customer_name:    string
          customer_phone:   string
          customer_address: string
          total_amount:     number
          payment_method:   PaymentMethod
          payment_status:   PaymentStatus
          status:           OrderStatus
          created_at:       string
        }
        Insert: {
          id?:               string
          merchant_id:       string
          customer_name:     string
          customer_phone:    string
          customer_address:  string
          total_amount:      number
          payment_method:    PaymentMethod
          payment_status?:   PaymentStatus
          status?:           OrderStatus
          created_at?:       string
        }
        Update: {
          id?:               string
          merchant_id?:      string
          customer_name?:    string
          customer_phone?:   string
          customer_address?: string
          total_amount?:     number
          payment_method?:   PaymentMethod
          payment_status?:   PaymentStatus
          status?:           OrderStatus
          created_at?:       string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: false
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          }
        ]
      }
      order_items: {
        Row: {
          id:         string
          order_id:   string
          product_id: string
          quantity:   number
          unit_price: number
        }
        Insert: {
          id?:        string
          order_id:   string
          product_id: string
          quantity:   number
          unit_price: number
        }
        Update: {
          id?:        string
          order_id?:  string
          product_id?: string
          quantity?:  number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      deliveries: {
        Row: {
          id:            string
          order_id:      string
          merchant_id:   string
          delivery_type: DeliveryType
          fee:           number
          status:        DeliveryStatus
          created_at:    string
        }
        Insert: {
          id?:           string
          order_id:      string
          merchant_id:   string
          delivery_type: DeliveryType
          fee:           number
          status?:       DeliveryStatus
          created_at?:   string
        }
        Update: {
          id?:            string
          order_id?:      string
          merchant_id?:   string
          delivery_type?: DeliveryType
          fee?:           number
          status?:        DeliveryStatus
          created_at?:    string
        }
        Relationships: [
          {
            foreignKeyName: 'deliveries_order_id_fkey'
            columns: ['order_id']
            isOneToOne: true
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'deliveries_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: false
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      payment_method:  PaymentMethod
      payment_status:  PaymentStatus
      order_status:    OrderStatus
      delivery_type:   DeliveryType
      delivery_status: DeliveryStatus
    }
    CompositeTypes: Record<string, never>
  }
}

// -------------------------------------------------------
// Convenience helpers (row types)
// -------------------------------------------------------

export type Merchant    = Database['public']['Tables']['merchants']['Row']
export type Product     = Database['public']['Tables']['products']['Row']
export type Order       = Database['public']['Tables']['orders']['Row']
export type OrderItem   = Database['public']['Tables']['order_items']['Row']
export type Delivery    = Database['public']['Tables']['deliveries']['Row']

export type MerchantInsert  = Database['public']['Tables']['merchants']['Insert']
export type ProductInsert   = Database['public']['Tables']['products']['Insert']
export type OrderInsert     = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type DeliveryInsert  = Database['public']['Tables']['deliveries']['Insert']

export type MerchantUpdate  = Database['public']['Tables']['merchants']['Update']
export type ProductUpdate   = Database['public']['Tables']['products']['Update']
export type OrderUpdate     = Database['public']['Tables']['orders']['Update']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']
export type DeliveryUpdate  = Database['public']['Tables']['deliveries']['Update']
