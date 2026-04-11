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
  return slot.replace('-', ' – ').replace(/(\d{2}):00/g, '$1h00');
}

function buildSteps(status: OrderStatus, deliverySlot: string | null): Step[] {
  const slotEnd = deliverySlot ? deliverySlot.split('-')[1] : null;
  const steps: Step[] = [
    { id: 1, label: 'Commande reçue', completed: false, current: false },
    { id: 2, label: 'En cours de confirmation', eta: 'Dans 30–60 min', completed: false, current: false },
    {
      id: 3,
      label: 'En route',
      eta: deliverySlot ? `Départ ${formatDeliverySlot(deliverySlot)}` : 'Selon votre créneau',
      completed: false,
      current: false,
    },
    {
      id: 4,
      label: 'Livrée',
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
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4 gap-3"
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-lg font-bold text-[#1C1917] flex-1">
          Commande #{order.order_number}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50"
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
                Cette commande a été annulée.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed
                          ? 'bg-[#16A34A] text-white'
                          : step.current
                            ? 'bg-[#2563EB] text-white animate-pulse'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.completed ? (
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          step.completed ? 'bg-[#16A34A]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <h3
                      className={`font-semibold ${
                        step.completed
                          ? 'text-[#16A34A]'
                          : step.current
                            ? 'text-[#2563EB]'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {step.eta && step.current && (
                      <p className="text-sm text-[#78716C] mt-0.5">{step.eta}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <p className="font-medium text-[#1C1917]">{order.customer.full_name}</p>
          </div>
          <div className="text-sm">
            <p className="text-[#78716C]">Téléphone</p>
            <p className="font-medium text-[#1C1917]">{order.customer.phone}</p>
          </div>
          {order.customer.address && (
            <div className="text-sm">
              <p className="text-[#78716C]">Adresse</p>
              <p className="font-medium text-[#1C1917]">
                {order.customer.address}
                {order.customer.city ? `, ${order.customer.city}` : ''}
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
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1C1917] truncate">{item.name_fr}</p>
                  <p className="text-[#78716C]">Quantité: {item.quantity}</p>
                </div>
                <p className="font-semibold text-[#1C1917]">
                  {item.unit_price * item.quantity} MAD
                </p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Sous-total</span>
              <span className="font-semibold text-[#1C1917]">{order.subtotal} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Livraison</span>
              <span className={`font-semibold ${order.delivery_fee === 0 ? 'text-[#16A34A]' : 'text-[#1C1917]'}`}>
                {order.delivery_fee === 0 ? 'Gratuite' : `${order.delivery_fee} MAD`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#1C1917]">Total</span>
              <span className="font-bold text-xl text-[#1C1917]">{order.total} MAD</span>
            </div>
          </div>
        </motion.div>

        {/* PIN Reminder */}
        {order.customer_pin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <p className="text-sm text-[#2563EB] font-semibold text-center">
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
            className="bg-[#EFF6FF] rounded-xl p-4 flex items-start gap-3"
          >
            <Clock className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
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
              className="w-full py-3.5 border-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
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
          >
            Besoin d&apos;aide ? Contacter Plaza
          </a>
        </motion.div>
      </div>
    </div>
  );
}
