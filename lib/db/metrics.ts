/**
 * lib/db/metrics.ts — Merchant analytics/metrics queries.
 *
 * Uses the server Supabase client. Aggregation is done in JS
 * (no RPC needed for MVP scale). Period filtering uses ISO date strings.
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
  product_id: string;
  name_fr: string;
  name_ar: string;
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
  total_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  order_items: {
    quantity: number;
    unit_price: number;
    products: {
      id: string;
      name_fr: string;
      name_ar: string;
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

  // Single query: orders + items + products for the period
  let query = supabase
    .from('orders')
    .select(`
      id, total_amount, payment_method, status, created_at,
      order_items (
        quantity, unit_price,
        products ( id, name_fr, name_ar, image_url )
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
  const totalRevenue = rows.reduce((sum, o) => sum + o.total_amount, 0);
  const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // ── Revenue by day ──────────────────────────────────────────────────────

  const revenueMap = new Map<string, number>();
  for (const order of rows) {
    const day = toDateString(order.created_at);
    revenueMap.set(day, (revenueMap.get(day) ?? 0) + order.total_amount);
  }
  const revenueByDay: RevenuePoint[] = Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Top products ────────────────────────────────────────────────────────

  const productMap = new Map<
    string,
    {
      name_fr: string;
      name_ar: string;
      image_url: string | null;
      sold: number;
      revenue: number;
    }
  >();

  for (const order of rows) {
    for (const item of order.order_items ?? []) {
      if (!item.products) continue;
      const pid = item.products.id;
      const existing = productMap.get(pid);
      const itemRevenue = item.quantity * item.unit_price;
      if (existing) {
        existing.sold += item.quantity;
        existing.revenue += itemRevenue;
      } else {
        productMap.set(pid, {
          name_fr: item.products.name_fr,
          name_ar: item.products.name_ar,
          image_url: item.products.image_url,
          sold: item.quantity,
          revenue: itemRevenue,
        });
      }
    }
  }

  const topProducts: TopProduct[] = Array.from(productMap.entries())
    .map(([product_id, v]) => ({ product_id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Payment breakdown ───────────────────────────────────────────────────

  const paymentMap = new Map<PaymentMethod, { count: number; amount: number }>();
  for (const order of rows) {
    const m = order.payment_method;
    const existing = paymentMap.get(m);
    if (existing) {
      existing.count += 1;
      existing.amount += order.total_amount;
    } else {
      paymentMap.set(m, { count: 1, amount: order.total_amount });
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
