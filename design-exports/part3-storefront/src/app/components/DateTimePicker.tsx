import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react";

interface DateTimePickerProps {
  value?: { date?: Date; time?: string };
  onChange: (value: { date: Date; time: string }) => void;
}

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value?.date);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(value?.time);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (selectedTime) {
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

  const displayText = selectedDate && selectedTime
    ? `${format(selectedDate, "EEEE d MMMM", { locale: fr })} à ${selectedTime}`
    : "Sélectionner date et heure";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] flex items-center justify-between hover:border-[#2563EB] transition-colors"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#78716C]" />
          <span className={selectedDate && selectedTime ? "text-[#1C1917]" : "text-[#A8A29E]"}>
            {displayText}
          </span>
        </div>
        <ChevronRight className={`w-5 h-5 text-[#78716C] transition-transform ${isOpen ? "rotate-90" : ""}`} />
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
                  <CalendarIcon className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-medium text-[15px]">Sélectionner la date</h3>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                  locale={fr}
                  className="w-full"
                />
              </div>

              {/* Time Slots Section */}
              <div className="p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E2E8F0]">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-medium text-[15px]">
                    Sélectionner l'heure
                    {!selectedDate && <span className="text-[13px] text-[#A8A29E] ml-2">(choisissez d'abord une date)</span>}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2 flex-1 content-start">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSelect(time)}
                      disabled={!selectedDate}
                      className={`h-11 rounded-lg text-[14px] font-medium transition-all ${
                        selectedTime === time
                          ? "bg-[#2563EB] text-white"
                          : selectedDate
                            ? "bg-[#FAFAF9] hover:bg-[#EFF6FF] hover:border-[#2563EB] border border-[#E2E8F0]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedDate && selectedTime && (
              <div className="p-4 bg-[#EFF6FF] border-t border-[#2563EB]/20">
                <div className="flex items-center justify-between">
                  <div className="text-[14px]">
                    <span className="text-[#78716C]">Livraison prévue :</span>
                    <span className="ml-2 font-medium text-[#2563EB]">
                      {format(selectedDate, "EEEE d MMMM", { locale: fr })} à {selectedTime}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[14px] font-medium hover:bg-[#1d4ed8] transition-colors"
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
