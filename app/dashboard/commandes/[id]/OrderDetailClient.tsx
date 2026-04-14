'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, User, Phone, MapPin, Check, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/ui/PaymentBadge';
import {
  confirmOrderAction,
} from '../actions';
import { formatMAD, formatDate } from '../OrdersClient';
import type { OrderWithDetails } from '@/lib/db/orders';
import type { OrderStatus, PaymentMethod } from '@/types/supabase';

// ─── Delivery timeline ────────────────────────────────────────────────────────

type StepState = 'done' | 'current' | 'pending';

const ORDER_RANK: Record<OrderStatus | 'received', number> = {
  received:   0,
  pending:    0, // visually = received
  confirmed:  1,
  dispatched: 2,
  delivered:  3,
  cancelled:  -1,
};

type TimelineStep = { key: OrderStatus | 'received'; label: string };

function DeliveryTimeline({ status, steps, pendingLabel }: { status: OrderStatus; steps: TimelineStep[]; pendingLabel: string }) {

  return (
    <div className="space-y-6">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
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
                <div className="w-6 h-6 rounded-full flex-shrink-0 relative" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: 'var(--color-primary)' }} />
                </div>
              )}
              {state === 'pending' && (
                <div className="w-6 h-6 rounded-full border-2 border-[#E2E8F0] bg-white flex-shrink-0" />
              )}
              {!isLast && (
                <div className="absolute top-6 start-3 w-0.5 h-8 bg-[#E2E8F0]" />
              )}
            </div>
            <div className="pt-0.5">
              <div
                className={`text-[14px] ${
                  state === 'done'    ? 'font-medium text-[#1C1917]' :
                  state === 'current' ? 'font-semibold' :
                  'text-[#A8A29E]'
                }`}
                style={state === 'current' ? { color: 'var(--color-primary)' } : undefined}
              >
                {step.label}
              </div>
            </div>
          </div>
        );
      })}

      {/* Extra step for pending orders */}
      {status === 'pending' && (
        <div className="flex gap-3 -mt-2">
          <div className="w-6 h-6 rounded-full flex-shrink-0 relative" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: 'var(--color-primary)' }} />
          </div>
          <div className="pt-0.5">
            <div className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)' }}>{pendingLabel}</div>
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
  const t = useTranslations('orders');
  const [isPending, startTransition] = useTransition();

  // User-facing string arrays MUST be inside the component after t() — see memory.md BUG-013–016
  const STATUS_BANNER: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    pending:    { bg: '#FFF7ED', text: '#E8632A', label: t('banner_pending') },
    confirmed:  { bg: 'color-mix(in srgb, var(--color-primary) 8%, white)', text: 'var(--color-primary)', label: t('banner_confirmed') },
    dispatched: { bg: '#FFF7ED', text: '#E8632A', label: t('banner_dispatched') },
    delivered:  { bg: '#F0FDF4', text: '#16A34A', label: t('banner_delivered') },
    cancelled:  { bg: '#FEF2F2', text: '#DC2626', label: t('banner_cancelled') },
  };

  const STEPS: TimelineStep[] = [
    { key: 'received',   label: t('step_received') },
    { key: 'confirmed',  label: t('step_confirmed') },
    { key: 'dispatched', label: t('step_dispatched') },
    { key: 'delivered',  label: t('step_delivered') },
  ];

  const banner = STATUS_BANNER[order.status];

  const run = (action: (id: string) => Promise<void>) => {
    startTransition(async () => {
      await action(order.id);
      router.refresh();
    });
  };

  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[480px] mx-auto pb-28">

        {/* Top bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-center relative border-b border-[#E2E8F0]">
          <button
            onClick={() => router.back()}
            className="absolute start-4 p-2 -ms-2"
          >
            <ArrowLeft size={20} className="text-[#1C1917]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1C1917]">{order.order_number}</h1>
          <div className="absolute end-4">
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
                  className="text-[14px] hover:underline"
                  style={{ color: 'var(--color-primary)' }}
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
            <DeliveryTimeline status={order.status} steps={STEPS} pendingLabel={t('step_pending_confirmation')} />
          </div>

          {/* Pickup code card — shown after merchant confirms */}
          {order.status === 'confirmed' && order.merchant_pickup_code != null && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)',
              }}
            >
              <p className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)' }}>
                Le coursier viendra chercher votre commande
              </p>
              <div className="text-[13px] space-y-1" style={{ color: 'var(--color-primary)' }}>
                {order.delivery_date && (
                  <p>Date de collecte : <span className="font-medium">{formatDate(order.delivery_date)}</span></p>
                )}
                {order.delivery_slot && (
                  <p>Créneau : <span className="font-medium">{order.delivery_slot}</span></p>
                )}
              </div>
              <div>
                <p className="text-[12px] mb-2" style={{ color: 'var(--color-primary)' }}>
                  Code de collecte à donner au coursier :
                </p>
                <div className="flex gap-2 justify-center">
                  {String(order.merchant_pickup_code).padStart(6, '0').split('').map((digit, i) => (
                    <div
                      key={i}
                      className="w-9 h-11 rounded-lg flex items-center justify-center bg-white text-[18px] font-bold"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-center" style={{ color: 'var(--color-primary)' }}>
                Communiquez ce code uniquement au coursier Plaza assigné à votre commande.
              </p>
            </div>
          )}

          {/* Dispatched info */}
          {order.status === 'dispatched' && (
            <div className="rounded-xl p-4 border border-[#FED7AA] bg-[#FFF7ED]">
              <p className="text-[14px] font-medium text-[#9A3412] text-center">
                En attente du livreur Plaza
              </p>
            </div>
          )}

          {/* Date info */}
          <p className="text-xs text-[#A8A29E] text-center">
            Commandé le {formatDate(order.created_at)}
          </p>

        </div>
      </div>

      {/* Fixed action bar */}
      {isActive && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E2E8F0] p-4 max-w-[480px] mx-auto">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 h-12 text-[#78716C]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Mise à jour…
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {order.status === 'pending' && (
                <button
                  onClick={() => run(confirmOrderAction)}
                  className="w-full h-12 text-white text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Confirmer la commande
                </button>
              )}
              <button
                onClick={() => {
                  window.location.href = `mailto:support@plaza.ma?subject=Problème commande ${order.order_number}&body=Bonjour, je rencontre un problème avec la commande ${order.order_number}.`;
                }}
                className="w-full h-12 border border-[#E2E8F0] text-[#78716C] text-[14px] font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors"
              >
                Signaler un problème
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
