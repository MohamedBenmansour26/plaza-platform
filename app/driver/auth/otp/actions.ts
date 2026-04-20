'use server';

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';

type OtpVerifyResult = { error: string } | undefined;

/**
 * Verify the 6-digit OTP.
 * Stub: any 6-digit code is accepted.
 * TODO: integrate Twilio / Vonage OTP verification here.
 *
 * After verification, check whether the driver already has a PIN:
 *   - user_id is null  → new driver  → redirect to PIN setup
 *   - user_id is set   → returning driver → redirect to PIN login
 */
export async function verifyDriverOtpAction(
  phone: string,
  code: string,
): Promise<OtpVerifyResult> {
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { error: 'invalid_code' };
  }

  // TODO: real OTP check goes here
  // const valid = await smsProvider.verifyOtp(phone, code);
  // if (!valid) return { error: 'wrong_code' };

  // Determine whether this driver already has a PIN by checking if a
  // Supabase Auth user has been created for them (user_id non-null).
  const service = createServiceClient();
  const { data: driver } = await service
    .from('drivers')
    .select('user_id, full_name')
    .eq('phone', phone)
    .maybeSingle<{ user_id: string | null; full_name: string }>();

  const isReturning = driver?.user_id != null;

  if (isReturning) {
    const params = new URLSearchParams({ phone, name: driver!.full_name });
    redirect(`/driver/auth/pin?${params.toString()}`);
  }

  const params = new URLSearchParams({ phone });
  redirect(`/driver/auth/pin-setup?${params.toString()}`);
}
