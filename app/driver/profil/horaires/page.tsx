'use client'

import { useEffect, useState, useTransition } from 'react'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { saveScheduleAction, getScheduleAction } from './actions'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const DAY_SLUGS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

type DaySchedule = {
  day_of_week: number
  is_active:   boolean
  start_time:  string
  end_time:    string
}

export default function HorairesPage() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      is_active:   false,
      start_time:  '08:00',
      end_time:    '18:00',
    }))
  )
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getScheduleAction().then(setSchedule)
  }, [])

  function updateDay(index: number, patch: Partial<DaySchedule>) {
    setSchedule(prev => prev.map((d, i) => i === index ? { ...d, ...patch } : d))
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await saveScheduleAction(schedule)
      setSaved(true)
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[var(--color-primary)] px-4 py-3">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[15px] font-bold text-white">Mes horaires</h1>
      </div>

      <div className="px-4 pt-4">
        <p className="mb-4 text-[13px] text-gray-500">
          Définissez vos jours et heures de travail. Vous apparaissez dans le pool uniquement pendant vos créneaux actifs.
        </p>

        <div className="flex flex-col gap-2">
          {schedule.map((day, i) => (
            <div
              key={day.day_of_week}
              className={`rounded-xl border px-4 py-3 ${day.is_active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center gap-3">
                {/* Day label */}
                <span className="w-8 text-[13px] font-semibold text-gray-900">
                  {DAY_LABELS[i]}
                </span>

                {/* Toggle */}
                <button
                  onClick={() => updateDay(i, { is_active: !day.is_active })}
                  className={`relative h-5 w-9 rounded-full transition-colors ${day.is_active ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
                  data-testid={`driver-horaires-${DAY_SLUGS[i]}-toggle-btn`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${day.is_active ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </button>

                {/* Time inputs — only when active */}
                {day.is_active ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="time"
                      value={day.start_time}
                      onChange={e => updateDay(i, { start_time: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-[13px] text-gray-900"
                      data-testid={`driver-horaires-${DAY_SLUGS[i]}-start-input`}
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="time"
                      value={day.end_time}
                      onChange={e => updateDay(i, { end_time: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-[13px] text-gray-900"
                      data-testid={`driver-horaires-${DAY_SLUGS[i]}-end-input`}
                    />
                  </div>
                ) : (
                  <span className="flex-1 text-[13px] text-gray-400">Jour de repos</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="mt-6 flex h-13 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] font-semibold text-white disabled:opacity-60"
          data-testid="driver-horaires-save-btn"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? 'Enregistré ✓' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
