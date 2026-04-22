'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, User, Phone, MapPin, Check, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/ui/PaymentBadge';
import {
  confirmOrderAction,
} from '../actions';
import { formatMAD, formatDate } from '../OrdersClient';
import { ReportIssueSheet } from '../ReportIssueSheet';
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
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-success-foreground" />
                </div>
              )}
              {state === 'current' && (
                <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 relative">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                </div>
              )}
              {state === 'pending' && (
                <div className="w-6 h-6 rounded-full border-2 border-border bg-card flex-shrink-0" />
              )}
              {!isLast && (
                <div className="absolute top-6 start-3 w-0.5 h-8 bg-border" />
              )}
            </div>
            <div className="pt-0.5">
              <div
                className={`text-[14px] ${
                  state === 'done'    ? 'font-medium text-foreground' :
                  state === 'current' ? 'font-semibold text-primary' :
                  'text-muted-foreground'
                }`}
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
          <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 relative">
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
          </div>
          <div className="pt-0.5">
            <div className="text-[14px] font-semibold text-primary">{pendingLabel}</div>
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
  const [reportOpen, setReportOpen] = useState(false);

  // User-facing string arrays MUST be inside the component after t() — see memory.md BUG-013–016
  // design-refresh §2.8 — banners mirror StatusBadge pairings. Pending uses
  // warning tint (amber) rather than orange to match the order-status map.
  const STATUS_BANNER: Record<OrderStatus, { className: string; label: string }> = {
    pending:    { className: 'bg-warning/10 text-warning',            label: t('banner_pending') },
    confirmed:  { className: 'bg-primary/10 text-primary',            label: t('banner_confirmed') },
    dispatched: { className: 'bg-primary/10 text-primary',            label: t('banner_dispatched') },
    delivered:  { className: 'bg-success/10 text-success',            label: t('banner_delivered') },
    cancelled:  { className: 'bg-destructive/10 text-destructive',    label: t('banner_cancelled') },
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
    <div className="min-h-screen bg-background">
      <div className="max-w-[480px] mx-auto pb-28">

        {/* Top bar — per-page mobile bar preserved structurally; tokens only */}
        <div className="bg-card h-14 px-4 flex items-center justify-center relative border-b border-border">
          <button
            onClick={() => router.back()}
            className="absolute start-4 p-2 -ms-2"
            data-testid="merchant-order-detail-back-btn"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-[16px] font-semibold text-foreground">{order.order_number}</h1>
          <div className="absolute end-4">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Status banner — design-refresh §2.8 */}
        <div className={`h-11 flex items-center justify-center ${banner.className}`}>
          <span className="text-[14px] font-medium">{banner.label}</span>
        </div>

        <div className="p-4 space-y-3">

          {/* Client card — brief §2.3 */}
          <div className="bg-card rounded-xl shadow-card p-4 space-y-3">
            <h3 className="text-[16px] font-semibold text-foreground">Client</h3>
            <div className="flex items-center gap-3">
              <User size={18} className="text-muted-foreground flex-shrink-0" />
              <span className="text-[14px] font-semibold text-foreground">
                {order.customer?.full_name ?? '—'}
              </span>
            </div>
            {order.customer?.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-muted-foreground flex-shrink-0" />
                <a
                  href={`tel:${order.customer.phone}`}
                  className="text-[14px] text-primary hover:underline"
                >
                  {order.customer.phone}
                </a>
              </div>
            )}
            {order.customer?.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-[14px] text-muted-foreground">{order.customer.address}</span>
              </div>
            )}
          </div>

          {/* Articles + totals */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-[16px] font-semibold text-foreground mb-3">Articles commandés</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted/60 flex-shrink-0 overflow-hidden">
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
                    <div className="text-[14px] font-medium text-foreground truncate">{item.name_fr}</div>
                    <div className="text-[12px] text-muted-foreground">x{item.quantity}</div>
                  </div>
                  <div className="text-[14px] font-semibold text-foreground flex-shrink-0">
                    {formatMAD(item.unit_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-4 pt-3 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="text-foreground">{formatMAD(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Livraison</span>
                <span className="text-secondary">{formatMAD(order.delivery_fee)}</span>
              </div>
              <div className="border-t-2 border-border pt-2 flex justify-between">
                <span className="text-[16px] font-semibold text-foreground">Total</span>
                <span className="text-[20px] font-semibold text-foreground">{formatMAD(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card rounded-xl shadow-card p-4 flex items-center gap-3">
            <PaymentBadge method={order.payment_method as PaymentMethod} />
            <span className="text-[14px] text-foreground">
              {order.payment_method === 'cod'
                ? 'Paiement à la livraison'
                : order.payment_method === 'terminal'
                ? 'Paiement par terminal'
                : 'Paiement par carte'}
            </span>
          </div>

          {/* Delivery timeline */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Statut de livraison</h3>
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

          {/* Dispatched info — design-refresh §2.8 warning tint */}
          {order.status === 'dispatched' && (
            <div className="rounded-xl p-4 bg-warning/10">
              <p className="text-[14px] font-medium text-warning text-center">
                En attente du livreur Plaza
              </p>
            </div>
          )}

          {/* Date info */}
          <p className="text-xs text-muted-foreground text-center">
            Commandé le {formatDate(order.created_at)}
          </p>

        </div>
      </div>

      {/* Fixed action bar — mobile primary keeps inline `var(--color-primary)` per PLZ-088 */}
      {isActive && (
        <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-4 max-w-[480px] mx-auto">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 h-12 text-muted-foreground">
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
                  data-testid="merchant-order-confirm-btn"
                >
                  Confirmer la commande
                </button>
              )}
              <button
                onClick={() => setReportOpen(true)}
                className="w-full h-12 border border-border text-muted-foreground text-[14px] font-medium rounded-lg hover:bg-muted/40 hover:text-foreground transition-colors"
                data-testid="merchant-order-report-issue-btn"
              >
                Signaler un problème
              </button>
            </div>
          )}
        </div>
      )}

      {reportOpen && (
        <ReportIssueSheet
          order={{ id: order.id, order_number: order.order_number }}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
