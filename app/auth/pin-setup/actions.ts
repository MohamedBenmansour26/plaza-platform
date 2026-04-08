'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

type PinSetupInput = { phone: string; pin: string };
type PinSetupResult = { error: string } | undefined;

/**
 * Registers a new merchant auth user (using phone-as-email + PIN-as-password
 * convention for the stub phase), saves the merchant phone, and establishes a
 * Supabase session so the middleware allows access to /dashboard.
 *
 * Called after the user confirms their PIN on the pin-setup screen.
 * On success this function calls redirect('/dashboard') — which throws
 * NEXT_REDIRECT internally so it must NOT be wrapped in try/catch.
 */
export async function completePinSetupAction(
  input: PinSetupInput,
): Promise<PinSetupResult> {
  const { phone, pin } = input;

  if (!phone || pin.length !== 4) {
    return { error: 'invalid_input' };
  }

  // Derive a deterministic synthetic email from the phone number.
  // This lets us use Supabase email+password auth as the session layer
  // while the product-facing UX is phone+PIN.
  const syntheticEmail = `${phone.replace('+', '')}@plaza-merchant.internal`;

  const service = createServiceClient();

  // Try to create the auth user. If it already exists (re-registration after
  // a failed flow) we sign in instead.
  const { data: signUpData, error: signUpError } = await service.auth.admin.createUser({
    email: syntheticEmail,
    password: pin,
    email_confirm: true, // auto-confirm so session is available immediately
  });

  let userId: string | null = null;

  if (signUpError) {
    if (signUpError.message.includes('already been registered')) {
      // User exists — update their password to the new PIN and fetch their id.
      const { data: listData } = await service.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === syntheticEmail);
      if (!existing) return { error: 'user_not_found' };

      await service.auth.admin.updateUserById(existing.id, { password: pin });
      userId = existing.id;
    } else {
      return { error: signUpError.message };
    }
  } else {
    userId = signUpData.user?.id ?? null;
  }

  if (!userId) return { error: 'no_user_id' };

  // Upsert the merchant phone so the returning-user check works on next login.
  await service
    .from('merchants')
    .update({ phone })
    .eq('user_id', userId);

  // Sign in with the regular (non-admin) client to get a session cookie.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: pin,
  });

  if (signInError) return { error: signInError.message };

  // redirect() must be called OUTSIDE try/catch — it throws NEXT_REDIRECT.
  redirect('/dashboard');
}
