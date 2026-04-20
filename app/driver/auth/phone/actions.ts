'use server';

import { redirect } from 'next/navigation';
import { findDriverByPhone } from '@/lib/db/driver';

type PhoneCheckResult = { error: string } | undefined;

/**
 * Normalise any Moroccan phone variant to E.164 +212 format.
 *
 * Handles:
 *   0611223344      → +212611223344
 *   +212611223344   → +212611223344  (no double prefix)
 *   611223344       → +212611223344
 */
function normalizePhone(raw: string): string {
  const digits = raw.trim().replace(/^\+212/, '').replace(/^0/, '');
  return '+212' + digits;
}

/**
 * Check if phone belongs to an existing driver.
 * - Returning driver (onboarding_status = 'active'): redirect to PIN login
 * - Driver pending validation: redirect to pending screen (already submitted docs)
 * - New driver: redirect to OTP screen
 */
export async function checkDriverPhoneAction(phone: string): Promise<PhoneCheckResult> {
  const normalized = normalizePhone(phone.replace(/\s/g, ''));
  if (!normalized.match(/^\+212[0-9]{9}$/)) {
    return { error: 'invalid_phone' };
  }
  const cleaned = normalized;

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
