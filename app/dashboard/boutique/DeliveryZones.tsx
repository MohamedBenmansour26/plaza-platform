'use client';

import { MapPin } from 'lucide-react';
import type { DeliveryZone } from '@/types/supabase';

const PLAZA_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Agadir', 'Fès', 'Tanger'];

type Props = {
  initialZones?: DeliveryZone[];
};

export function DeliveryZones({ initialZones: _initialZones }: Props) {
  return (
    <div className="bg-card rounded-xl shadow-card p-6">
      <h2 className="text-base font-semibold text-foreground pb-3 mb-4 border-b border-border">
        Zones de livraison
      </h2>

      <div className="flex items-start gap-2 mb-4">
        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Plaza livre actuellement dans ces villes :
        </p>
      </div>

      {/* design-refresh §2.8 — info badge uses primary tint. */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PLAZA_CITIES.map((city) => (
          <span
            key={city}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/30"
          >
            {city}
          </span>
        ))}
      </div>

      <div className="bg-background border border-border rounded-lg p-3 text-sm text-muted-foreground">
        Vous souhaitez une nouvelle ville ?{' '}
        <a
          href="/dashboard/support"
          className="hover:underline font-medium text-primary"
        >
          Contactez-nous.
        </a>
      </div>
    </div>
  );
}
