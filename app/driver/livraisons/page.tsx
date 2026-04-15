import { createClient } from '@/lib/supabase/server'
import { getDriverProfile, getActiveDeliveries, getPoolDeliveries } from '@/lib/db/driver'
import { redirect } from 'next/navigation'
import { LivraisonsClient } from './_components/LivraisonsClient'

export default async function LivraisonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/driver/auth/phone')

  const driver = await getDriverProfile(user.id)
  if (!driver) redirect('/driver/auth/phone')
  if (driver.onboarding_status !== 'active') redirect('/driver/onboarding/pending')

  // Parallel fetch: pool + active deliveries
  // Pool only fetched if driver is eligible: city set, available, active
  const [poolDeliveries, activeDeliveries] = await Promise.all([
    driver.city && driver.is_available && driver.onboarding_status === 'active'
      ? getPoolDeliveries(driver.city)
      : Promise.resolve([]),
    getActiveDeliveries(driver.id),
  ])

  return (
    <LivraisonsClient
      driver={driver}
      initialDeliveries={activeDeliveries}
      initialPool={poolDeliveries}
      driverCity={driver.city ?? ''}
    />
  )
}
