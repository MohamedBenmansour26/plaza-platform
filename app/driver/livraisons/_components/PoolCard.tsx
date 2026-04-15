'use client'

import { useState } from 'react'
import { MapPin, Clock, Banknote, Loader2 } from 'lucide-react'
import { acceptDeliveryAction } from '@/app/driver/livraisons/accept/actions'
import type { PoolDelivery } from '@/lib/dispatch/types'

type Props = {
  delivery: PoolDelivery
}

export function PoolCard({ delivery }: Props) {
  const [loading, setLoading] = useState(false)
  const [taken, setTaken] = useState(false)

  const expiresAt = new Date(delivery.pool_expires_at)
  const minutesLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60_000))

  async function handleAccept() {
    setLoading(true)
    const result = await acceptDeliveryAction(delivery.id)
    if (!result.accepted) {
      setTaken(true)
      setLoading(false)
    }
    // On success: server action redirects — no further client state needed
  }

  if (taken) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-400">
        Livraison déjà prise
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      {/* Zones */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-white px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400">Retrait</p>
          <p className="text-[13px] font-semibold text-gray-900">{delivery.pickup_city}</p>
        </div>
        <span className="text-gray-400">→</span>
        <div className="flex-1 rounded-lg bg-white px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400">Livraison</p>
          <p className="text-[13px] font-semibold text-gray-900">{delivery.pickup_city}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3 flex gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-white px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[12px] font-semibold text-gray-900">
            {delivery.distance_km != null ? `${delivery.distance_km.toFixed(1)} km` : '— km'}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-white px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[12px] font-semibold text-gray-900">
            {delivery.estimated_duration_min != null ? `~${delivery.estimated_duration_min} min` : '—'}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-white px-3 py-2">
          <Banknote className="h-3.5 w-3.5 text-green-500" />
          <span className="text-[12px] font-semibold text-green-700">
            {delivery.driver_earnings_mad != null ? `${delivery.driver_earnings_mad.toFixed(0)} MAD` : '—'}
          </span>
        </div>
      </div>

      {/* Expiry hint */}
      {minutesLeft <= 5 && (
        <p className="mb-2 text-center text-[11px] text-amber-600">
          Expire dans {minutesLeft} min
        </p>
      )}

      {/* Accept button */}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] font-semibold text-sm text-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accepter'}
      </button>
    </div>
  )
}
