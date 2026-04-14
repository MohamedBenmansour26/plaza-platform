'use client';

import { useState, useEffect } from 'react';
import { BellRing, Store, MapPin, Clock } from 'lucide-react';
import type { DriverDelivery } from '@/lib/db/driver';

type Props = {
  delivery: DriverDelivery;
  onAccept: () => void;
  onDismiss: () => void;
};

export function NewAssignmentOverlay({ delivery, onAccept, onDismiss }: Props) {
  const [countdown, setCountdown] = useState(30);
  const earnings = Math.round(delivery.order.total * 0.08);

  useEffect(() => {
    if (countdown <= 0) { onDismiss(); return; }
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown, onDismiss]);

  const progress = (countdown / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onDismiss} />
      <div className="relative w-full max-w-[430px] mx-auto bg-white rounded-t-3xl shadow-2xl pb-8">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        </div>

        <div className="px-4">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-[18px] font-bold text-[#1C1917]">Nouvelle livraison assignée !</h2>
          </div>

          <div className="rounded-2xl p-4 mb-4" style={{ background: 'color-mix(in srgb, var(--color-primary) 6%, white)' }}>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-[28px] font-bold" style={{ color: 'var(--color-primary)' }}>{earnings} MAD</span>
              <span className="text-sm text-[#78716C]">par livraison</span>
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#E8632A]" />
                <span className="text-sm text-[#1C1917]">{delivery.order.merchant.store_name}</span>
              </div>
              {delivery.order.customer && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#78716C]" />
                  <span className="text-sm text-[#1C1917]">
                    Livraison: {delivery.order.customer.city ?? delivery.order.customer.address ?? 'Adresse non précisée'}
                  </span>
                </div>
              )}
              {delivery.order.delivery_slot && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#78716C]" />
                  <span className="text-sm text-[#1C1917]">{delivery.order.delivery_slot.replace('-', ' – ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Countdown ring */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-14 h-14">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4"
                  stroke="var(--color-primary)"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[18px] font-bold text-[#1C1917]">{countdown}s</span>
            </div>
            <p className="text-xs text-[#78716C] mt-2">La commande sera réassignée après le délai</p>
          </div>

          <button onClick={onAccept}
            className="w-full h-[52px] rounded-xl text-base font-bold text-white mb-2"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            Voir la commande
          </button>
          <button onClick={onDismiss}
            className="w-full h-11 rounded-xl border border-gray-200 text-[15px] text-[#78716C]">
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}
