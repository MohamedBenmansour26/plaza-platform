'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, MapPin, Check, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/ui/PaymentBadge';
import {
  confirmOrderAction,
  dispatchOrderAction,
  deliverOrderAction,
  cancelOrderAction,
} from '../actions';
import { formatMAD, formatDate } from '../OrdersClient';
import type { OrderWithDetails } from '@/lib/db/orders';
import type { OrderStatus, PaymentMethod } from '@/types/supabase';

// ─── Status banner config ─────────────────────────────────────────────────────

const STATUS_BANNER: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending:    { bg: '#FFF7ED', text: '#E8632A', label: 'En attente de confirmation' },
  confirmed:  { bg: '#EFF6FF', text: '#2563EB', label: 'Confirmée — en préparation' },
  dispatched: { bg: '#FFF7ED', text: '#E8632A', label: 'En cours de livraison' },
  delivered:  { bg: '#F0FDF4', text: '#16A34A', label: 'Livrée' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626', label: 'Annulée' },
};

// ─── Delivery timeline ────────────────────────────────────────────────────────

type StepState = 'done' | 'current' | 'pending';

const STEPS: { key: OrderStatus | 'received'; label: string }[] = [
  { key: 'received',   label: 'Commande reçue' },
  { key: 'confirmed',  label: 'Confirmée' },
  { key: 'dispatched', label: 'Expédiée' },
  { key: 'delivered',  label: 'Livrée' },
];

const ORDER_RANK: Record<OrderStatus | 'received', number> = {
  received:   0,
  pending:    0, // visually = received
  confirmed:  1,
  dispatched: 2,
  delivered:  3,
  cancelled:  -1,
};

