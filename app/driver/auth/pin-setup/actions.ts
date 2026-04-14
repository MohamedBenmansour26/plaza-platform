'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

type PinSetupInput = { phone: string; pin: string; fullName?: string };
type PinSetupResult = { error: string } | undefined;

/**
 * Register a new driver:
 * 1. Create Supabase auth user (phone@plaza-driver.internal + PIN)
 * 2. Upsert drivers record with user_id + phone
 * 3. Sign in to establish session
 * 4. Redirect to /driver/onboarding/vehicle
 */
export async function completeDriverPinSetupAction(
  input: PinSetupInput,
): Promise<PinSetupResult> {
  const { phone, pin, fullName = 'Livreur' } = input;
  if (!phone || pin.length !== 4) return { error: 'invalid_input' };

  const syntheticEmail = `${phone.replace('+', '')}@plaza-driver.internal`;
  const service = createServiceClient();

  const { data: signUpData, error: signUpError } = await service.auth.admin.createUser({
    email: syntheticEmail,
    password: pin,
    email_confirm: true,
  });

  let userId: string | null = null;

  if (signUpError) {
    if (signUpError.message.includes('already been registered')) {
      const { data: listData } = await service.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === syntheticEmail);
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

  // Upsert driver record — use service client (bypasses RLS)
  const { error: upsertError } = await service
    .from('drivers')
    .upsert(
      { full_name: fullName, phone, user_id: userId, is_available: false, onboarding_status: 'pending_onboarding' },
      { onConflict: 'phone' },
    );
  if (upsertError) return { error: upsertError.message };

  // Establish session with anon client
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: pin,
  });
  if (signInError) return { error: signInError.message };

  // redirect() throws NEXT_REDIRECT — must be outside try/catch
  redirect('/driver/onboarding/vehicle');
}
