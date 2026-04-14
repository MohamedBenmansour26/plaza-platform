/**
 * lib/db/driver.ts — Driver query functions and domain types.
 * Used by driver app server actions.
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { DeliveryStatus } from '@/types/supabase';

// ─── Domain types ──────────────────────────────────────────────────────────

export type OnboardingStatus =
  | 'pending_onboarding'
  | 'pending_validation'
  | 'active'
  | 'suspended';

export type IssueType =
  | 'client_absent'
  | 'client_refuse'
  | 'wrong_address'
  | 'damaged'
  | 'payment_issue'
  | 'other';

export type DriverProfile = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  is_available: boolean;
  onboarding_status: OnboardingStatus;
  vehicle_type: 'moto' | 'velo' | 'voiture' | 'autre' | null;
  license_photo_url: string | null;
  insurance_url: string | null;
  id_front_url: string | null;
  id_back_url: string | null;
  created_at: string;
};

export type DriverDelivery = {
  id: string;
  status: DeliveryStatus;
  collection_photo_url: string | null;
  delivery_photo_url: string | null;
  cod_confirmed: boolean;
  pickup_time: string | null;
  delivered_at: string | null;
  order: {
    id: string;
    order_number: string;
    total: number;
    payment_method: string;
    merchant_pickup_code: number | null;
    customer_pin: number | null;
    delivery_date: string | null;
    delivery_slot: string | null;
    merchant: { store_name: string; location_description: string | null };
    customer: { full_name: string; phone: string; address: string | null; city: string | null } | null;
  };
};

type RawDeliveryRow = {
  id: string;
  status: DeliveryStatus;
  collection_photo_url: string | null;
  delivery_photo_url: string | null;
  cod_confirmed: boolean;
  pickup_time: string | null;
  delivered_at: string | null;
  orders: {
    id: string;
    order_number: string;
    total: number;
    payment_method: string;
    merchant_pickup_code: number | null;
    customer_pin: number | null;
    delivery_date: string | null;
    delivery_slot: string | null;
    merchants: { store_name: string; location_description: string | null };
    customers: { full_name: string; phone: string; address: string | null; city: string | null } | null;
  };
};

const DELIVERY_SELECT = `
  id, status, collection_photo_url, delivery_photo_url, cod_confirmed, pickup_time, delivered_at,
  orders (
    id, order_number, total, payment_method,
    merchant_pickup_code, customer_pin, delivery_date, delivery_slot,
    merchants ( store_name, location_description ),
    customers ( full_name, phone, address, city )
  )
` as const;

function normaliseDelivery(row: RawDeliveryRow): DriverDelivery {
  return {
    id: row.id,
    status: row.status,
    collection_photo_url: row.collection_photo_url,
    delivery_photo_url: row.delivery_photo_url,
    cod_confirmed: row.cod_confirmed,
    pickup_time: row.pickup_time,
    delivered_at: row.delivered_at,
    order: {
      id: row.orders.id,
      order_number: row.orders.order_number,
      total: row.orders.total,
      payment_method: row.orders.payment_method,
      merchant_pickup_code: row.orders.merchant_pickup_code,
      customer_pin: row.orders.customer_pin,
      delivery_date: row.orders.delivery_date,
      delivery_slot: row.orders.delivery_slot,
      merchant: row.orders.merchants,
      customer: row.orders.customers ?? null,
    },
  };
}

// ─── Lookup driver by phone ────────────────────────────────────────────────

export async function findDriverByPhone(
  phone: string,
): Promise<{ id: string; full_name: string; onboarding_status: OnboardingStatus } | null> {
  const service = createServiceClient();
  const { data } = await service
    .from('drivers')
    .select('id, full_name, onboarding_status')
    .eq('phone', phone)
    .maybeSingle<{ id: string; full_name: string; onboarding_status: OnboardingStatus }>();
  return data ?? null;
}

// ─── Fetch driver profile by user_id ──────────────────────────────────────

export async function getDriverProfile(userId: string): Promise<DriverProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('drivers')
    .select('id, user_id, full_name, phone, is_available, onboarding_status, vehicle_type, license_photo_url, insurance_url, id_front_url, id_back_url, created_at')
    .eq('user_id', userId)
    .maybeSingle<DriverProfile>();
  return data ?? null;
}

// ─── Fetch active deliveries for a driver ─────────────────────────────────

export async function getActiveDeliveries(driverId: string): Promise<DriverDelivery[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deliveries')
    .select(DELIVERY_SELECT)
    .eq('driver_id', driverId)
    .in('status', ['assigned', 'picked_up'] satisfies DeliveryStatus[])
    .order('created_at', { ascending: true })
    .returns<RawDeliveryRow[]>();
  if (error) throw new Error(`getActiveDeliveries: ${error.message}`);
  return (data ?? []).map(normaliseDelivery);
}

// ─── Fetch a single delivery by id ────────────────────────────────────────

export async function getDeliveryById(
  deliveryId: string,
  driverId: string,
): Promise<DriverDelivery | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deliveries')
    .select(DELIVERY_SELECT)
    .eq('id', deliveryId)
    .eq('driver_id', driverId)
    .maybeSingle<RawDeliveryRow>();
  if (error) throw new Error(`getDeliveryById: ${error.message}`);
  return data ? normaliseDelivery(data) : null;
}

// ─── Fetch completed deliveries for history ───────────────────────────────

export type HistoryDelivery = {
  id: string;
  delivered_at: string | null;
  order_number: string;
  customer_name: string;
  city: string | null;
  earnings: number;
  payment_method: string;
  on_time: boolean;
  delivery_slot: string | null;
};

export async function getDeliveryHistory(driverId: string): Promise<HistoryDelivery[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      id, delivered_at,
      orders (
        order_number, total, payment_method, delivery_slot, delivered_at,
        customers ( full_name, city )
      )
    `)
    .eq('driver_id', driverId)
    .eq('status', 'delivered' satisfies DeliveryStatus)
    .order('delivered_at', { ascending: false })
    .limit(50)
    .returns<{
      id: string;
      delivered_at: string | null;
      orders: {
        order_number: string;
        total: number;
        payment_method: string;
        delivery_slot: string | null;
        delivered_at: string | null;
        customers: { full_name: string; city: string | null } | null;
      };
    }[]>();
  if (error) throw new Error(`getDeliveryHistory: ${error.message}`);

  return (data ?? []).map((row) => {
    const onTime = row.delivered_at != null;
    return {
      id: row.id,
      delivered_at: row.delivered_at,
      order_number: row.orders.order_number,
      customer_name: row.orders.customers?.full_name ?? 'Client',
      city: row.orders.customers?.city ?? null,
      earnings: Math.round(row.orders.total * 0.08),
      payment_method: row.orders.payment_method,
      on_time: onTime,
      delivery_slot: row.orders.delivery_slot,
    };
  });
}
