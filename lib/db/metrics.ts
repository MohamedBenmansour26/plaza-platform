/**
 * lib/db/metrics.ts — Merchant analytics/metrics queries.
 *
 * Uses the server Supabase client. Aggregation is done in JS
 * (no RPC needed for MVP scale). Period filtering uses ISO date strings.
 *
 * Live schema (07 Apr 2026):
 *   orders.total       (was total_amount in PLZ-006)
 *   order_items.name_fr is a snapshot column (no products join needed for name)
 */

import { createClient } from '@/lib/supabase/server';
import type { OrderStatus, PaymentMethod } from '@/types/supabase';

// ─── Public types ───────────────────────────────────────────────────────────

export type Period = 'week' | 'month' | 'all';

export type RevenuePoint = {
  /** ISO date string YYYY-MM-DD */
  date: string;
  revenue: number;
};

export type TopProduct = {
  /** null when the product was deleted after the order was placed */
  product_id: string | null;
  name_fr: string;
  image_url: string | null;
  sold: number;
  revenue: number;
};

export type PaymentBreakdownItem = {
  method: PaymentMethod;
  count: number;
  amount: number;
  /** Rounded percentage of total orders count */
  percentage: number;
};

export type MerchantMetrics = {
  totalRevenue: number;
  totalOrders: number;
  avgBasket: number;
  revenueByDay: RevenuePoint[];
  topProducts: TopProduct[];
  paymentBreakdown: PaymentBreakdownItem[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPeriodStart(period: Period): string | null {
  if (period === 'all') return null;
  const now = new Date();
  if (period === 'week') {
    now.setDate(now.getDate() - 6);
  } else {
    now.setDate(now.getDate() - 29);
  }
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function toDateString(isoString: string): string {
  return isoString.slice(0, 10); // 'YYYY-MM-DD'
}

// ─── Raw Supabase shapes ────────────────────────────────────────────────────

type RawOrder = {
  id: string;
  total: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  order_items: {
    quantity: number;
    unit_price: number;
    name_fr: string;
    product_id: string | null;
    products: {
      image_url: string | null;
    } | null;
  }[];
};

// ─── Main function ──────────────────────────────────────────────────────────

export async function getMerchantMetrics(
  merchantId: string,
  period: Period = 'week',
): Promise<MerchantMetrics> {
  const supabase = await createClient();
  const periodStart = getPeriodStart(period);

  // Single query: orders + items + product images for the period
  let query = supabase
    .from('orders')
    .select(`
      id, total, payment_method, status, created_at,
      order_items (
        quantity, unit_price, name_fr, product_id,
        products ( image_url )
      )
    `)
    .eq('merchant_id', merchantId)
    .neq('status', 'cancelled' satisfies OrderStatus);

  if (periodStart) {
    query = query.gte('created_at', periodStart);
  }

  const { data: orders, error } = await query.returns<RawOrder[]>();
  if (error) throw new Error(`getMerchantMetrics: ${error.message}`);

  const rows = orders ?? [];

  // ── Totals ──────────────────────────────────────────────────────────────

  const totalOrders = rows.length;
  const totalRevenue = rows.reduce((sum, o) => sum + o.total, 0);
  const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // ── Revenue by day ──────────────────────────────────────────────────────

  const revenueMap = new Map<string, number>();
  for (const order of rows) {
    const day = toDateString(order.created_at);
    revenueMap.set(day, (revenueMap.get(day) ?? 0) + order.total);
  }
  const revenueByDay: RevenuePoint[] = Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Top products ────────────────────────────────────────────────────────
  // name_fr is snapshotted on order_items — no products join needed for name.
  // Group by product_id (fall back to name for orders without product link).

  type ProductAgg = {
    name_fr: string;
    image_url: string | null;
    sold: number;
    revenue: number;
  };

  const productMap = new Map<string, ProductAgg>();

  for (const order of rows) {
    for (const item of order.order_items ?? []) {
      const key = item.product_id ?? `name:${item.name_fr}`;
      const existing = productMap.get(key);
      const itemRevenue = item.quantity * item.unit_price;
      if (existing) {
        existing.sold += item.quantity;
        existing.revenue += itemRevenue;
      } else {
        productMap.set(key, {
          name_fr: item.name_fr,
          image_url: item.products?.image_url ?? null,
          sold: item.quantity,
          revenue: itemRevenue,
        });
      }
    }
  }

  const topProducts: TopProduct[] = Array.from(productMap.entries())
    .map(([key, v]) => ({
      product_id: key.startsWith('name:') ? null : key,
      ...v,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Payment breakdown ───────────────────────────────────────────────────

  const paymentMap = new Map<PaymentMethod, { count: number; amount: number }>();
  for (const order of rows) {
    const m = order.payment_method;
    const existing = paymentMap.get(m);
    if (existing) {
      existing.count += 1;
      existing.amount += order.total;
    } else {
      paymentMap.set(m, { count: 1, amount: order.total });
    }
  }

  const paymentBreakdown: PaymentBreakdownItem[] = Array.from(paymentMap.entries())
    .map(([method, { count, amount }]) => ({
      method,
      count,
      amount,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRevenue,
    totalOrders,
    avgBasket,
    revenueByDay,
    topProducts,
    paymentBreakdown,
  };
}