function DeliveryTimeline({ status }: { status: OrderStatus }) {

  return (
    <div className="space-y-6">
      {STEPS.map((step, i) => {
        const isLast = i === STEPS.length - 1;
        let state: StepState;

        if (status === 'cancelled') {
          state = step.key === 'received' ? 'done' : 'pending';
        } else if (status === 'pending') {
          state = step.key === 'received' ? 'done' : 'pending';
        } else {
          const stepRank = ORDER_RANK[step.key];
          if (stepRank < ORDER_RANK[status]) state = 'done';
          else if (stepRank === ORDER_RANK[status]) state = 'current';
          else state = 'pending';
        }

        return (
          <div key={step.key} className="flex gap-3">
            <div className="relative flex flex-col items-center">
              {state === 'done' && (
                <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {state === 'current' && (
                <div className="w-6 h-6 rounded-full bg-[#2563EB] flex-shrink-0 relative">
                  <div className="absolute inset-0 rounded-full bg-[#2563EB] animate-ping opacity-75" />
                </div>
              )}
              {state === 'pending' && (
                <div className="w-6 h-6 rounded-full border-2 border-[#E2E8F0] bg-white flex-shrink-0" />
              )}
              {!isLast && (
                <div className="absolute top-6 left-3 w-0.5 h-8 bg-[#E2E8F0]" />
              )}
            </div>
            <div className="pt-0.5">
              <div className={`text-[14px] ${
                state === 'done'    ? 'font-medium text-[#1C1917]' :
                state === 'current' ? 'font-semibold text-[#2563EB]' :
                'text-[#A8A29E]'
              }`}>
                {step.label}
              </div>
            </div>
          </div>
        );
      })}

      {/* Extra step for pending orders */}
      {status === 'pending' && (
        <div className="flex gap-3 -mt-2">
          <div className="w-6 h-6 rounded-full bg-[#2563EB] flex-shrink-0 relative">
            <div className="absolute inset-0 rounded-full bg-[#2563EB] animate-ping opacity-75" />
          </div>
          <div className="pt-0.5">
            <div className="text-[14px] font-semibold text-[#2563EB]">En attente de confirmation</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { order: OrderWithDetails };

export function OrderDetailClient({ order }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const banner = STATUS_BANNER[order.status];

  const run = (action: (id: string) => Promise<void>) => {
    startTransition(async () => {
      await action(order.id);
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[480px] mx-auto pb-28">

        {/* Top bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-center relative border-b border-[#E2E8F0]">
          <button
            onClick={() => router.back()}
            className="absolute left-4 p-2 -ml-2"
          >
            <ArrowLeft size={20} className="text-[#1C1917]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1C1917]">{order.order_number}</h1>
          <div className="absolute right-4">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Status banner */}
        <div
          className="h-11 flex items-center justify-center"
          style={{ backgroundColor: banner.bg }}
        >
          <span className="text-[14px] font-medium" style={{ color: banner.text }}>
            {banner.label}
          </span>
        </div>

        <div className="p-4 space-y-3">

          {/* Client card */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h3 className="text-[16px] font-semibold text-[#1C1917]">Client</h3>
            <div className="flex items-center gap-3">
              <User size={18} className="text-[#78716C] flex-shrink-0" />
              <span className="text-[14px] font-semibold text-[#1C1917]">
                {order.customer?.full_name ?? '—'}
              </span>
            </div>
            {order.customer?.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#78716C] flex-shrink-0" />
                <a
                  href={`tel:${order.customer.phone}`}
                  className="text-[14px] text-[#2563EB] hover:underline"
                >
                  {order.customer.phone}
                </a>
              </div>
            )}
            {order.customer?.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#78716C] mt-0.5 flex-shrink-0" />
                <span className="text-[14px] text-[#78716C]">{order.customer.address}</span>
              </div>
            )}
          </div>

          {/* Articles + totals */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">Articles commandés</h3>
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
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#1C1917] truncate">{item.name_fr}</div>
                    <div className="text-[12px] text-[#78716C]">x{item.quantity}</div>
                  </div>
                  <div className="text-[14px] font-semibold text-[#1C1917] flex-shrink-0">
                    {formatMAD(item.unit_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E2E8F0] mt-4 pt-3 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#78716C]">Sous-total</span>
                <span className="text-[#1C1917]">{formatMAD(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#78716C]">Livraison</span>
                <span className="text-[#E8632A]">{formatMAD(order.delivery_fee)}</span>
              </div>
              <div className="border-t-2 border-[#E2E8F0] pt-2 flex justify-between">
                <span className="text-[16px] font-semibold text-[#1C1917]">Total</span>
                <span className="text-[20px] font-semibold text-[#1C1917]">{formatMAD(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <PaymentBadge method={order.payment_method as PaymentMethod} />
            <span className="text-[14px] text-[#1C1917]">
              {order.payment_method === 'cod'
                ? 'Paiement à la livraison'
                : order.payment_method === 'terminal'
                ? 'Paiement par terminal'
                : 'Paiement par carte'}
            </span>
          </div>

          {/* Delivery timeline */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-4">Statut de livraison</h3>
            <DeliveryTimeline status={order.status} />
          </div>

          {/* Date info */}
          <p className="text-xs text-[#A8A29E] text-center">
            Commandé le {formatDate(order.created_at)}
          </p>

        </div>
      </div>

      {/* Fixed action bar */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 max-w-[480px] mx-auto">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 h-12 text-[#78716C]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Mise à jour…
            </div>
          ) : (
            <div className="flex gap-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => run(confirmOrderAction)}
                    className="flex-1 h-12 bg-[#2563EB] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 h-12 border-[1.5px] border-[#DC2626] text-[#DC2626] text-[14px] font-semibold rounded-lg hover:bg-[#FEF2F2] transition-colors"
                  >
                    Annuler
                  </button>
                </>
              )}
              {order.status === 'confirmed' && (
                <button
                  onClick={() => run(dispatchOrderAction)}
                  className="flex-1 h-12 bg-[#E8632A] text-white text-[14px] font-semibold rounded-lg hover:bg-[#d45424] transition-colors"
                >
                  Marquer comme expédiée
                </button>
              )}
              {order.status === 'dispatched' && (
                <button
                  onClick={() => run(deliverOrderAction)}
                  className="flex-1 h-12 bg-[#16A34A] text-white text-[14px] font-semibold rounded-lg hover:bg-[#158a3c] transition-colors"
                >
                  Marquer comme livrée
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-[18px] font-semibold text-[#1C1917] mb-2">Annuler cette commande ?</h3>
            <p className="text-[14px] text-[#78716C] mb-6">Cette action ne peut pas être annulée.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-10 border border-[#E2E8F0] text-[#1C1917] text-[14px] font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors"
              >
                Non
              </button>
              <button
                onClick={() => { setShowCancelModal(false); run(cancelOrderAction); }}
                className="flex-1 h-10 bg-[#DC2626] text-white text-[14px] font-medium rounded-lg hover:bg-[#b91c1c] transition-colors"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
