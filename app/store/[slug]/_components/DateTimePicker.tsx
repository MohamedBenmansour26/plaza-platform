'use client';

import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';

type DayConfig = { open: boolean; from?: string; to?: string };

interface DateTimePickerProps {
  value?: { date?: Date; time?: string };
  onChange: (value: { date: Date; time: string }) => void;
  workingHours?: Record<string, DayConfig> | null;
}

// All default hourly slots 09:00–20:00 (last slot starts at 19:00, ends 20:00)
const ALL_TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00',
];

const DAY_NAMES_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function getSlotsForDate(
  date: Date | undefined,
  workingHours: Record<string, DayConfig> | null | undefined,
): { slots: string[]; closed: boolean } {
  if (!date) return { slots: ALL_TIME_SLOTS, closed: false };

  if (workingHours) {
    const dayName = DAY_NAMES_FR[date.getDay()];
    const dayConfig = workingHours[dayName];

    if (dayConfig !== undefined) {
      if (dayConfig.open === false) {
        return { slots: [], closed: true };
      }
      if (dayConfig.open === true && dayConfig.from && dayConfig.to) {
        const filtered = ALL_TIME_SLOTS.filter(
          (slot) => slot >= dayConfig.from! && slot < dayConfig.to!,
        );
        return { slots: filtered, closed: false };
      }
    }
  }

  return { slots: ALL_TIME_SLOTS, closed: false };
}

export default function DateTimePicker({ value, onChange, workingHours }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value?.date);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(value?.time);

  const { slots: timeSlots, closed: isClosed } = useMemo(
    () => getSlotsForDate(selectedDate, workingHours),
    [selectedDate, workingHours],
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Reset selected time if the current time is no longer available for the new date
      const { slots } = getSlotsForDate(date, workingHours);
      if (selectedTime && !slots.includes(selectedTime)) {
        setSelectedTime(undefined);
      } else if (selectedTime && slots.includes(selectedTime)) {
        onChange({ date, time: selectedTime });
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onChange({ date: selectedDate, time });
      setIsOpen(false);
    }
  };

  const displayText =
    selectedDate && selectedTime
      ? `${format(selectedDate, 'EEEE d MMMM', { locale: fr })} à ${selectedTime}`
      : 'Sélectionner date et heure';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="storefront-input w-full h-12 px-4 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] flex items-center justify-between transition-colors hover:border-[var(--color-primary)] active:scale-[0.99]"
        data-testid="customer-checkout-datetime-open-btn"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#78716C]" />
          <span className={selectedDate && selectedTime ? 'text-[#1C1917]' : 'text-[#A8A29E]'}>
            {displayText}
          </span>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-[#78716C] transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden max-w-2xl"
          >
            <div className="grid lg:grid-cols-2 divide-x divide-[#E2E8F0]">
              {/* Calendar Section */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E2E8F0]">
                  <CalendarIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <h3 className="font-medium text-[15px]">Sélectionner la date</h3>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date < new Date() ||
                    date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  }
                  locale={fr}
                  className="w-full"
                />
              </div>

              {/* Time Slots Section */}
              <div className="p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E2E8F0]">
                  <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <h3 className="font-medium text-[15px]">
                    Sélectionner l&apos;heure
                    {!selectedDate && (
                      <span className="text-[13px] text-[#A8A29E] ml-2">
                        (choisissez d&apos;abord une date)
                      </span>
                    )}
                  </h3>
                </div>

                {isClosed ? (
                  <p className="text-[14px] text-amber-600 font-medium py-4">
                    La boutique est fermée ce jour
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 flex-1 content-start">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeSelect(time)}
                        disabled={!selectedDate}
                        className={`h-11 rounded-lg text-[14px] font-medium transition-all active:scale-[0.97] ${
                          selectedTime === time
                            ? 'text-white hover:brightness-[0.92]'
                            : selectedDate
                              ? 'bg-[#FAFAF9] hover:border-[var(--color-primary)] border border-[#E2E8F0]'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed active:scale-100'
                        }`}
                        style={selectedTime === time ? { backgroundColor: 'var(--color-primary)' } : {}}
                        data-testid="customer-checkout-datetime-slot-btn"
                        data-slot={time}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedDate && selectedTime && !isClosed && (
              <div className="p-4 border-t" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                <div className="flex items-center justify-between">
                  <div className="text-[14px]">
                    <span className="text-[#78716C]">Livraison prévue :</span>
                    <span className="ml-2 font-medium" style={{ color: 'var(--color-primary)' }}>
                      {format(selectedDate, 'EEEE d MMMM', { locale: fr })} à {selectedTime}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-white rounded-lg text-[14px] font-medium transition-all hover:brightness-[0.92] active:scale-[0.97]"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    data-testid="customer-checkout-datetime-confirm-btn"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
