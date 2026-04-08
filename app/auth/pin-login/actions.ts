'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type PinLoginInput = { phone: string; pin: string };
type PinLoginResult = { error: string } | undefined;

/**
 * Verifies the PIN for a returning merchant and establishes a Supabase session.
 * Uses the same phone-as-email + PIN-as-password convention as completePinSetupAction.
 *
 * On success calls redirect('/dashboard') which must NOT be inside a try/catch.
 */
export async function verifyPinLoginAction(
  input: PinLoginInput,
): Promise<PinLoginResult> {
  const { phone, pin } = input;

  if (!phone || pin.length !== 4) {
    return { error: 'invalid_input' };
  }

  const syntheticEmail = `${phone.replace('+', '')}@plaza-merchant.internal`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: pin,
  });

  if (error) return { error: 'invalid_pin' };

  // redirect() must be called OUTSIDE try/catch — it throws NEXT_REDIRECT.
  redirect('/dashboard');
}
