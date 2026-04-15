'use server';

import { redirect } from 'next/navigation';

type OtpVerifyResult = { error: string } | undefined;

/**
 * Verify the 6-digit OTP.
 * Stub: any 6-digit code is accepted.
 * TODO: integrate Twilio / Vonage OTP verification here.
 *
 * isNewDriver = true → redirect to PIN setup (first registration)
 * isNewDriver = false → redirect to PIN login (device change / recovery)
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

  const params = new URLSearchParams({ phone });
  redirect(`/driver/auth/pin-setup?${params.toString()}`);
}
