'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Check, RefreshCw, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import type { Order, OrderItem, Customer, OrderStatus } from '@/types/supabase';

type OrderWithRelations = Order & {
  customer: Customer;
  order_items: OrderItem[];
};

interface Step {
  id: number;
  label: string;
  eta?: string;
  completed: boolean;
  current: boolean;
}

function formatDeliverySlot(slot: string | null): string {
  if (!slot) return '';
  return slot.replace('-', ' \u2013 ').replace(/(\d{2}):00/g, '$1h00');
}

function buildSteps(status: OrderStatus, deliverySlot: string | null): Step[] {
  const slotEnd = deliverySlot ? deliverySlot.split('-')[1] : null;
  const steps: Step[] = [
    { id: 1, label: 'Commande re\u00e7ue', completed: false, current: false },
    { id: 2, label: 'En cours de confirmation', eta: 'Dans 30\u201360 min', completed: false, current: false },
    {
      id: 3,
      label: 'En route',
      eta: deliverySlot ? `D\u00e9part ${formatDeliverySlot(deliverySlot)}` : 'Selon votre cr\u00e9neau',
      completed: false,
      current: false,
    },
    {
      id: 4,
      label: 'Livr\u00e9e',
      eta: slotEnd ? `Avant ${slotEnd.replace(':00', 'h00')}` : undefined,
      completed: false,
      current: false,
    },
  ];

  if (status === 'pending') {
    steps[0].completed = true;
    steps[1].current = true;
  } else if (status === 'confirmed') {
    steps[0].completed = true;
    steps[1].completed = true;
    steps[2].current = true;
  } else if (status === 'dispatched') {
    steps[0].completed = true;
    steps[1].completed = true;
    steps[2].completed = true;
    steps[3].current = true;
  } else if (status === 'delivered') {
    steps.forEach((s) => {
      s.completed = true;
      s.current = false;
    });
  }

  return steps;
}

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

  const steps = buildSteps(order.status, order.delivery_slot ?? null);
  const isCancelled = order.status === 'cancelled';

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1500);
  };

  const whatsappHref = merchantPhone
    ? `https://wa.me/212${merchantPhone.replace(/^0/, '')}`
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAF9]" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-2">
          <h1 className="font-bold text-[16px]">Commande #{order.order_number}</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6 space-y-6"
      >
        {/* Order Status */}
        <div className="bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[16px]">\u00c9tat de la commande</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[13px] text-[#2563EB] font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
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
                Cette commande a \u00e9t\u00e9 annul\u00e9e.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed
                          ? 'bg-[#16A34A]'
                          : step.current
                            ? 'bg-[#2563EB] animate-pulse'
                            : 'bg-gray-200'
                      }`}
                    >
                      {step.completed ? (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      ) : step.current ? (
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      ) : null}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-16 ${step.completed ? 'bg-[#16A34A]' : 'bg-gray-200'}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-16">
                    <h3
                      className={`font-medium text-[15px] ${
                        step.completed || step.current ? 'text-[#1C1917]' : 'text-[#A8A29E]'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {step.eta && step.current && (
                      <p className="text-[12px] text-[#78716C] mt-0.5">{step.eta}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {order.customer_pin && (
          <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="flex gap-1.5">
              {String(order.customer_pin).padStart(4, '0').split('').map((d, i) => (
                <div key={i} className="w-8 h-9 bg-white border border-[#2563EB] rounded flex items-center justify-center text-[16px] font-bold text-[#1C1917]">
                  {d}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#78716C] flex-1">Code \u00e0 communiquer au livreur \u00e0 la r\u00e9ception</p>
          </div>
        )}

        {order.delivery_slot && (
          <div className="bg-[#EFF6FF] rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-[#1C1917]">Cr\u00e9neau de livraison</p>
              <p className="text-[13px] text-[#78716C]">{formatDeliverySlot(order.delivery_slot)}</p>
            </div>
          </div>
        )}

        {!order.delivery_slot && order.notes && (
          <div className="bg-[#EFF6FF] rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-[#1C1917]">Cr\u00e9neau demand\u00e9</p>
              <p className="text-[13px] text-[#78716C]">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-[15px]">Informations client</h2>
          <div className="text-[14px] space-y-1">
            <p className="font-medium">
              {order.customer.full_name} \u00b7 {order.customer.phone}
            </p>
            {order.customer.address && (
              <p className="text-[#78716C]">
                {order.customer.address}
                {order.customer.city ? `, ${order.customer.city}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-[15px]">Articles command\u00e9s</h2>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1">
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{item.name_fr}</p>
                  <p className="text-[12px] text-[#78716C]">Qt\u00e9 {item.quantity}</p>
                </div>
                <span className="text-[13px] font-medium">
                  {item.unit_price * item.quantity} MAD
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E2E8F0] pt-3 space-y-1.5">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#78716C]">Sous-total</span>
              <span className="font-medium">{order.subtotal} MAD</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#78716C]">Livraison</span>
              <span className="text-[#16A34A] font-medium">
                {order.delivery_fee === 0 ? 'Gratuite' : `${order.delivery_fee} MAD`}
              </span>
            </div>
            <div className="flex justify-between text-[14px] pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold">Total</span>
              <span className="font-bold">{order.total} MAD</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pb-6">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 border-2 border-[#2563EB] text-[#2563EB] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#EFF6FF] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Contacter la boutique
            </a>
          )}
          <a
            href="mailto:support@plaza.ma"
            className="w-full text-[13px] text-[#78716C] py-2 underline text-center block"
          >
            Besoin d&apos;aide ? Contacter Plaza
          </a>
        </div>
      </motion.div>
    </div>
  );
}
