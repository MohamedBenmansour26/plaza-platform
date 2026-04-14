'use client';

import { useTransition, useState } from 'react';
import { X, User, Phone, MapPin, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/ui/PaymentBadge';
import {
  confirmOrderAction,
} from './actions';
import { formatMAD } from './OrdersClient';
import type { OrderWithDetails } from '@/lib/db/orders';
import type { OrderStatus, PaymentMethod } from '@/types/supabase';

// ─── Delivery timeline ───────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: OrderStatus | 'received'; label: string }[] = [
  { status: 'received',   label: 'Commande reçue' },
  { status: 'confirmed',  label: 'Confirmée' },
  { status: 'dispatched', label: 'Expédiée' },
  { status: 'delivered',  label: 'Livrée' },
];

const STATUS_ORDER: (OrderStatus | 'received')[] = [
  'received', 'confirmed', 'dispatched', 'delivered',
];

function stepState(
  stepStatus: OrderStatus | 'received',
  orderStatus: OrderStatus,
): 'done' | 'current' | 'pending' | 'cancelled' {
  if (orderStatus === 'cancelled') {
    return stepStatus === 'received' ? 'done' : 'cancelled';
  }
  const stepIdx = STATUS_ORDER.indexOf(stepStatus);
  const currentIdx = STATUS_ORDER.indexOf(orderStatus);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'current';
  return 'pending';
}

function DeliveryTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          <span className="text-[13px] text-[#1C1917]">Commande reçue</span>
        </div>
        <div className="flex gap-3 items-center">
          <X className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
          <span className="text-[13px] text-[#DC2626]">Annulée</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {TIMELINE_STEPS.map((step, i) => {
        const state = stepState(step.status, status);
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <div key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              {state === 'done' && (
                <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
              {state === 'current' && (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  status === 'dispatched' ? 'border-[#E8632A]' : 'border-[#2563EB]'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    status === 'dispatched' ? 'bg-[#E8632A]' : 'bg-[#2563EB]'
                  }`} />
                </div>
              )}
              {state === 'pending' && (
                <Circle className="w-5 h-5 text-[#A8A29E] flex-shrink-0" />
              )}
              {!isLast && (
                <div className="w-0.5 h-5 bg-[#E2E8F0] my-1" />
              )}
            </div>
            <span className={`text-[13px] pt-0.5 ${
              state === 'done'    ? 'text-[#1C1917]' :
              state === 'current' ? (status === 'dispatched' ? 'font-semibold text-[#E8632A]' : 'font-semibold text-[#2563EB]') :
              'text-[#A8A29E]'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionBar({
  order,
  onClose,
}: {
  order: OrderWithDetails;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const run = (action: (id: string) => Promise<void>) => {
    setActionError(null);
    startTransition(async () => {
      try {
        await action(order.id);
        onClose();
      } catch (err) {
        if (err instanceof Error && err.message.includes('Stock insuffisant')) {
          setActionError(err.message);
        } else {
          setActionError('Erreur lors de la confirmation');
        }
      }
    });
  };

  if (order.status === 'delivered' || order.status === 'cancelled') {
    return (
      <div className="flex-1 text-center text-sm text-[#78716C] py-2">
        {order.status === 'delivered' ? 'Commande terminée' : 'Commande annulée'}
      </div>
    );
  }

  return (
    <>
      {actionError && (
        <div className="w-full mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 text-sm text-[#DC2626]">
          {actionError}
        </div>
      )}

      <div className="flex flex-col gap-2 w-full">
        {isPending && (
          <div className="flex-1 flex items-center justify-center gap-2 text-sm text-[#78716C]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Mise à jour…
          </div>
        )}

        {!isPending && order.status === 'pending' && (
          <button
            onClick={() => run(confirmOrderAction)}
            className="flex-1 h-10 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            Confirmer la commande
          </button>
        )}

        {!isPending && (
          <button
            onClick={() => {
              window.location.href = `mailto:support@plaza.ma?subject=Problème commande ${order.order_number}&body=Bonjour, je rencontre un problème avec la commande ${order.order_number}.`;
            }}
            className="flex-1 h-10 border border-[#E2E8F0] text-[#78716C] rounded-lg text-sm font-medium hover:bg-[#F5F5F4] transition-colors"
          >
            Signaler un problème
          </button>
        )}
      </div>
    </>
  );
}

// ─── Main sheet ───────────────────────────────────────────────────────────────

type Props = {
  order: OrderWithDetails;
  onClose: () => void;
};

export function OrderDetailSheet({ order, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed end-0 top-0 h-screen w-full max-w-[560px] bg-white shadow-xl z-50 flex flex-col">

        {/* Header */}
        <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-[#1C1917]">{order.order_number}</span>
            <StatusBadge status={order.status} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 pb-28">
          <div className="flex gap-4">

            {/* Left column: customer + items */}
            <div className="flex-1 space-y-3">

              {/* Customer */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase tracking-wide mb-3">Client</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#78716C] flex-shrink-0" />
                    <span className="text-sm font-semibold text-[#1C1917]">
                      {order.customer?.full_name ?? '—'}
                    </span>
                  </div>
                  {order.customer?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#78716C] flex-shrink-0" />
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="text-sm text-[#2563EB] hover:underline"
                        dir="ltr"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                  )}
                  {order.customer?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#78716C] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#78716C]">{order.customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Articles + totals */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase tracking-wide mb-3">Articles</div>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[#F5F5F4] flex-shrink-0 overflow-hidden">
                        {item.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.name_fr}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 text-sm font-medium text-[#1C1917] truncate">
                        {item.name_fr}
                      </div>
                      <div className="text-sm text-[#78716C] flex-shrink-0">x{item.quantity}</div>
                      <div className="text-sm font-medium text-[#1C1917] flex-shrink-0">
                        {formatMAD(item.unit_price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E2E8F0] my-3" />

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78716C]">Sous-total</span>
                    <span className="text-[#1C1917]">{formatMAD(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78716C]">Livraison</span>
                    <span className="text-[#E8632A]">{formatMAD(order.delivery_fee)}</span>
                  </div>
                </div>

                <div className="border-t-2 border-[#E2E8F0] my-3" />

                <div className="flex justify-between">
                  <span className="text-base font-semibold text-[#1C1917]">Total</span>
                  <span className="text-lg font-semibold text-[#1C1917]">{formatMAD(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Right column: timeline + payment */}
            <div className="w-[200px] space-y-3 flex-shrink-0">

              {/* Delivery timeline */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase tracking-wide mb-3">Livraison</div>
                <DeliveryTimeline status={order.status} />
              </div>

              {/* Payment */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase tracking-wide mb-2">Paiement</div>
                <PaymentBadge method={order.payment_method as PaymentMethod} />
                <p className="text-[13px] text-[#78716C] mt-2">
                  {order.payment_method === 'cod'
                    ? 'Paiement à la livraison'
                    : order.payment_method === 'terminal'
                    ? 'Paiement par terminal'
                    : 'Paiement par carte'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#E2E8F0] px-6 py-4 flex gap-3 flex-shrink-0 bg-white">
          <ActionBar order={order} onClose={onClose} />
        </div>
      </div>
    </>
  );
}
