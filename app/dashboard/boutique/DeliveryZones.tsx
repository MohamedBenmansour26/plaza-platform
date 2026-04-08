'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, Plus, MapPin } from 'lucide-react';
import type { DeliveryZone } from '@/types/supabase';
import { addDeliveryZone, deleteDeliveryZone } from './actions';

type Props = {
  initialZones: DeliveryZone[];
};

export function DeliveryZones({ initialZones }: Props) {
  const t = useTranslations('boutique');
  const [zones, setZones] = useState<DeliveryZone[]>(initialZones);
  const [showForm, setShowForm] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [isPendingAdd, startAdd] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    if (!zoneName.trim() || !deliveryFee) return;
    const fd = new FormData();
    fd.set('zone_name', zoneName.trim());
    fd.set('delivery_fee', deliveryFee);
    startAdd(async () => {
      await addDeliveryZone(fd);
      // Optimistic update — server revalidates full page on next navigation
      const feeNum = Math.round(parseFloat(deliveryFee) * 100);
      setZones((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          merchant_id: '',
          zone_name: zoneName.trim(),
          delivery_fee: feeNum,
          created_at: new Date().toISOString(),
        },
      ]);
      setZoneName('');
      setDeliveryFee('');
      setShowForm(false);
    });
  }

  async function handleDelete(zoneId: string) {
    setDeletingId(zoneId);
    try {
      await deleteDeliveryZone(zoneId);
      setZones((prev) => prev.filter((z) => z.id !== zoneId));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
        {t('deliveryZonesTitle')}
      </h2>

      {zones.length === 0 && !showForm && (
        <p className="text-sm text-[#78716C] mb-4">{t('deliveryZonesEmpty')}</p>
      )}

      {zones.length > 0 && (
        <div className="space-y-2 mb-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between py-3 px-3 bg-[#FAFAF9] rounded-lg border border-[#E2E8F0]"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                <span className="text-sm font-medium text-[#1C1917]">{zone.zone_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#78716C]">
                  {(zone.delivery_fee / 100).toFixed(0)} MAD
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(zone.id)}
                  disabled={deletingId === zone.id}
                  className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors disabled:opacity-40"
                  aria-label={t('deliveryZoneDelete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="border border-[#E2E8F0] rounded-lg p-4 mb-4 space-y-3">
          <div>
            <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">
              {t('deliveryZoneName')}
            </label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder={t('deliveryZoneNamePlaceholder')}
              className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">
              {t('deliveryZoneFee')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="30"
                className="w-[120px] h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[#78716C]">MAD</span>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPendingAdd || !zoneName.trim() || !deliveryFee}
              className="h-9 px-4 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
            >
              {isPendingAdd ? t('deliveryZoneSaving') : t('deliveryZoneConfirm')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setZoneName('');
                setDeliveryFee('');
              }}
              className="h-9 px-4 border border-[#E2E8F0] text-[#78716C] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              {t('deliveryZoneCancel')}
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 h-9 px-4 border border-dashed border-[#2563EB] text-[#2563EB] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('deliveryZoneAdd')}
        </button>
      )}
    </div>
  );
}
