// app/driver/livraisons/[id]/success/page.tsx
// Driver delivery success / summary screen.
// Reads real data from the deliveries row (B5): distance_km, accepted_at→delivered_at
// duration (falls back to estimated_duration_min), driver_earnings_mad.
// Missing values render "—" rather than 0, so the driver is never misinformed.

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliverySummary } from '@/lib/db/driver';

const FALLBACK = '—';

function formatDistance(km: number | null): string {
  if (km == null || !Number.isFinite(km)) return FALLBACK;
  return `${km.toFixed(1)} km`;
}

function formatDuration(minutes: number | null): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return FALLBACK;
  return `${Math.round(minutes)} min`;
}

function formatEarnings(mad: number | null): string {
  if (mad == null || !Number.isFinite(mad)) return FALLBACK;
  return `${Math.round(mad)} MAD`;
}

/**
 * Prefer the actual measured duration (delivered_at - accepted_at) when both
 * timestamps are present. Fall back to the route's estimated_duration_min
 * otherwise, and finally to null (rendered as FALLBACK).
 */
function resolveDurationMinutes(
  acceptedAt: string | null,
  deliveredAt: string | null,
  estimatedMin: number | null,
): number | null {
  if (acceptedAt && deliveredAt) {
    const start = Date.parse(acceptedAt);
    const end = Date.parse(deliveredAt);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return (end - start) / 60_000;
    }
  }
  return estimatedMin;
}

export default async function SuccessPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/driver/auth/phone');

  const driver = await getDriverProfile(user.id);
  if (!driver) redirect('/driver/auth/phone');

  const summary = await getDeliverySummary(params.id, driver.id);
  if (!summary) notFound();

  const durationMin = resolveDurationMinutes(
    summary.accepted_at,
    summary.delivered_at,
    summary.estimated_duration_min,
  );

  return (
    <main className="min-h-screen flex flex-col">
      <div
        className="flex-none h-[45vh] flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #16A34A 0%, #15803D 100%)' }}
      >
        <CheckCircle2 className="w-20 h-20 text-white" strokeWidth={2.5} />
        <h1 className="text-[26px] font-bold text-white mt-3">Livraison effectuée !</h1>
        <span className="mt-2 text-white text-[13px] font-semibold bg-white/20 px-3 py-1 rounded-full">
          ✓ À l&apos;heure
        </span>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl -mt-8 relative px-4 pt-6 pb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <p className="text-[15px] font-bold text-[#1C1917] mb-4">Récapitulatif</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[#78716C] text-sm">Distance parcourue:</span>
              <span
                className="text-sm text-[#1C1917] ml-auto"
                data-testid="driver-delivery-success-distance"
              >
                {formatDistance(summary.distance_km)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#78716C] text-sm">Durée:</span>
              <span
                className="text-sm text-[#1C1917] ml-auto"
                data-testid="driver-delivery-success-duration"
              >
                {formatDuration(durationMin)}
              </span>
            </div>
            <div className="border-t border-gray-100 my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Gains:</span>
              <span
                className="text-base font-bold text-green-600"
                data-testid="driver-delivery-success-earnings"
              >
                {formatEarnings(summary.driver_earnings_mad)}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/driver/livraisons"
          className="block w-full h-[52px] rounded-xl text-base font-bold text-white flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
          data-testid="driver-delivery-success-return-link"
        >
          Retour aux livraisons
        </Link>
      </div>
    </main>
  );
}
