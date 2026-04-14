'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, User, MapPin, Banknote, Phone, Navigation } from 'lucide-react';
import { UrgencyPill } from '../../../_components/UrgencyPill';
import { StickyCTA } from '../../../_components/StickyCTA';
import type { DriverDelivery } from '@/lib/db/driver';

function minutesUntilSlotEnd(slot: string | null): number {
  if (!slot) return 999;
  const end = slot.split('-')[1];
  if (!end) return 999;
  const [h, m] = end.split(':').map(Number);
  const now = new Date();
  const slotEnd = new Date();
  slotEnd.setHours(h, m, 0, 0);
  return Math.max(0, Math.round((slotEnd.getTime() - now.getTime()) / 60000));
}

export function DeliveryDetailClient({ delivery }: { delivery: DriverDelivery }) {
  const router = useRouter();
  const mins = minutesUntilSlotEnd(delivery.order.delivery_slot);
  const earnings = Math.round(delivery.order.total * 0.08);
  const isCOD = delivery.order.payment_method === 'cod';
  const isToCollect = delivery.status === 'assigned';

  const ctaLabel = isToCollect ? 'Confirmer la collecte' : 'Confirmer la livraison';
  const ctaHref  = isToCollect ? `/driver/livraisons/${delivery.id}/collect` : `/driver/livraisons/${delivery.id}/deliver`;

  function navigate(address: string) {
    const url = `https://maps.google.com/maps?daddr=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-6 h-6 text-[#1C1917]" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-[#1C1917]">{delivery.order.order_number}</h1>
          <p className="text-[13px] text-[#78716C]">{isToCollect ? 'À collecter' : 'En livraison'}</p>
        </div>
      </header>

      <div className="px-4 pt-3 space-y-3">
        {/* Earnings */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#78716C]">Cette livraison</span>
            <span className="text-base font-bold text-green-600">+{earnings} MAD</span>
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
            <span className="text-sm text-[#78716C]">Aujourd&apos;hui total</span>
            <span className="text-sm text-green-600">+{earnings * 5} MAD</span>
          </div>
          <p className="text-xs italic text-[#78716C] mt-2">Virement chaque lundi</p>
        </div>

        {/* Time slot */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-semibold text-[#1C1917]">Créneau demandé</span>
            </div>
            <UrgencyPill minutesRemaining={mins} />
          </div>
          {delivery.order.delivery_slot && (
            <p className="text-2xl font-semibold text-[#1C1917] mt-2 text-center">
              {delivery.order.delivery_slot.replace('-', ' – ')}
            </p>
          )}
          <div className="h-1.5 bg-gray-100 rounded-full mt-3">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, 100 - (mins / 120 * 100))}%`, backgroundColor: 'var(--color-primary)' }} />
          </div>
        </div>

        {/* Client */}
        {delivery.order.customer && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-semibold text-[#1C1917]">Client</span>
            </div>
            <p className="text-[15px] font-bold text-[#1C1917]">{delivery.order.customer.full_name}</p>
            <a href={`tel:${delivery.order.customer.phone}`}
              className="flex items-center gap-2 mt-1 text-sm"
              style={{ color: 'var(--color-primary)' }}>
              <Phone className="w-4 h-4" />
              {delivery.order.customer.phone}
            </a>
          </div>
        )}

        {/* Pickup */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-[#E8632A]" />
            <span className="text-sm font-semibold text-[#1C1917]">Collecte</span>
          </div>
          <p className="text-[15px] font-bold text-[#1C1917]">{delivery.order.merchant.store_name}</p>
          {delivery.order.merchant.location_description && (
            <p className="text-[13px] text-[#78716C] mt-0.5">{delivery.order.merchant.location_description}</p>
          )}
          <button
            onClick={() => navigate(delivery.order.merchant.location_description ?? delivery.order.merchant.store_name)}
            className="mt-2 flex items-center gap-1 px-3 h-9 border rounded-lg text-[13px]"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            <Navigation className="w-3.5 h-3.5" /> Naviguer →
          </button>
        </div>

        {/* Delivery address */}
        {delivery.order.customer && (delivery.order.customer.address || delivery.order.customer.city) && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-[#1C1917]">Livraison</span>
            </div>
            <p className="text-[15px] font-bold text-[#1C1917]">{delivery.order.customer.full_name}</p>
            <p className="text-[13px] text-[#78716C] mt-0.5">
              {delivery.order.customer.address}{delivery.order.customer.city ? `, ${delivery.order.customer.city}` : ''}
            </p>
            <button
              onClick={() => navigate(`${delivery.order.customer!.address ?? ''} ${delivery.order.customer!.city ?? ''}`)}
              className="mt-2 flex items-center gap-1 px-3 h-9 border rounded-lg text-[13px]"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
              <Navigation className="w-3.5 h-3.5" /> Naviguer →
            </button>
          </div>
        )}

        {/* COD */}
        {isCOD && (
          <div className="bg-white rounded-2xl p-4 border-2 border-[#E8632A]">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="w-5 h-5 text-[#E8632A]" />
              <span className="text-sm font-bold text-[#1C1917]">Paiement à la livraison</span>
            </div>
            <p className="text-[28px] font-bold text-[#E8632A]">{delivery.order.total} MAD</p>
            <p className="text-xs text-[#78716C]">À encaisser auprès du client</p>
          </div>
        )}
      </div>

      <StickyCTA
        label={ctaLabel}
        onClick={() => router.push(ctaHref)}
      />
    </div>
  );
}
