'use server';

import { redirect } from 'next/navigation';
import { findDriverByPhone } from '@/lib/db/driver';

type PhoneCheckResult = { error: string } | undefined;

/**
 * Check if phone belongs to an existing driver.
 * - Returning driver (onboarding_status = 'active'): redirect to PIN login
 * - Driver pending validation: redirect to pending screen (already submitted docs)
 * - New driver: redirect to OTP screen
 */
export async function checkDriverPhoneAction(phone: string): Promise<PhoneCheckResult> {
  const cleaned = phone.replace(/\s/g, '');
  if (!cleaned.match(/^\+?[0-9]{9,15}$/)) {
    return { error: 'invalid_phone' };
  }

  const driver = await findDriverByPhone(cleaned);

  if (driver) {
    if (driver.onboarding_status === 'active') {
      const params = new URLSearchParams({ phone: cleaned, name: driver.full_name });
      redirect(`/driver/auth/pin?${params.toString()}`);
    }
    if (driver.onboarding_status === 'pending_validation') {
      redirect('/driver/onboarding/pending');
    }
    // pending_onboarding — continue through OTP
  }

  // New driver or pending_onboarding — send OTP
  // TODO: [OTP stub — integrate SMS provider. For now redirect straight to OTP page]
  const params = new URLSearchParams({ phone: cleaned });
  redirect(`/driver/auth/otp?${params.toString()}`);
}
