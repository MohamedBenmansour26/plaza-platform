import { MapPin } from 'lucide-react';

import { StatusChip } from '../../_components/StatusChip';

/**
 * Admin — Zones (P0 placeholder).
 *
 * Renders the refreshed list + map overlay shell per brief §2.4/§3.2. The
 * map area is a static illustration (no Mapbox) — the design-refresh PR
 * stays visual-only and avoids deep-compile overhead. A real map renderer
 * will be wired in a later phase.
 */
export default function AdminZonesPage() {
  const zones = [
    { id: 'z-casa', city: 'Casablanca', active: true, drivers: 45, avgTime: '28 min' },
    { id: 'z-rabat', city: 'Rabat', active: true, drivers: 22, avgTime: '32 min' },
    { id: 'z-marrakech', city: 'Marrakech', active: true, drivers: 18, avgTime: '35 min' },
    { id: 'z-fes', city: 'Fès', active: false, drivers: 0, avgTime: '—' },
    { id: 'z-tanger', city: 'Tanger', active: false, drivers: 0, avgTime: '—' },
    { id: 'z-agadir', city: 'Agadir', active: false, drivers: 0, avgTime: '—' },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-8 pt-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1C1917]">Zones</h1>
        <p className="mt-1 text-[13px] text-[#78716C]">
          Zones de livraison actives et inactives. Aperçu visuel — l&apos;édition
          des polygones se branchera en Phase 1.
        </p>
      </div>

      <div className="flex gap-4">
        {/* Map area — illustration only, no Mapbox */}
        <div
          className="flex-1 overflow-hidden rounded-[8px] border border-[#E7E5E4] bg-white"
          data-testid="admin-zones-map"
        >
          <div
            className="flex h-[520px] items-center justify-center"
            style={{ backgroundColor: 'var(--admin-color-bg)' }}
          >
            <div className="text-center">
              <MapPin
                className="mx-auto h-16 w-16 text-[#94A3B8]"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="mt-4 text-[16px] font-semibold text-[#1C1917]">
                Carte des zones
              </div>
              <div className="mt-1 text-[13px] text-[#78716C]">
                Polygones superposés — démonstration visuelle.
              </div>
              <div className="mt-4 flex items-center justify-center gap-5 text-[12px] text-[#78716C]">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: 'var(--admin-color-primary)',
                      opacity: 0.6,
                    }}
                  />
                  Zone active
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: '#94A3B8', opacity: 0.6 }}
                  />
                  Zone inactive
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zones list */}
        <div
          className="w-[320px] overflow-hidden rounded-[8px] border border-[#E7E5E4] bg-white"
          data-testid="admin-zones-list"
        >
          <div className="border-b border-[#E7E5E4] px-4 py-3">
            <h2 className="text-[15px] font-semibold text-[#1C1917]">
              Zones de livraison
            </h2>
            <p className="mt-0.5 text-[12px] text-[#78716C]">
              {zones.filter((z) => z.active).length} actives sur {zones.length}
            </p>
          </div>
          <ul className="flex flex-col">
            {zones.map((zone) => (
              <li
                key={zone.id}
                className="border-b border-[#F5F5F4] last:border-b-0"
                data-testid="admin-zones-list-item"
                data-id={zone.id}
              >
                <div
                  className={
                    zone.active
                      ? 'border-l-[3px] border-[var(--admin-color-primary)] bg-[var(--admin-color-primary-tint)]/40 px-4 py-3'
                      : 'px-4 py-3'
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[14px] font-medium text-[#1C1917]">
                      {zone.city}
                    </div>
                    <StatusChip variant={zone.active ? 'approved' : 'neutral'}>
                      {zone.active ? 'Active' : 'Inactive'}
                    </StatusChip>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-[13px]">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-[#78716C]">
                        Livreurs
                      </div>
                      <div className="mt-0.5 text-[#1C1917] tabular-nums">
                        {zone.drivers}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-[#78716C]">
                        Temps moy.
                      </div>
                      <div className="mt-0.5 text-[#1C1917] tabular-nums">
                        {zone.avgTime}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
