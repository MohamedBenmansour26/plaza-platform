// ============================================================
// Plaza Platform — Supabase Database Types
// Updated: 15 April 2026 — PLZ-058 dispatch engine: dispatch_config, dispatch_errors,
//                           driver_schedules, new delivery columns, drivers.city
// Updated: 08 April 2026 — OTP auth columns + delivery_zones table (approved migrations)
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
export type DeliveryStatus  = 'available' | 'accepted' | 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'failed' | 'timed_out' | 'cancelled'
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
          // OTP auth columns (migration 2026-04-08)
          pin_hash:                 string | null
          recovery_email:           string | null
          otp_attempts:             number
          locked_until:             string | null
          phone:                    string | null
          // Onboarding checklist columns (migration 2026-04-08)
          city:                     string | null   // deprecated — use location_lat/lng
          // Store location — Mapbox map pin (migration 2026-04-10)
          location_lat:             number | null
          location_lng:             number | null
          location_description:     string | null
          // Payment guardrails (migration PLZ-043 — pending approval)
          terminal_enabled:         boolean
          phone_verified:           boolean
          // CMI per-merchant flag (migration PLZ-044 — pending approval)
          cmi_enabled:              boolean
          // Working hours (migration PLZ-049)
          working_hours:            Record<string, { open: boolean; from?: string; to?: string }> | null
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
          pin_hash?:                string | null
          recovery_email?:          string | null
          otp_attempts?:            number
          locked_until?:            string | null
          phone?:                   string | null
          city?:                    string | null
          location_lat?:            number | null
          location_lng?:            number | null
          location_description?:    string | null
          terminal_enabled?:        boolean
          phone_verified?:          boolean
          cmi_enabled?:             boolean
          working_hours?:           Record<string, { open: boolean; from?: string; to?: string }> | null
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
          pin_hash?:                string | null
          recovery_email?:          string | null
          otp_attempts?:            number
          locked_until?:            string | null
          phone?:                   string | null
          city?:                    string | null
          location_lat?:            number | null
          location_lng?:            number | null
          location_description?:    string | null
          terminal_enabled?:        boolean
          phone_verified?:          boolean
          cmi_enabled?:             boolean
          working_hours?:           Record<string, { open: boolean; from?: string; to?: string }> | null
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
          id:              string
          merchant_id:     string
          name_fr:         string
          name_ar:         string | null
          description:     string | null
          price:           number
          stock:           number
          image_url:       string | null
          // Multi-image gallery (migration 2026-04-23, PLZ-090a).
          // Backfilled from image_url: [{ url, alt: '' }]. Soft cap 8 enforced by check constraint.
          images:          { url: string; alt: string }[]
          is_visible:      boolean
          created_at:      string
          // 3-level product categories (migration 2026-04-10)
          category_l1:     string | null
          category_l2:     string | null
          category_l3:     string | null
          // Promotions (migration 2026-04-10)
          original_price:  number | null
          discount_active: boolean
        }
        Insert: {
          id?:              string
          merchant_id:      string
          name_fr:          string
          name_ar?:         string | null
          description?:     string | null
          price:            number
          stock?:           number
          image_url?:       string | null
          images?:          { url: string; alt: string }[]
          is_visible?:      boolean
          created_at?:      string
          category_l1?:     string | null
          category_l2?:     string | null
          category_l3?:     string | null
          original_price?:  number | null
          discount_active?: boolean
        }
        Update: {
          id?:              string
          merchant_id?:     string
          name_fr?:         string
          name_ar?:         string | null
          description?:     string | null
          price?:           number
          stock?:           number
          image_url?:       string | null
          images?:          { url: string; alt: string }[]
          is_visible?:      boolean
          created_at?:      string
          category_l1?:     string | null
          category_l2?:     string | null
          category_l3?:     string | null
          original_price?:  number | null
          discount_active?: boolean
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
          id:           string
          full_name:    string
          phone:        string
          address:      string | null
          city:         string | null
          created_at:   string
          // PLZ-058: dispatch engine — customer delivery coordinates
          location_lat: number | null
          location_lng: number | null
        }
        Insert: {
          id?:           string
          full_name:     string
          phone:         string
          address?:      string | null
          city?:         string | null
          created_at?:   string
          location_lat?: number | null
          location_lng?: number | null
        }
        Update: {
          id?:           string
          full_name?:    string
          phone?:        string
          address?:      string | null
          city?:         string | null
          created_at?:   string
          location_lat?: number | null
          location_lng?: number | null
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
          // PLZ-038: reception PIN + delivery scheduling (migration 2026-04-10)
          customer_pin:     number | null
          delivery_date:    string | null   // YYYY-MM-DD from Postgres date
          delivery_slot:    string | null   // format: "09:00-10:00"
          // PLZ-052/PLZ-056: merchant pickup code + status timestamps (applied 2026-04-14)
          merchant_pickup_code: number | null
          confirmed_at:     string | null
          dispatched_at:    string | null
          delivered_at:     string | null
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
          customer_pin?:     number | null
          delivery_date?:    string | null
          delivery_slot?:    string | null
          merchant_pickup_code?: number | null
          confirmed_at?:     string | null
          dispatched_at?:    string | null
          delivered_at?:     string | null
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
          customer_pin?:     number | null
          delivery_date?:    string | null
          delivery_slot?:    string | null
          merchant_pickup_code?: number | null
          confirmed_at?:     string | null
          dispatched_at?:    string | null
          delivered_at?:     string | null
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

      // ── Drivers ────────────────────────────────────────────────
      drivers: {
        Row: {
          id:                 string
          full_name:          string
          phone:              string
          is_available:       boolean
          created_at:         string
          // PLZ-057: auth + onboarding columns
          user_id:            string | null
          otp_attempts:       number
          locked_until:       string | null
          phone_verified:     boolean
          vehicle_type:       'moto' | 'velo' | 'voiture' | 'autre' | null
          license_photo_url:  string | null
          insurance_url:      string | null
          id_front_url:       string | null
          id_back_url:        string | null
          onboarding_status:  'pending_onboarding' | 'pending_validation' | 'active' | 'suspended' | 'rejected'
          // PLZ-058/059: dispatch engine + city column
          city:               string | null
          // PLZ-061: admin approval columns
          approval_status:    'pending' | 'approved' | 'rejected' | 'resubmit'
          approved_at:        string | null
          approved_by:        string | null
          rejection_reason:   string | null
          license_approved:   boolean
          insurance_approved: boolean
          id_front_approved:  boolean
          id_back_approved:   boolean
        }
        Insert: {
          id?:                 string
          full_name:           string
          phone:               string
          is_available?:       boolean
          created_at?:         string
          user_id?:            string | null
          otp_attempts?:       number
          locked_until?:       string | null
          phone_verified?:     boolean
          vehicle_type?:       'moto' | 'velo' | 'voiture' | 'autre' | null
          license_photo_url?:  string | null
          insurance_url?:      string | null
          id_front_url?:       string | null
          id_back_url?:        string | null
          onboarding_status?:  'pending_onboarding' | 'pending_validation' | 'active' | 'suspended' | 'rejected'
          city?:               string | null
          approval_status?:    'pending' | 'approved' | 'rejected' | 'resubmit'
          approved_at?:        string | null
          approved_by?:        string | null
          rejection_reason?:   string | null
          license_approved?:   boolean
          insurance_approved?: boolean
          id_front_approved?:  boolean
          id_back_approved?:   boolean
        }
        Update: {
          id?:                 string
          full_name?:          string
          phone?:              string
          is_available?:       boolean
          created_at?:         string
          user_id?:            string | null
          otp_attempts?:       number
          locked_until?:       string | null
          phone_verified?:     boolean
          vehicle_type?:       'moto' | 'velo' | 'voiture' | 'autre' | null
          license_photo_url?:  string | null
          insurance_url?:      string | null
          id_front_url?:       string | null
          id_back_url?:        string | null
          onboarding_status?:  'pending_onboarding' | 'pending_validation' | 'active' | 'suspended' | 'rejected'
          city?:               string | null
          approval_status?:    'pending' | 'approved' | 'rejected' | 'resubmit'
          approved_at?:        string | null
          approved_by?:        string | null
          rejection_reason?:   string | null
          license_approved?:   boolean
          insurance_approved?: boolean
          id_front_approved?:  boolean
          id_back_approved?:   boolean
        }
        Relationships: [
          {
            foreignKeyName: 'drivers_approved_by_fkey'
            columns: ['approved_by']
            isOneToOne: false
            referencedRelation: 'admin_users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── Admin Users (PLZ-060) ───────────────────────────────────
      admin_users: {
        Row: {
          id:         string
          user_id:    string
          email:      string
          role:       'admin' | 'ops' | 'support'
          is_active:  boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:         string
          user_id:     string
          email:       string
          role?:       'admin' | 'ops' | 'support'
          is_active?:  boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?:         string
          user_id?:    string
          email?:      string
          role?:       'admin' | 'ops' | 'support'
          is_active?:  boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ── Driver Schedules ───────────────────────────────────────
      driver_schedules: {
        Row: {
          id:          string
          driver_id:   string
          day_of_week: number
          start_time:  string
          end_time:    string
          is_active:   boolean
        }
        Insert: {
          id?:          string
          driver_id:    string
          day_of_week:  number
          start_time:   string
          end_time:     string
          is_active?:   boolean
        }
        Update: {
          day_of_week?: number
          start_time?:  string
          end_time?:    string
          is_active?:   boolean
        }
        Relationships: [
          {
            foreignKeyName: 'driver_schedules_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          }
        ]
      }

      // ── Deliveries ─────────────────────────────────────────────
      deliveries: {
        Row: {
          id:                   string
          order_id:             string
          driver_id:            string | null
          pickup_time:          string | null
          delivered_at:         string | null
          status:               DeliveryStatus
          created_at:           string
          // PLZ-057: confirmation + issue columns
          pickup_photo_url:     string | null
          delivery_photo_url:   string | null
          cod_confirmed:        boolean
          issue_type:           'client_absent' | 'client_refuse' | 'wrong_address' | 'damaged' | 'payment_issue' | 'other' | null
          issue_notes:          string | null
          issue_photo_url:      string | null
          // PLZ-058: dispatch engine columns
          distance_km:            number | null
          estimated_duration_min: number | null
          driver_earnings_mad:    number | null
          pickup_city:            string | null
          pool_created_at:        string | null
          pool_expires_at:        string | null
          accepted_at:            string | null
          merchant_pickup_code:   string | null
        }
        Insert: {
          id?:                   string
          order_id:              string
          driver_id?:            string | null
          pickup_time?:          string | null
          delivered_at?:         string | null
          status?:               DeliveryStatus
          created_at?:           string
          pickup_photo_url?:     string | null
          delivery_photo_url?:   string | null
          cod_confirmed?:        boolean
          issue_type?:           'client_absent' | 'client_refuse' | 'wrong_address' | 'damaged' | 'payment_issue' | 'other' | null
          issue_notes?:          string | null
          issue_photo_url?:      string | null
          distance_km?:            number | null
          estimated_duration_min?: number | null
          driver_earnings_mad?:    number | null
          pickup_city?:            string | null
          pool_created_at?:        string | null
          pool_expires_at?:        string | null
          accepted_at?:            string | null
          merchant_pickup_code?:   string | null
        }
        Update: {
          id?:                   string
          order_id?:             string
          driver_id?:            string | null
          pickup_time?:          string | null
          delivered_at?:         string | null
          status?:               DeliveryStatus
          created_at?:           string
          pickup_photo_url?:     string | null
          delivery_photo_url?:   string | null
          cod_confirmed?:        boolean
          issue_type?:           'client_absent' | 'client_refuse' | 'wrong_address' | 'damaged' | 'payment_issue' | 'other' | null
          issue_notes?:          string | null
          issue_photo_url?:      string | null
          distance_km?:            number | null
          estimated_duration_min?: number | null
          driver_earnings_mad?:    number | null
          pickup_city?:            string | null
          pool_created_at?:        string | null
          pool_expires_at?:        string | null
          accepted_at?:            string | null
          merchant_pickup_code?:   string | null
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

      // ── Dispatch Config ────────────────────────────────────────
      dispatch_config: {
        Row: {
          id:                   string
          base_fee_mad:         number
          per_km_rate_mad:      number
          pool_timeout_minutes: number
          updated_at:           string
        }
        Insert: {
          id?:                   string
          base_fee_mad?:         number
          per_km_rate_mad?:      number
          pool_timeout_minutes?: number
          updated_at?:           string
        }
        Update: {
          base_fee_mad?:         number
          per_km_rate_mad?:      number
          pool_timeout_minutes?: number
          updated_at?:           string
        }
        Relationships: []
      }

      // ── Dispatch Errors ────────────────────────────────────────
      dispatch_errors: {
        Row: {
          id:            string
          order_id:      string | null
          error_message: string
          created_at:    string
        }
        Insert: {
          id?:            string
          order_id?:      string | null
          error_message:  string
          created_at?:    string
        }
        Update: {
          error_message?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dispatch_errors_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
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

      // ── Delivery Zones ─────────────────────────────────────────
      delivery_zones: {
        Row: {
          id:           string
          merchant_id:  string
          zone_name:    string
          delivery_fee: number
          created_at:   string
        }
        Insert: {
          id?:           string
          merchant_id:   string
          zone_name:     string
          delivery_fee?: number
          created_at?:   string
        }
        Update: {
          id?:           string
          merchant_id?:  string
          zone_name?:    string
          delivery_fee?: number
          created_at?:   string
        }
        Relationships: [
          {
            foreignKeyName: 'delivery_zones_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: false
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          }
        ]
      }

    }
    Views: Record<string, never>
    Functions: {
      accept_delivery: {
        Args: { p_delivery_id: string; p_driver_id: string }
        Returns: boolean
      }
    }
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

export type Merchant        = Database['public']['Tables']['merchants']['Row']
export type Product         = Database['public']['Tables']['products']['Row']
export type Customer        = Database['public']['Tables']['customers']['Row']
export type Order           = Database['public']['Tables']['orders']['Row']
export type OrderItem       = Database['public']['Tables']['order_items']['Row']
export type Driver          = Database['public']['Tables']['drivers']['Row']
export type DriverSchedule  = Database['public']['Tables']['driver_schedules']['Row']
export type Delivery        = Database['public']['Tables']['deliveries']['Row']
export type DispatchConfig  = Database['public']['Tables']['dispatch_config']['Row']
export type DispatchError   = Database['public']['Tables']['dispatch_errors']['Row']
export type SupportTicket   = Database['public']['Tables']['support_tickets']['Row']
export type SupportMessage  = Database['public']['Tables']['support_messages']['Row']
export type DeliveryZone    = Database['public']['Tables']['delivery_zones']['Row']
export type AdminUser       = Database['public']['Tables']['admin_users']['Row']

export type MerchantInsert       = Database['public']['Tables']['merchants']['Insert']
export type ProductInsert        = Database['public']['Tables']['products']['Insert']
export type CustomerInsert       = Database['public']['Tables']['customers']['Insert']
export type OrderInsert          = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert      = Database['public']['Tables']['order_items']['Insert']
export type DriverScheduleInsert = Database['public']['Tables']['driver_schedules']['Insert']
export type DeliveryInsert       = Database['public']['Tables']['deliveries']['Insert']
export type DispatchConfigInsert = Database['public']['Tables']['dispatch_config']['Insert']
export type DispatchErrorInsert  = Database['public']['Tables']['dispatch_errors']['Insert']
export type SupportTicketInsert  = Database['public']['Tables']['support_tickets']['Insert']
export type SupportMessageInsert = Database['public']['Tables']['support_messages']['Insert']
export type DeliveryZoneInsert   = Database['public']['Tables']['delivery_zones']['Insert']

export type MerchantUpdate       = Database['public']['Tables']['merchants']['Update']
export type ProductUpdate        = Database['public']['Tables']['products']['Update']
export type OrderUpdate          = Database['public']['Tables']['orders']['Update']
export type DriverScheduleUpdate = Database['public']['Tables']['driver_schedules']['Update']
export type DeliveryUpdate       = Database['public']['Tables']['deliveries']['Update']
export type DispatchConfigUpdate = Database['public']['Tables']['dispatch_config']['Update']
export type DispatchErrorUpdate  = Database['public']['Tables']['dispatch_errors']['Update']
export type SupportTicketUpdate  = Database['public']['Tables']['support_tickets']['Update']
export type DeliveryZoneUpdate   = Database['public']['Tables']['delivery_zones']['Update']
