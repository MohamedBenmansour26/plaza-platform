'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getDriverProfile } from '@/lib/db/driver'
import type { DriverScheduleInsert } from '@/types/supabase'

type DaySchedule = {
  day_of_week: number  // 0=Monday, 6=Sunday
  is_active:   boolean
  start_time:  string  // "HH:MM"
  end_time:    string  // "HH:MM"
}

type ScheduleRow = {
  day_of_week: number
  is_active:   boolean
  start_time:  string
  end_time:    string
}

export async function saveScheduleAction(
  schedule: DaySchedule[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const driver = await getDriverProfile(user.id)
  if (!driver) return { success: false, error: 'Driver not found' }

  const rows: DriverScheduleInsert[] = schedule.map(day => ({
    driver_id:   driver.id,
    day_of_week: day.day_of_week,
    is_active:   day.is_active,
    start_time:  day.start_time + ':00',  // "HH:MM" → "HH:MM:SS" for Postgres time
    end_time:    day.end_time   + ':00',
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('driver_schedules')
    .upsert(rows, { onConflict: 'driver_id,day_of_week' }) as { error: { message: string } | null }

  if (error) return { success: false, error: error.message }

  revalidatePath('/driver/profil/horaires')
  return { success: true }
}

export async function getScheduleAction(): Promise<DaySchedule[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return defaultSchedule()

  const driver = await getDriverProfile(user.id)
  if (!driver) return defaultSchedule()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('driver_schedules')
    .select('day_of_week, is_active, start_time, end_time')
    .eq('driver_id', driver.id)
    .order('day_of_week') as { data: ScheduleRow[] | null }

  if (!data || data.length === 0) return defaultSchedule()

  return data.map(row => ({
    day_of_week: row.day_of_week,
    is_active:   row.is_active,
    start_time:  row.start_time.slice(0, 5),  // "HH:MM:SS" → "HH:MM"
    end_time:    row.end_time.slice(0, 5),
  }))
}

function defaultSchedule(): DaySchedule[] {
  return Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    is_active:   false,
    start_time:  '08:00',
    end_time:    '18:00',
  }))
}
