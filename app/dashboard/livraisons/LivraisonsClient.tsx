'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Truck, User, MapPin, Clock, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { dispatchDeliveryAction } from './actions';
import type { OrderWithDetails } from '@/lib/db/orders';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMAD(centimes: number): string {
  return `${Math.round(centimes / 100).toLocaleString('fr-MA')} MAD`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

// ─── Dispatch button ─────────────────────────────────────────────────────────

function DispatchButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => dispatchDeliveryAction(orderId))}
      className="inline-flex items-center gap-1.5 px-3 h-9 bg-[#E8632A] text-white text-sm font-medium rounded-lg hover:bg-[#d45424] disabled:opacity-60 transition-colors"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Truck className="w-4 h-4" />
      )}
      Dispatcher
    </button>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  orders: OrderWithDetails[];
};

// ─── Component ───────────────────────────────────────────────────────────────

export function LivraisonsClient({ orders }: Props) {
  return (
    <div className="p-4 md:p-8 max-w-[1040px] mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C1917]">Livraisons</h1>
          <p className="text-sm text-[#78716C] mt-1">
            Commandes confirmées en attente de dispatch
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#E8632A] text-sm font-medium">
          <Truck className="w-4 h-4" />
          {orders.length} en attente
        </span>
      </div>

      {/* ── Desktop table ───────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 flex items-center">
          <div className="w-[130px] text-[13px] font-medium text-[#78716C] uppercase tracking-wide">N° Commande</div>
          <div className="w-[180px] text-[13px] font-medium text-[#78716C] uppercase tracking-wide">Client</div>
          <div className="flex-1    text-[13px] font-medium text-[#78716C] uppercase tracking-wide">Adresse</div>
          <div className="w-[100px] text-[13px] font-medium text-[#78716C] uppercase tracking-wide">Montant</div>
          <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase tracking-wide">Confirmée</div>
          <div className="w-[130px] text-[13px] font-medium text-[#78716C] uppercase tracking-wide">Action</div>
        </div>

        {/* Rows */}
        {orders.map((order) => (
          <div
            key={order.id}
            className="h-16 px-4 flex items-center border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#FAFAF9] transition-colors"
          >
            <div className="w-[130px]">
              <Link
                href={`/dashboard/commandes/${order.id}`}
                className="text-sm font-medium text-[#2563EB] hover:underline"
              >
                {order.order_number}
              </Link>
            </div>
            <div className="w-[180px]">
              <div className="text-sm font-medium text-[#1C1917] truncate">
                {order.customer?.full_name ?? '—'}
              </div>
              {order.customer?.phone && (
                <div className="text-xs text-[#78716C]">{order.customer.phone}</div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="text-sm text-[#78716C] truncate">
                {order.customer?.address ?? order.customer?.city ?? '—'}
              </div>
            </div>
            <div className="w-[100px] text-sm font-medium text-[#1C1917]">
              {formatMAD(order.total)}
            </div>
            <div className="w-[120px] text-sm text-[#78716C]">
              {timeAgo(order.updated_at)}
            </div>
            <div className="w-[130px]">
              <DispatchButton orderId={order.id} />
            </div>
          </div>
        ))}

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="py-16 text-center">
            <Truck className="w-10 h-10 text-[#D4D0CB] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#1C1917] mb-1">
              File vide
            </h3>
            <p className="text-sm text-[#78716C]">
              Aucune commande confirmée en attente de livraison.
            </p>
          </div>
        )}
      </div>

      {/* ── Mobile card list ────────────────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl p-4 shadow-sm space-y-3"
          >
            {/* Row 1: order number + status + total */}
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/dashboard/commandes/${order.id}`}
                  className="font-bold text-[#1C1917] text-sm"
                >
                  {order.order_number}
                </Link>
                <div className="mt-0.5">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[#1C1917]">
                  {formatMAD(order.total)}
                </div>
                <div className="flex items-center gap-1 text-xs text-[#78716C] mt-0.5 justify-end">
                  <Clock className="w-3 h-3" />
                  {timeAgo(order.updated_at)}
                </div>
              </div>
            </div>

            {/* Row 2: customer info */}
            {order.customer && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#78716C] flex-shrink-0" />
                  <span className="text-sm text-[#1C1917]">{order.customer.full_name}</span>
                </div>
                {(order.customer.address || order.customer.city) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#78716C] mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[#78716C]">
                      {order.customer.address ?? order.customer.city}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Row 3: dispatch button */}
            <div className="pt-1">
              <DispatchButton orderId={order.id} />
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-16 text-center">
            <Truck className="w-10 h-10 text-[#D4D0CB] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#1C1917] mb-1">
              File vide
            </h3>
            <p className="text-sm text-[#78716C]">
              Aucune commande confirmée en attente de livraison.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
