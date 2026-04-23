'use client';

// PRICE RULE: all DB prices are in centimes
// Always divide by 100 before displaying
// Display: (value / 100).toFixed(0) + " MAD"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Check, RefreshCw, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import type { Order, OrderItem, Customer } from '@/types/supabase';
import { MOROCCO_TZ } from '@/lib/timezone';

type OrderItemWithProduct = OrderItem & {
  products: { name_fr: string; image_url: string | null; price: number } | null;
};

type OrderWithRelations = Order & {
  customer: Customer | null;
  order_items: OrderItemWithProduct[];
  merchant: { store_name: string; phone: string | null } | null;
  // Add timestamp fields (may be null until schema migration runs)
  confirmed_at?: string | null;
  dispatched_at?: string | null;
  delivered_at?: string | null;
};

// ─── Helper functions ──────────────────────────────────────────────────────────

function formatDeliverySlot(slot: string | null): string {
  if (!slot) return '';
  return slot.replace('-', ' – ').replace(/(\d{2}):00/g, '$1h00');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: MOROCCO_TZ });
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: MOROCCO_TZ });
}

function formatSlot(slot: string): string {
  // "HH:MM-HH:MM" → "15h00 et 16h00"
  const [start, end] = slot.split('-');
  return `${start.replace(':00', 'h00')} et ${end.replace(':00', 'h00')}`;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineStep {
  key: string;
  label: string;
  sublabel: string;
  done: boolean;
  active: boolean;
  cancelled?: boolean;
}

function getTimelineSteps(order: OrderWithRelations): TimelineStep[] {
  const storeName = order.merchant?.store_name ?? 'la boutique';
  const slot = order.delivery_slot ? formatSlot(order.delivery_slot) : '';
  const dateStr = order.delivery_date ? formatDate(order.delivery_date) : '';

  return [
    {
      key: 'received',
      label: `Commande reçue par ${storeName}`,
      sublabel: formatDateTime(order.created_at),
      done: true,
      active: order.status === 'pending',
    },
    {
      key: 'confirmed',
      label:
        order.status === 'cancelled'
          ? `Commande annulée par ${storeName}`
          : order.status === 'pending'
          ? `En cours de confirmation par ${storeName}`
          : `Commande confirmée par ${storeName}`,
      sublabel: formatDateTime(order.confirmed_at),
      done: ['confirmed', 'dispatched', 'delivered', 'cancelled'].includes(order.status),
      active: order.status === 'pending',
      cancelled: order.status === 'cancelled',
    },
    {
      key: 'pickup',
      label:
        order.status === 'dispatched' || order.status === 'delivered'
          ? `Livraison en cours pour le ${dateStr} entre ${slot}`
          : `Livraison planifiée pour le ${dateStr} entre ${slot}`,
      sublabel: formatDateTime(order.dispatched_at),
      done: ['dispatched', 'delivered'].includes(order.status),
      active: order.status === 'confirmed',
    },
    {
      key: 'delivered',
      label: order.status === 'delivered' ? `Livraison effectuée le ${dateStr}` : 'Livraison',
      sublabel: formatDateTime(order.delivered_at),
      done: order.status === 'delivered',
      active: order.status === 'dispatched',
    },
  ];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  order: OrderWithRelations;
  merchantPhone: string | null;
}

export function OrderStatusClient({ order, merchantPhone }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (order.status === 'delivered' || order.status === 'cancelled') return;
    const interval = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(interval);
  }, [order.status, router]);

  const isCancelled = order.status === 'cancelled';
  const timelineSteps = getTimelineSteps(order);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1500);
  };

  const whatsappHref = merchantPhone
    ? `https://wa.me/212${merchantPhone.replace(/^(\+212|00212|212|0)/, '')}`
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAF9]" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4 gap-3"
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:scale-[0.95]"
          data-testid="customer-order-status-back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-lg font-bold text-[#1C1917] flex-1">
          Commande #{order.order_number}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:scale-[0.95] disabled:opacity-50 disabled:active:scale-100"
          data-testid="customer-order-status-refresh-btn"
        >
          <RefreshCw className={`w-5 h-5 text-[#78716C] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </motion.header>

      <div className="p-4 space-y-4">
        {/* Timeline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5"
        >
          {/* Cancelled banner — always shown when cancelled */}
          {isCancelled && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-[14px] text-red-700 font-medium">
                Cette commande a été annulée.
              </p>
            </div>
          )}

          <div className="space-y-0">
            {timelineSteps.map((step, index) => (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  {step.cancelled ? (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  ) : step.done ? (
                    <div className="w-10 h-10 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  ) : step.active ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                    </div>
                  )}

                  {/* Connector line */}
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        step.done ? 'bg-[#16A34A]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 pb-2 pt-2">
                  {/* Label */}
                  <h3
                    className={`font-semibold ${
                      step.cancelled
                        ? 'text-red-600'
                        : step.done
                        ? 'text-[#16A34A]'
                        : step.active
                        ? ''
                        : 'text-gray-400'
                    }`}
                    style={step.active && !step.done && !step.cancelled ? { color: 'var(--color-primary)' } : {}}
                  >
                    {step.label}
                  </h3>
                  {/* Sublabel — show timestamp when non-empty */}
                  {step.sublabel && (
                    <p className="text-xs text-gray-400 mt-0.5">{step.sublabel}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 space-y-2"
        >
          <h2 className="font-semibold text-[#1C1917] mb-3">Informations client</h2>
          <div className="text-sm">
            <p className="text-[#78716C]">Nom</p>
            <p className="font-medium text-[#1C1917]">{order.customer?.full_name ?? ''}</p>
          </div>
          <div className="text-sm">
            <p className="text-[#78716C]">Téléphone</p>
            <p className="font-medium text-[#1C1917]">{order.customer?.phone ?? ''}</p>
          </div>
          {order.customer?.address && (
            <div className="text-sm">
              <p className="text-[#78716C]">Adresse</p>
              <p className="font-medium text-[#1C1917]">
                {order.customer?.address}
                {order.customer?.city ? `, ${order.customer.city}` : ''}
              </p>
            </div>
          )}
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-5 space-y-3"
        >
          <h2 className="font-semibold text-[#1C1917]">Résumé de commande</h2>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.products?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.products.image_url}
                    alt={item.products.name_fr}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1917] truncate">
                    {item.products?.name_fr ?? item.name_fr}
                  </p>
                  <p className="text-xs text-gray-500">
                    {/* unit_price is in centimes in DB — divide by 100 to display in MAD */}
                    {item.quantity} × {(item.unit_price / 100).toFixed(0)} MAD
                  </p>
                </div>
                <p className="font-semibold text-[#1C1917] text-sm">
                  {/* unit_price is in centimes in DB — divide by 100 to display in MAD */}
                  {(item.unit_price / 100 * item.quantity).toFixed(0)} MAD
                </p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Sous-total</span>
              {/* subtotal is in centimes in DB — divide by 100 to display in MAD */}
              <span className="font-semibold text-[#1C1917]">{(order.subtotal / 100).toFixed(0)} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Livraison</span>
              {/* delivery_fee is in centimes in DB — divide by 100 to display in MAD */}
              <span className={`font-semibold ${order.delivery_fee === 0 ? 'text-[#16A34A]' : 'text-[#1C1917]'}`}>
                {order.delivery_fee === 0 ? 'Gratuite' : `${(order.delivery_fee / 100).toFixed(0)} MAD`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#1C1917]">Total</span>
              {/* total is in centimes in DB — divide by 100 to display in MAD */}
              <span className="font-bold text-xl text-[#1C1917]">{(order.total / 100).toFixed(0)} MAD</span>
            </div>
          </div>
        </motion.div>

        {/* PIN Reminder */}
        {order.customer_pin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
          >
            <p className="text-sm font-semibold text-center" style={{ color: 'var(--color-primary)' }}>
              Code de réception :{' '}
              <span className="text-lg mx-1">
                {String(order.customer_pin).padStart(4, '0').split('').join(' ')}
              </span>{' '}
              — communiquez-le au livreur.
            </p>
          </motion.div>
        )}

        {/* Delivery slot */}
        {order.delivery_slot && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="rounded-xl p-4 flex items-start gap-3"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
          >
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
            <div>
              <p className="text-[13px] font-medium text-[#1C1917]">Créneau de livraison</p>
              <p className="text-[13px] text-[#78716C]">{formatDeliverySlot(order.delivery_slot)}</p>
            </div>
          </motion.div>
        )}

        {/* Contact Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 border-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              data-testid="customer-order-status-whatsapp-link"
            >
              <Phone className="w-4 h-4" />
              Contacter la boutique
            </a>
          )}
        </motion.div>

        {/* Auto-refresh notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-6"
        >
          <p className="text-xs text-[#A8A29E]">
            Mise à jour automatique toutes les 30 secondes
          </p>
          <a
            href="mailto:support@plaza.ma"
            className="text-[13px] text-[#78716C] underline mt-2 block"
            data-testid="customer-order-status-support-link"
          >
            Besoin d&apos;aide ? Contacter Plaza
          </a>
        </motion.div>
      </div>
    </div>
  );
}
