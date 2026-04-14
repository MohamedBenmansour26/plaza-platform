'use client';

import { MapPin } from 'lucide-react';
import type { DeliveryZone } from '@/types/supabase';

const PLAZA_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Agadir', 'Fès', 'Tanger'];

type Props = {
  initialZones?: DeliveryZone[];
};

export function DeliveryZones({ initialZones: _initialZones }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
        Zones de livraison
      </h2>

      <div className="flex items-start gap-2 mb-4">
        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
        <p className="text-sm text-[#78716C]">
          Plaza livre actuellement dans ces villes :
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {PLAZA_CITIES.map((city) => (
          <span
            key={city}
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)',
              color: 'var(--color-primary)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
            }}
          >
            {city}
          </span>
        ))}
      </div>

      <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#78716C]">
        Vous souhaitez une nouvelle ville ?{' '}
        <a
          href="/dashboard/support"
          className="hover:underline font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          Contactez-nous.
        </a>
      </div>
    </div>
  );
}
