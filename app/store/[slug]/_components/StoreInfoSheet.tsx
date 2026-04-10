'use client';

import { Drawer } from 'vaul';
import { Phone } from 'lucide-react';

import type { Merchant } from '@/types/supabase';
import { BASE_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '../_lib/deliveryUtils';

interface StoreInfoSheetProps {
  merchant: Merchant;
  isOpen: boolean;
  onClose: () => void;
}

const SCHEDULE = [
  { day: 'Lundi', hours: '9h–20h' },
  { day: 'Mardi', hours: '9h–20h' },
  { day: 'Mercredi', hours: '9h–20h' },
  { day: 'Jeudi', hours: '9h–20h' },
  { day: 'Vendredi', hours: '9h–20h' },
  { day: 'Samedi', hours: '9h–20h' },
  { day: 'Dimanche', hours: '10h–18h' },
];

export function StoreInfoSheet({
  merchant,
  isOpen,
  onClose,
}: StoreInfoSheetProps) {
  // Dynamic day highlight
  const dayNames = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];
  const today = dayNames[new Date().getDay()];

  // Free-delivery threshold in MAD
  const freeThresholdMAD =
    merchant.delivery_free_threshold != null
      ? merchant.delivery_free_threshold / 100
      : FREE_DELIVERY_THRESHOLD;

  // Logo initials
  const initials = merchant.store_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Mapbox static map URL
  const mapUrl =
    merchant.location_lat != null && merchant.location_lng != null
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+2563eb(${merchant.location_lng},${merchant.location_lat})/${merchant.location_lng},${merchant.location_lat},13,0/400x200@2x?access_token=REMOVED_DEMO_TOKEN`
      : null;

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] flex flex-col">
          <div className="flex-shrink-0">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Store identity */}
            <div className="flex flex-col items-center text-center mb-6">
              {merchant.logo_url ? (
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                  <img
                    src={merchant.logo_url}
                    alt={merchant.store_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-[18px] mb-3">
                  {initials}
                </div>
              )}
              <Drawer.Title className="font-bold text-[18px] mb-1">
                {merchant.store_name}
              </Drawer.Title>
              {merchant.category && (
                <Drawer.Description className="text-[13px] text-[#78716C]">
                  {merchant.category}
                </Drawer.Description>
              )}
            </div>

            {/* Description */}
            {merchant.description && (
              <p className="text-[14px] text-[#78716C] mb-6">
                {merchant.description}
              </p>
            )}

            {/* Schedule */}
            <div className="mb-6">
              <h3 className="font-bold text-[15px] mb-3">Horaires</h3>
              <div className="space-y-2">
                {SCHEDULE.map((item) => (
                  <div
                    key={item.day}
                    className={`flex justify-between text-[14px] py-1.5 px-3 rounded ${
                      item.day === today
                        ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                        : ''
                    }`}
                  >
                    <span>{item.day}</span>
                    <span>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            {(mapUrl != null || merchant.location_description != null) && (
              <div className="mb-6">
                <h3 className="font-bold text-[15px] mb-3">Localisation</h3>
                {mapUrl != null && (
                  <div className="bg-gray-200 h-[200px] rounded-lg mb-2 relative overflow-hidden">
                    <img
                      src={mapUrl}
                      alt="Carte"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {merchant.location_description != null && (
                  <p className="text-[14px] text-[#78716C]">
                    {merchant.location_description}
                  </p>
                )}
              </div>
            )}

            {/* Delivery */}
            <div className="mb-6">
              <h3 className="font-bold text-[15px] mb-3">Livraison</h3>
              <div className="bg-[#EFF6FF] border border-[#2563EB] rounded-lg px-4 py-3">
                <p className="text-[14px] text-[#2563EB]">
                  Livraison {BASE_DELIVERY_FEE} MAD · Gratuite dès{' '}
                  {freeThresholdMAD} MAD d&apos;achat
                </p>
              </div>
            </div>

            {/* Call button */}
            {merchant.phone != null && (
              <a
                href={`tel:${merchant.phone}`}
                className="w-full h-12 border-2 border-[#2563EB] text-[#2563EB] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#EFF6FF] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Appeler la boutique
              </a>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
