// ============================================================
// Plaza Platform — Supabase Database Types
// Updated: 07 April 2026 — aligned to live schema (9-table migration)
//
// ⚠️  BREAKING CHANGES vs old PLZ-006 migration:
//   - orders: removed customer_name/phone/address/total_amount/payment_status
//             added order_number, customer_id (FK→customers), subtotal,
//             delivery_fee, plaza_commission, total, notes, updated_at
//   - products: renamed is_active→is_visible, description_fr/ar→description
//   - deliveries: removed merchant_id/delivery_type/fee
//                  added driver_id (FK→drivers), pickup_time, delivered_at
//   - New tables: customers, drivers, support_tickets, support_messages
//
// Files that need updating by their owners:
//   - app/store/[slug]/page.tsx         — uses is_active (now is_visible)
//   - app/dashboard/page.tsx            — uses customer_name, total_amount
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

export type PaymentMethod   = 'cod' | 'terminal' | 'card'
export type OrderStatus     = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'
export type DeliveryStatus  = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'failed'
export type TicketStatus    = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketCategory  = 'order_issue' | 'payment_issue' | 'technical' | 'other'

// -------------------------------------------------------
// Database shape
// -------------------------------------------------------

export type Database = {
  public: {
    Tables: {

      // ── Merchants ──────────────────────────────────────
      merchants: {
        Row: {
          id:                       string
          user_id:                  string
          store_name:               string
          store_slug:               string
          description:              string | null
          logo_url:                 string | null
          banner_url:               string | null
          primary_color:            string
          category:                 string | null
          is_online:                boolean
          delivery_free_threshold:  number | null
          created_at:               string
        }
        Insert: {
          id?:                      string
          user_id:                  string
          store_name:               string
          store_slug:               string
          description?:             string | null
          logo_url?:                string | null
          banner_url?:              string | null
          primary_color?:           string
          category?:                string | null
          is_online?:               boolean
          delivery_free_threshold?: number | null
          created_at?:              string
        }
        Update: {
          id?:                      string
          user_id?:                 string
          store_name?:              string
          store_slug?:              string
          description?:             string | null
          logo_url?:                string | null
          banner_url?:              string | null
          primary_color?:           string
          category?:                string | null
          is_online?:               boolean
          delivery_free_threshold?: number | null
          created_at?:              string
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

      // ── Products ───────────────────────────────────────
      products: {
        Row: {
          id:          string
          merchant_id: string
          name_fr:     string
          name_ar:     string | null
          description: string | null
          price:       number
          stock:       number
          image_url:   string | null
          is_visible:  boolean
          created_at:  string
        }
        Insert: {
          id?:          string
          merchant_id:  string
          name_fr:      string
          name_ar?:     string | null
          description?: string | null
          price:        number
          stock?:       number
          image_url?:   string | null
          is_visible?:  boolean
          created_at?:  string
        }
        Update: {
          id?:          string
          merchant_id?: string
          name_fr?:     string
          name_ar?:     string | null
          description?: string | null
          price?:       number
          stock?:       number
          image_url?:   string | null
          is_visible?:  boolean
          created_at?:  string
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

      // ── Customers (anonymous buyers) ───────────────────
      customers: {
        Row: {
          id:         string
          full_name:  string
          phone:      string
          address:    string | null
          city:       string | null
          created_at: string
        }
        Insert: {
          id?:        string
          full_name:  string
          phone:      string
          address?:   string | null
          city?:      string | null
          created_at?: string
        }
        Update: {
          id?:        string
          full_name?: string
          phone?:     string
          address?:   string | null
          city?:      string | null
          created_at?: string
        }
        Relationships: []
      }

      // ── Orders ─────────────────────────────────────────
      orders: {
        Row: {
          id:               string
          order_number:     string
          merchant_id:      string
          customer_id:      string | null
          status:           OrderStatus
          payment_method:   PaymentMethod
          subtotal:         number
          delivery_fee:     number
          plaza_commission: number | null
          total:            number
          notes:            string | null
          created_at:       string
          updated_at:       string
        }
        Insert: {
          id?:               string
          order_number:      string
          merchant_id:       string
          customer_id?:      string | null
          status?:           OrderStatus
          payment_method?:   PaymentMethod
          subtotal:          number
          delivery_fee?:     number
          plaza_commission?: number | null
          total:             number
          notes?:            string | null
          created_at?:       string
          updated_at?:       string
        }
        Update: {
          id?:               string
          order_number?:     string
          merchant_id?:      string
          customer_id?:      string | null
          status?:           OrderStatus
          payment_method?:   PaymentMethod
          subtotal?:         number
          delivery_fee?:     number
          plaza_commission?: number | null
          total?:            number
          notes?:            string | null
          created_at?:       string
          updated_at?:       string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: false
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          }
        ]
      }

      // ── Order Items ────────────────────────────────────
      order_items: {
        Row: {
          id:         string
          order_id:   string
          product_id: string | null
          name_fr:    string
          quantity:   number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?:        string
          order_id:   string
          product_id?: string | null
          name_fr:    string
          quantity:   number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?:         string
          order_id?:   string
          product_id?: string | null
          name_fr?:    string
          quantity?:   number
          unit_price?: number
          created_at?: string
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

      // ── Drivers ────────────────────────────────────────
      drivers: {
        Row: {
          id:           string
          full_name:    string
          phone:        string
          is_available: boolean
          created_at:   string
        }
        Insert: {
          id?:           string
          full_name:     string
          phone:         string
          is_available?: boolean
          created_at?:   string
        }
        Update: {
          id?:           string
          full_name?:    string
          phone?:        string
          is_available?: boolean
          created_at?:   string
        }
        Relationships: []
      }

      // ── Deliveries ─────────────────────────────────────
      deliveries: {
        Row: {
          id:           string
          order_id:     string
          driver_id:    string | null
          pickup_time:  string | null
          delivered_at: string | null
          status:       DeliveryStatus
          created_at:   string
        }
        Insert: {
          id?:           string
          order_id:      string
          driver_id?:    string | null
          pickup_time?:  string | null
          delivered_at?: string | null
          status?:       DeliveryStatus
          created_at?:   string
        }
        Update: {
          id?:           string
          order_id?:     string
          driver_id?:    string | null
          pickup_time?:  string | null
          delivered_at?: string | null
          status?:       DeliveryStatus
          created_at?:   string
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
            foreignKeyName: 'deliveries_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          }
        ]
      }

      // ── Support Tickets ────────────────────────────────
      support_tickets: {
        Row: {
          id:            string
          ticket_number: string
          merchant_id:   string
          order_id:      string | null
          subject:       string
          category:      TicketCategory
          status:        TicketStatus
          created_at:    string
          updated_at:    string
        }
        Insert: {
          id?:            string
          ticket_number:  string
          merchant_id:    string
          order_id?:      string | null
          subject:        string
          category:       TicketCategory
          status?:        TicketStatus
          created_at?:    string
          updated_at?:    string
        }
        Update: {
          id?:            string
          ticket_number?: string
          merchant_id?:   string
          order_id?:      string | null
          subject?:       string
          category?:      TicketCategory
          status?:        TicketStatus
          created_at?:    string
          updated_at?:    string
        }
        Relationships: [
          {
            foreignKeyName: 'support_tickets_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: false
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'support_tickets_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }

      // ── Support Messages ───────────────────────────────
      support_messages: {
        Row: {
          id:             string
          ticket_id:      string
          sender:         'merchant' | 'plaza'
          content:        string
          attachment_url: string | null
          created_at:     string
        }
        Insert: {
          id?:             string
          ticket_id:       string
          sender:          'merchant' | 'plaza'
          content:         string
          attachment_url?: string | null
          created_at?:     string
        }
        Update: {
          id?:             string
          ticket_id?:      string
          sender?:         'merchant' | 'plaza'
          content?:        string
          attachment_url?: string | null
          created_at?:     string
        }
        Relationships: [
          {
            foreignKeyName: 'support_messages_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'support_tickets'
            referencedColumns: ['id']
          }
        ]
      }

    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      order_status:    OrderStatus
      payment_method:  PaymentMethod
      delivery_status: DeliveryStatus
      ticket_status:   TicketStatus
      ticket_category: TicketCategory
    }
    CompositeTypes: Record<string, never>
  }
}

// -------------------------------------------------------
// Convenience helpers (row types)
// -------------------------------------------------------

export type Merchant       = Database['public']['Tables']['merchants']['Row']
export type Product        = Database['public']['Tables']['products']['Row']
export type Customer       = Database['public']['Tables']['customers']['Row']
export type Order          = Database['public']['Tables']['orders']['Row']
export type OrderItem      = Database['public']['Tables']['order_items']['Row']
export type Driver         = Database['public']['Tables']['drivers']['Row']
export type Delivery       = Database['public']['Tables']['deliveries']['Row']
export type SupportTicket  = Database['public']['Tables']['support_tickets']['Row']
export type SupportMessage = Database['public']['Tables']['support_messages']['Row']

export type MerchantInsert      = Database['public']['Tables']['merchants']['Insert']
export type ProductInsert       = Database['public']['Tables']['products']['Insert']
export type CustomerInsert      = Database['public']['Tables']['customers']['Insert']
export type OrderInsert         = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert     = Database['public']['Tables']['order_items']['Insert']
export type DeliveryInsert      = Database['public']['Tables']['deliveries']['Insert']
export type SupportTicketInsert = Database['public']['Tables']['support_tickets']['Insert']
export type SupportMessageInsert = Database['public']['Tables']['support_messages']['Insert']

export type MerchantUpdate      = Database['public']['Tables']['merchants']['Update']
export type ProductUpdate       = Database['public']['Tables']['products']['Update']
export type OrderUpdate         = Database['public']['Tables']['orders']['Update']
export type DeliveryUpdate      = Database['public']['Tables']['deliveries']['Update']
export type SupportTicketUpdate = Database['public']['Tables']['support_tickets']['Update']
