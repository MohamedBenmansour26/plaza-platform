'use client';

import { useMemo } from 'react';
import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { isToday } from 'date-fns/isToday';
import { isTomorrow } from 'date-fns/isTomorrow';
import { fr } from 'date-fns/locale/fr';

// All possible hourly slots 09:00–20:00
const ALL_SLOTS = [
  '09:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00',
  '13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00',
  '17:00-18:00','18:00-19:00','19:00-20:00',
];

interface WorkingHours {
  [day: string]: { open: string; close: string } | null;
}

interface Props {
  selectedDate: Date | null;
  selectedSlot: string;
  onDateChange: (date: Date) => void;
  onSlotChange: (slot: string) => void;
  workingHours?: WorkingHours | null;
}

export function DeliverySlotPicker({ selectedDate, selectedSlot, onDateChange, onSlotChange, workingHours }: Props) {
  // Generate date options: today + next 7 days
  const dateOptions = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => addDays(new Date(), i));
  }, []);

  // Filter slots for the selected date based on merchant working hours
  const availableSlots = useMemo(() => {
    if (!selectedDate) return ALL_SLOTS;

    // Filter by merchant working hours if provided
    if (workingHours) {
      const dayName = format(selectedDate, 'EEEE', { locale: fr }).toLowerCase();
      const hours = workingHours[dayName];
      if (hours) {
        return ALL_SLOTS.filter((slot) => {
          const [start] = slot.split('-');
          return start >= hours.open && start < hours.close;
        });
      }
    }

    // If today, filter out past slots
    if (isToday(selectedDate)) {
      const nowHour = new Date().getHours();
      return ALL_SLOTS.filter((slot) => {
        const startHour = parseInt(slot.split(':')[0], 10);
        return startHour > nowHour;
      });
    }

    return ALL_SLOTS;
  }, [selectedDate, workingHours]);

  function formatDateLabel(date: Date) {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEE d MMM', { locale: fr });
  }

  function formatSlotLabel(slot: string) {
    const [start, end] = slot.split('-');
    return `${start} – ${end}`;
  }

  return (
    <div className="space-y-4">
      {/* Date chips */}
      <div>
        <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
          Date de livraison <span className="text-[#DC2626]">*</span>
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dateOptions.map((date) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => onDateChange(date)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-[13px] font-medium border transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#1C1917] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {formatDateLabel(date)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slot dropdown */}
      <div>
        <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
          Heure de livraison <span className="text-[#DC2626]">*</span>
        </label>
        {availableSlots.length === 0 ? (
          <p className="text-[13px] text-[#78716C]">Aucun créneau disponible pour cette date.</p>
        ) : (
          <select
            value={selectedSlot}
            onChange={(e) => onSlotChange(e.target.value)}
            className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-lg text-[15px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {formatSlotLabel(slot)}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
