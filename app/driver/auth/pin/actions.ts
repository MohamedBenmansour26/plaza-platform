'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { findDriverByPhone } from '@/lib/db/driver';

type PinLoginResult = { error: string } | undefined;

export async function verifyDriverPinAction(
  phone: string,
  pin: string,
): Promise<PinLoginResult> {
  if (!phone || pin.length !== 4) return { error: 'invalid_input' };

  const syntheticEmail = `${phone.replace('+', '')}@plaza-driver.internal`;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: pin,
  });
  if (error) return { error: 'invalid_pin' };

  // Check onboarding status — active drivers go to livraisons
  const driver = await findDriverByPhone(phone);
  if (!driver || driver.onboarding_status === 'pending_onboarding') {
    redirect('/driver/onboarding/vehicle');
  }
  if (driver.onboarding_status === 'pending_validation') {
    redirect('/driver/onboarding/pending');
  }
  redirect('/driver/livraisons');
}
