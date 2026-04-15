'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDriverProfile, acceptDelivery } from '@/lib/db/driver'
import type { AcceptDeliveryResult } from '@/lib/dispatch/types'

export async function acceptDeliveryAction(
  deliveryId: string,
): Promise<AcceptDeliveryResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { accepted: false, reason: 'not_available' }

  const driver = await getDriverProfile(user.id)
  if (!driver || driver.onboarding_status !== 'active') {
    return { accepted: false, reason: 'not_available' }
  }

  const result = await acceptDelivery(deliveryId, driver.id)

  if (result.accepted) {
    redirect(`/driver/livraisons/${deliveryId}`)
  }

  return result
}
