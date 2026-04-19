'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Bike, Car, ChevronRight, Inbox, RefreshCw, Truck } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../../_components/DataTable';
import { FilterBar } from '../../../_components/FilterBar';
import { StatusChip } from '../../../_components/StatusChip';

type PendingDriver = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  vehicleType: 'moto' | 'velo' | 'voiture' | 'autre';
  submittedAt: string; // ISO
};

const VEHICLE_ICONS = {
  moto: Bike,
  velo: Bike,
  voiture: Car,
  autre: Truck,
};

const VEHICLE_LABELS = {
  moto: 'Moto',
  velo: 'Vélo',
  voiture: 'Voiture',
  autre: 'Autre',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diff / (60 * 60 * 1000));
  if (hours < 1) return "À l'instant";
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Hier';
  return `Il y a ${days}j`;
}

function daysWaiting(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)));
}

export function PendingQueueClient({
  initialDrivers,
}: {
  initialDrivers: PendingDriver[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const cities = useMemo(() => {
    const unique = Array.from(new Set(initialDrivers.map((d) => d.city)));
    return unique.sort();
  }, [initialDrivers]);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return initialDrivers.filter((d) => {
      if (cityFilter !== 'all' && d.city !== cityFilter) return false;
      if (!normalized) return true;
      return (
        d.fullName.toLowerCase().includes(normalized) ||
        d.phone.includes(normalized)
      );
    });
  }, [initialDrivers, search, cityFilter]);

  const columns: DataTableColumn<PendingDriver>[] = [
    {
      key: 'driver',
      label: 'Livreur',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-semibold text-[#2563EB]">
            {row.fullName
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? '')
              .join('')}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[14px] text-[#1C1917]">
              {row.fullName}
            </div>
            <div className="truncate text-[12px] text-[#78716C]">
              {row.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '160px',
      render: (row) => (
        <span className="tabular-nums text-[13px] text-[#44403C]">
          {row.phone}
        </span>
      ),
    },
    {
      key: 'city',
      label: 'Ville',
      width: '140px',
      render: (row) => (
        <span className="text-[13px] text-[#44403C]">{row.city}</span>
      ),
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      width: '120px',
      render: (row) => {
        const Icon = VEHICLE_ICONS[row.vehicleType];
        return (
          <div className="flex items-center gap-1.5 text-[13px] text-[#44403C]">
            <Icon className="h-3.5 w-3.5 text-[#78716C]" />
            {VEHICLE_LABELS[row.vehicleType]}
          </div>
        );
      },
    },
    {
      key: 'submittedAt',
      label: 'Soumis',
      width: '140px',
      render: (row) => (
        <span
          title={new Date(row.submittedAt).toLocaleString('fr-FR')}
          className="text-[13px] text-[#78716C]"
        >
          {relativeTime(row.submittedAt)}
        </span>
      ),
    },
    {
      key: 'days',
      label: 'Attente',
      width: '110px',
      render: (row) => {
        const days = daysWaiting(row.submittedAt);
        return (
          <StatusChip variant={days >= 2 ? 'pending' : 'neutral'}>
            {days === 0 ? "Aujourd'hui" : days === 1 ? '1 jour' : `${days} jours`}
          </StatusChip>
        );
      },
    },
    {
      key: 'action',
      label: '',
      width: '100px',
      align: 'right',
      render: () => (
        <div className="flex items-center justify-end text-[13px] font-medium text-[#2563EB]">
          Examiner <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
        </div>
      ),
    },
  ];

  const handleRowClick = (driver: PendingDriver) => {
    router.push(`/admin/drivers/${driver.id}`);
  };

  const emptyState = (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <Inbox
        className="h-12 w-12 text-[#A8A29E]"
        strokeWidth={1.5}
      />
      <h3 className="mt-4 text-[18px] font-semibold text-[#1C1917]">
        Aucun dossier en attente
      </h3>
      <p className="mt-1 max-w-[360px] text-[13px] text-[#78716C]">
        Tout est à jour. Les prochaines soumissions apparaîtront ici
        automatiquement.
      </p>
    </div>
  );

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1280px] px-8 pt-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-semibold text-[#1C1917]">
                  Dossiers en attente
                </h1>
                <StatusChip variant="pending">
                  {filtered.length} dossier{filtered.length > 1 ? 's' : ''}
                </StatusChip>
              </div>
              <p className="mt-1 text-[13px] text-[#78716C]">
                {filtered.length === 0
                  ? 'Aucun dossier à traiter pour le moment.'
                  : `${filtered.length} dossier${filtered.length > 1 ? 's' : ''} à vérifier.`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 items-center gap-1.5 rounded-[6px] border border-[#E7E5E4] bg-white px-3 text-[13px] font-medium text-[#1C1917] hover:bg-[#F5F5F4]"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
              />
              Actualiser
            </button>
          </div>
          <div className="mb-4">
            <FilterBar
              search={{
                value: search,
                onChange: setSearch,
                placeholder: 'Rechercher par nom ou téléphone',
              }}
              chips={[
                { key: 'all', label: 'Toutes les villes', active: cityFilter === 'all' },
                ...cities.map((city) => ({
                  key: city,
                  label: city,
                  active: cityFilter === city,
                })),
              ]}
              onChipClick={(key) => setCityFilter(key)}
            />
          </div>
          <DataTable
            columns={columns.filter((c) => c.key !== 'phone')}
            rows={filtered}
            onRowClick={handleRowClick}
            emptyState={emptyState}
            ariaLabel="File d'attente des livreurs"
          />
          <p className="mt-3 text-right text-[12px] text-[#78716C]">
            ↑↓ naviguer · Entrée ouvrir
          </p>
        </div>
      </div>

      {/* Mobile M1 */}
      <div className="block lg:hidden">
        <MobilePendingQueue
          drivers={filtered}
          onRowClick={handleRowClick}
        />
      </div>
    </>
  );
}

function MobilePendingQueue({
  drivers,
  onRowClick,
}: {
  drivers: PendingDriver[];
  onRowClick: (driver: PendingDriver) => void;
}) {
  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)]">
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#E7E5E4] bg-white px-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[18px] font-bold text-[#2563EB]">Plaza</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
            Admin
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-[#EFF6FF]" aria-hidden />
      </div>
      <div className="px-4 py-4">
        <h1 className="text-[20px] font-semibold text-[#1C1917]">
          Dossiers en attente
        </h1>
        <p className="mt-1 text-[13px] text-[#78716C]">
          {drivers.length === 0
            ? 'Aucun dossier à traiter.'
            : `${drivers.length} dossier${drivers.length > 1 ? 's' : ''} à vérifier`}
        </p>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-8">
        {drivers.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Inbox
              className="h-12 w-12 text-[#A8A29E]"
              strokeWidth={1.5}
            />
            <h3 className="mt-4 text-[18px] font-semibold text-[#1C1917]">
              Aucun dossier en attente
            </h3>
            <p className="mt-1 max-w-[320px] text-[13px] text-[#78716C]">
              Tout est à jour. Les prochaines soumissions apparaîtront ici
              automatiquement.
            </p>
          </div>
        ) : (
          drivers.map((driver) => {
            const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];
            const days = daysWaiting(driver.submittedAt);
            return (
              <button
                key={driver.id}
                type="button"
                onClick={() => onRowClick(driver)}
                className="flex w-full flex-col gap-3 rounded-[12px] border border-[#E7E5E4] bg-white p-4 text-left hover:bg-[#FAFAF9]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-[13px] font-semibold text-[#2563EB]">
                    {driver.fullName
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? '')
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-semibold text-[#1C1917]">
                      {driver.fullName}
                    </div>
                    <div className="truncate text-[13px] text-[#78716C]">
                      {driver.phone}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#A8A29E]" />
                </div>
                <div className="flex items-center justify-between text-[13px] text-[#78716C]">
                  <div className="flex items-center gap-1.5">
                    <VehicleIcon className="h-3.5 w-3.5" />
                    {VEHICLE_LABELS[driver.vehicleType]} · {driver.city}
                  </div>
                  <span>{relativeTime(driver.submittedAt)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#F5F5F4] pt-3">
                  <StatusChip variant="pending">
                    {days === 0
                      ? "Aujourd'hui"
                      : days === 1
                        ? '1 jour'
                        : `${days} jours`}
                  </StatusChip>
                  <span className="text-[13px] font-medium text-[#2563EB]">
                    Examiner →
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
