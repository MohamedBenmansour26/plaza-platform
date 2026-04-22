'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PackageOpen, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/ui/PaymentBadge';
import { OrderDetailSheet } from './OrderDetailSheet';
import type { OrderWithDetails } from '@/lib/db/orders';
import type { OrderStatus } from '@/types/supabase';
import { MOROCCO_TZ } from '@/lib/timezone';

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatMAD(centimes: number): string {
  return `${Math.round(centimes / 100).toLocaleString('fr-MA')} MAD`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-MA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: MOROCCO_TZ,
  });
}

// ─── Filter config ───────────────────────────────────────────────────────────

type FilterId = 'all' | OrderStatus;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',        label: 'Toutes' },
  { id: 'pending',    label: 'En attente' },
  { id: 'confirmed',  label: 'Confirmées' },
  { id: 'dispatched', label: 'Expédiées' },
  { id: 'delivered',  label: 'Livrées' },
  { id: 'cancelled',  label: 'Annulées' },
];

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  orders: OrderWithDetails[];
};

// ─── Component ───────────────────────────────────────────────────────────────

export function OrdersClient({ orders }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  const filtered = activeFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  const countFor = (id: FilterId) =>
    id === 'all' ? orders.length : orders.filter((o) => o.status === id).length;

  return (
    <>
      {/* design-refresh §3.1 — page canvas is `bg-background` (#F8F9FA) via the
          DashboardLayout. We do not re-declare it on this wrapper so it inherits. */}
      <div className="p-4 md:p-8 max-w-[1040px] mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Commandes</h1>
        </div>

        {/* Filter tabs — horizontal scroll on mobile, brief §2.8 pill sizing */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 md:flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted/40'
              }`}
              data-testid={`merchant-orders-filter-${f.id}-btn`}
            >
              {f.label} ({countFor(f.id)})
            </button>
          ))}
        </div>

        {/* ── Desktop table — brief §2.4 headers + rows ─────────────── */}
        <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
          {/* Header row */}
          <div className="h-12 bg-muted/40 border-b border-border px-4 flex items-center">
            <div className="w-[130px] text-xs font-medium text-muted-foreground uppercase tracking-wide">N° Commande</div>
            <div className="w-[160px] text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</div>
            <div className="w-[100px] text-xs font-medium text-muted-foreground uppercase tracking-wide">Articles</div>
            <div className="w-[130px] text-xs font-medium text-muted-foreground uppercase tracking-wide">Montant</div>
            <div className="w-[140px] text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</div>
            <div className="w-[130px] text-xs font-medium text-muted-foreground uppercase tracking-wide">Paiement</div>
            <div className="flex-1  text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</div>
          </div>

          {/* Data rows — ID cells use `text-primary` per brief §2.4 */}
          {filtered.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="h-14 px-4 flex items-center border-b border-border hover:bg-muted/40 cursor-pointer transition-colors last:border-b-0"
              data-testid="merchant-orders-row"
              data-id={order.id}
            >
              <div className="w-[130px] text-sm font-medium text-primary">
                {order.order_number}
              </div>
              <div className="w-[160px] text-sm text-foreground truncate">
                {order.customer?.full_name ?? '—'}
              </div>
              <div className="w-[100px] text-sm text-muted-foreground">
                {order.items.length} article{order.items.length !== 1 ? 's' : ''}
              </div>
              <div className="w-[130px] text-sm font-medium text-foreground">
                {formatMAD(order.total)}
              </div>
              <div className="w-[140px] flex items-center gap-1.5">
                <StatusBadge status={order.status} />
                {order.delivery?.status === 'timed_out' && (
                  <span title="Aucun livreur trouvé">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </span>
                )}
              </div>
              <div className="w-[130px]">
                <PaymentBadge method={order.payment_method as import('@/types/supabase').PaymentMethod} />
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                {formatDate(order.created_at)}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <PackageOpen className="w-12 h-12 text-border mx-auto mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">Aucune commande</h3>
              <p className="text-sm text-muted-foreground">Il n&apos;y a pas de commandes dans cette catégorie.</p>
            </div>
          )}
        </div>

        {/* ── Mobile card list ──────────────────────────────────────── */}
        <div className="md:hidden space-y-2">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/commandes/${order.id}`}
              className="block bg-card rounded-xl p-3 shadow-card hover:shadow-card-hover transition-shadow"
              data-testid="merchant-orders-row"
              data-id={order.id}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-foreground text-sm">
                    {order.order_number}
                  </span>
                  <span className="text-sm text-muted-foreground ms-2">
                    {order.customer?.full_name ?? '—'}
                  </span>
                </div>
                <div className="text-end">
                  <div className="text-sm font-semibold text-foreground">
                    {formatMAD(order.total)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(order.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.status} />
                {order.delivery?.status === 'timed_out' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-destructive/10 text-destructive">
                    <AlertTriangle className="w-3 h-3" />
                    Sans livreur
                  </span>
                )}
                <PaymentBadge method={order.payment_method as import('@/types/supabase').PaymentMethod} />
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <PackageOpen className="w-12 h-12 text-border mx-auto mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">Aucune commande</h3>
              <p className="text-sm text-muted-foreground">Il n&apos;y a pas de commandes dans cette catégorie.</p>
            </div>
          )}
        </div>

      </div>

      {/* Desktop drawer — rendered outside page padding */}
      {selectedOrder && (
        <OrderDetailSheet
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
