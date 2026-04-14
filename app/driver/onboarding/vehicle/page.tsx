'use client';

import { useState } from 'react';
import { Bike, PersonStanding, Car, MoreHorizontal, Check } from 'lucide-react';
import { StickyCTA } from '../../_components/StickyCTA';
import { saveVehicleTypeAction } from '../actions';

type VehicleType = 'moto' | 'velo' | 'voiture' | 'autre';

const OPTIONS: { type: VehicleType; label: string; sub: string; Icon: React.ElementType }[] = [
  { type: 'moto',    label: 'Moto / Scooter', sub: 'Le plus courant',     Icon: Bike },
  { type: 'velo',    label: 'Vélo',           sub: 'Livraison verte',     Icon: PersonStanding },
  { type: 'voiture', label: 'Voiture',         sub: 'Grande capacité',     Icon: Car },
  { type: 'autre',   label: 'Autre',           sub: 'Précisez ci-dessous', Icon: MoreHorizontal },
];

export default function VehiclePage() {
  const [selected, setSelected] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAFAF9] pb-24">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-1 w-1/4 transition-all" style={{ backgroundColor: 'var(--color-primary)' }} />
      </div>
      <p className="text-xs text-[#78716C] text-right pr-4 pt-1">Étape 1 sur 4</p>

      <div className="px-6 pt-6">
        <h1 className="text-[22px] font-bold text-[#1C1917]">Votre véhicule</h1>
        <p className="text-sm text-[#78716C] mt-1">Quel type de véhicule utilisez-vous pour livrer ?</p>

        <div className="mt-6 space-y-3">
          {OPTIONS.map(({ type, label, sub, Icon }) => {
            const active = selected === type;
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className="w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all"
                style={{
                  borderColor: active ? 'var(--color-primary)' : '#E2E8F0',
                  background: active ? 'color-mix(in srgb, var(--color-primary) 5%, white)' : 'white',
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={active ? { backgroundColor: 'var(--color-primary)' } : { backgroundColor: '#F5F5F4' }}>
                  <Icon className="w-5 h-5" style={{ color: active ? 'white' : '#78716C' }} />
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold" style={{ color: active ? 'var(--color-primary)' : '#1C1917' }}>{label}</div>
                  <div className="text-xs text-[#78716C] mt-0.5">{sub}</div>
                </div>
                {active && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <StickyCTA
        label="Continuer"
        disabled={!selected}
        loading={loading}
        onClick={() => { if (selected) { setLoading(true); saveVehicleTypeAction(selected); } }}
      />
    </main>
  );
}
