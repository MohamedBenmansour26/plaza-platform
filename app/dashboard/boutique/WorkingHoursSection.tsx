'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { updateWorkingHours } from './actions';
import type { WorkingHours, DaySchedule } from './actions';

// ─── Constants ──────────────────────────────────────────────────────────────

const DAYS = [
  { key: 'lundi',    label: 'Lundi' },
  { key: 'mardi',    label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi',    label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi',   label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
];

const DEFAULT_HOURS: WorkingHours = {
  lundi:    { open: true,  from: '09:00', to: '18:00' },
  mardi:    { open: true,  from: '09:00', to: '18:00' },
  mercredi: { open: true,  from: '09:00', to: '18:00' },
  jeudi:    { open: true,  from: '09:00', to: '18:00' },
  vendredi: { open: true,  from: '09:00', to: '18:00' },
  samedi:   { open: false, from: '',      to: '' },
  dimanche: { open: false, from: '',      to: '' },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  initialHours: WorkingHours;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkingHoursSection({ initialHours }: Props) {
  const [hours, setHours] = useState<WorkingHours>(initialHours);
  const [sameForAll, setSameForAll] = useState(false);
  const [schemaPending, setSchemaPending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function save(next: WorkingHours) {
    startTransition(async () => {
      const result = await updateWorkingHours(next);
      if (result.schemaPending) {
        setSchemaPending(true);
      }
    });
  }

  function scheduleSave(next: WorkingHours) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      save(next);
    }, 500);
  }

  function updateDay(key: string, patch: Partial<DaySchedule>) {
    setHours((prev) => {
      const current = prev[key] ?? DEFAULT_HOURS[key] ?? { open: false, from: '', to: '' };
      const next = { ...prev, [key]: { ...current, ...patch } };
      scheduleSave(next);
      return next;
    });
  }

  function handleSameForAll(checked: boolean) {
    setSameForAll(checked);
    if (checked) {
      const monHours = hours['lundi'] ?? DEFAULT_HOURS['lundi'];
      const next: WorkingHours = {};
      for (const { key } of DAYS) {
        next[key] = { ...monHours };
      }
      setHours(next);
      scheduleSave(next);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
        Horaires d&apos;ouverture
      </h2>

      {/* Schema error banner — shown only if save fails unexpectedly */}
      {schemaPending && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-900 mb-4">
          ℹ️ Les horaires ne peuvent pas être sauvegardés pour le moment. Veuillez réessayer.
        </div>
      )}

      {/* Same hours checkbox */}
      <div className="flex items-center gap-2 mb-5">
        <input
          type="checkbox"
          id="sameForAll"
          checked={sameForAll}
          onChange={(e) => handleSameForAll(e.target.checked)}
          className="w-4 h-4 rounded border-[#E2E8F0] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
        />
        <label htmlFor="sameForAll" className="text-sm text-[#1C1917] cursor-pointer select-none">
          Mêmes horaires tous les jours
        </label>
      </div>

      {/* Days grid */}
      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = hours[key] ?? DEFAULT_HOURS[key] ?? { open: false, from: '', to: '' };
          return (
            <div key={key} className="flex items-center gap-3 flex-wrap">
              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={day.open}
                onClick={() => updateDay(key, { open: !day.open })}
                className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 flex-shrink-0 ${
                  day.open ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'
                }`}
              >
                <span
                  className={`absolute top-0.5 start-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    day.open ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Day label */}
              <span className="w-[80px] text-sm font-medium text-[#1C1917] flex-shrink-0">
                {label}
              </span>

              {/* Time inputs */}
              {day.open ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#78716C]">De :</span>
                  <input
                    type="time"
                    value={day.from}
                    onChange={(e) => updateDay(key, { from: e.target.value })}
                    className="h-8 px-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="text-xs text-[#78716C]">À :</span>
                  <input
                    type="time"
                    value={day.to}
                    onChange={(e) => updateDay(key, { to: e.target.value })}
                    className="h-8 px-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              ) : (
                <span className="text-xs text-[#A8A29E] italic">Fermé</span>
              )}
            </div>
          );
        })}
      </div>

      {isPending && (
        <p className="text-xs text-[#78716C] mt-3">Sauvegarde…</p>
      )}
    </div>
  );
}
