'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Power, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BottomNav } from '../../_components/BottomNav';
import { OfflineBanner } from '../../_components/OfflineBanner';
import { UrgencyPill } from '../../_components/UrgencyPill';
import { NewAssignmentOverlay } from './NewAssignmentOverlay';
import { PoolCard } from './PoolCard';
import type { DriverProfile, DriverDelivery } from '@/lib/db/driver';
import type { PoolDelivery } from '@/lib/dispatch/types';

type Props = {
  driver: DriverProfile;
  initialDeliveries: DriverDelivery[];
  initialPool:  PoolDelivery[];
  driverCity:   string;
};

function minutesUntilSlotEnd(slot: string | null): number {
  if (!slot) return 999;
  // slot format: "14:00-15:00"
  const end = slot.split('-')[1];
  if (!end) return 999;
  const [h, m] = end.split(':').map(Number);
  const now = new Date();
  const slotEnd = new Date();
  slotEnd.setHours(h, m, 0, 0);
  return Math.max(0, Math.round((slotEnd.getTime() - now.getTime()) / 60000));
}

export function LivraisonsClient({ driver, initialDeliveries, initialPool, driverCity }: Props) {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(driver.is_available);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [deliveries, _setDeliveries] = useState(initialDeliveries);
  const [pool, setPool] = useState<PoolDelivery[]>(initialPool);
  const [pendingAssignment, setPendingAssignment] = useState<DriverDelivery | null>(null);

  const hasActiveDelivery = deliveries.some(
    d => d.status === 'accepted' || d.status === 'picked_up'
  );

  // Real-time subscription for new assignments
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('driver-assignments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deliveries',
          filter: `driver_id=eq.${driver.id}`,
        },
        (payload) => {
          const row = payload.new as { status: string; id: string };
          if (row.status === 'accepted') {
            // Fetch full delivery details then show overlay
            fetch(`/api/driver/deliveries/${row.id}`)
              .then(r => r.json())
              .then((d: DriverDelivery) => setPendingAssignment(d))
              .catch(() => {/* silently ignore — driver will see it on list refresh */});
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driver.id]);

  // Real-time subscription for pool deliveries in the driver's city
  useEffect(() => {
    if (!driverCity) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`deliveries:pool:${driverCity}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries',
          filter: `pickup_city=eq.${driverCity}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.status === 'available') {
            setPool(prev => {
              const exists = prev.some(d => d.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new as PoolDelivery].sort(
                (a, b) => new Date(a.pool_created_at).getTime() - new Date(b.pool_created_at).getTime()
              );
            });
          }
          if (payload.eventType === 'UPDATE' && payload.new.status !== 'available') {
            setPool(prev => prev.filter(d => d.id !== payload.new.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driverCity]);

  async function toggleAvailability() {
    if (availabilityLoading) return;
    const prev = isAvailable;
    const next = !isAvailable;
    setIsAvailable(next);           // Optimistic update
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from('drivers')
      .update({ is_available: next } as never)
      .eq('id', driver.id);
    setAvailabilityLoading(false);
    if (error) {
      setIsAvailable(prev);         // Revert on failure
      setAvailabilityError('Impossible de mettre à jour votre disponibilité. Réessayez.');
      setTimeout(() => setAvailabilityError(null), 4000);
    }
  }

  const toCollect  = deliveries.filter(d => d.status === 'accepted');
  const inDelivery = deliveries.filter(d => d.status === 'picked_up');

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-[#1C1917]">Mes livraisons</h1>
          <p className="text-[13px] text-[#78716C]">{deliveries.length} livraison{deliveries.length !== 1 ? 's' : ''} active{deliveries.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={toggleAvailability}
          disabled={availabilityLoading}
          className="flex items-center gap-2 disabled:opacity-60"
          aria-label={isAvailable ? 'Passer hors ligne' : 'Passer en ligne'}
        >
          {availabilityLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#78716C]" />
          ) : (
            <div className={`w-11 h-6 rounded-full transition-colors relative ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isAvailable ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          )}
          <span className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-[#78716C]'}`}>
            {isAvailable ? 'En ligne' : 'Hors ligne'}
          </span>
        </button>
      </header>

      {/* Availability update error */}
      {availabilityError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-[13px] text-red-700 text-center">
          {availabilityError}
        </div>
      )}

      {/* Offline banner */}
      {!isAvailable && <OfflineBanner onGoOnline={toggleAvailability} />}

      {/* Content */}
      <div className="px-4 pt-3 pb-20">
        {!isAvailable && deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3">
            <Power className="w-12 h-12 text-[#A8A29E]" />
            <p className="text-base text-[#78716C]">Vous êtes hors ligne</p>
            <p className="text-[13px] text-[#A8A29E] text-center">Activez votre disponibilité pour recevoir des commandes</p>
          </div>
        ) : deliveries.length === 0 && pool.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3">
            <Package className="w-12 h-12 text-[#A8A29E]" />
            <p className="text-[16px] text-[#78716C]">Aucune livraison active</p>
          </div>
        ) : (
          <>
            {/* Pool section — hidden when driver has an active delivery */}
            {!hasActiveDelivery && (
              <section className="mb-4">
                {pool.length > 0 ? (
                  <>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
                      Dans votre zone
                    </p>
                    <div className="flex flex-col gap-3">
                      {pool.map(d => <PoolCard key={d.id} delivery={d} />)}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                    Aucune livraison disponible pour le moment
                  </div>
                )}
              </section>
            )}

            {toCollect.length > 0 && (
              <>
                <p className="text-[13px] font-semibold uppercase tracking-wider text-[#78716C] mb-3">À collecter ({toCollect.length})</p>
                {toCollect.map(d => (
                  <DeliveryCard key={d.id} delivery={d} onClick={() => router.push(`/driver/livraisons/${d.id}`)} />
                ))}
              </>
            )}
            {inDelivery.length > 0 && (
              <>
                <p className="text-[13px] font-semibold uppercase tracking-wider text-[#78716C] mt-4 mb-3">En livraison ({inDelivery.length})</p>
                {inDelivery.map(d => (
                  <DeliveryCard key={d.id} delivery={d} onClick={() => router.push(`/driver/livraisons/${d.id}`)} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <BottomNav />

      {pendingAssignment && (
        <NewAssignmentOverlay
          delivery={pendingAssignment}
          onAccept={() => { setPendingAssignment(null); router.push(`/driver/livraisons/${pendingAssignment.id}`); }}
          onDismiss={() => setPendingAssignment(null)}
        />
      )}
    </div>
  );
}

function DeliveryCard({ delivery, onClick }: { delivery: DriverDelivery; onClick: () => void }) {
  const mins = minutesUntilSlotEnd(delivery.order.delivery_slot);
  const earnings = delivery.driver_earnings_mad ?? 0;

  return (
    <button onClick={onClick} className="w-full bg-white rounded-2xl shadow-sm p-4 mb-3 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[15px] font-bold text-[#1C1917]">{delivery.order.order_number}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{earnings} MAD</span>
          <UrgencyPill minutesRemaining={mins} />
        </div>
      </div>
      {delivery.order.delivery_slot && (
        <p className="text-[13px] text-[#78716C]">🕐 {delivery.order.delivery_slot.replace('-', ' – ')}</p>
      )}
      <p className="text-[13px] text-[#1C1917] mt-1">🏪 {delivery.order.merchant.store_name}</p>
      {delivery.order.customer && (
        <p className="text-[13px] text-[#78716C] mt-0.5">👤 {delivery.order.customer.full_name}</p>
      )}
    </button>
  );
}
