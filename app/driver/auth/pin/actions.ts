'use server';

import { createClient } from '@/lib/supabase/server';
import { findDriverByPhone } from '@/lib/db/driver';
import { driverSyntheticEmail } from '@/lib/driver-auth';

export type PinLoginResult = { error: string } | { redirect: string };

// Returns { redirect } instead of calling redirect() so the client can use
// router.push() — this ensures Set-Cookie headers reach the browser before
// navigation (calling redirect() inside a server action drops session cookies).
export async function verifyDriverPinAction(
  phone: string,
  pin: string,
): Promise<PinLoginResult> {
  if (!phone || pin.length !== 4) return { error: 'invalid_input' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: driverSyntheticEmail(phone),
    password: pin,
  });
  if (error) return { error: 'invalid_pin' };

  const driver = await findDriverByPhone(phone);
  if (!driver || driver.onboarding_status === 'pending_onboarding') {
    return { redirect: '/driver/onboarding/vehicle' };
  }
  if (driver.onboarding_status === 'pending_validation') {
    return { redirect: '/driver/onboarding/pending' };
  }
  return { redirect: '/driver/livraisons' };
}
