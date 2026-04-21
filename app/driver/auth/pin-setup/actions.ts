'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { driverSyntheticEmail } from '@/lib/driver-auth';

type PinSetupInput = { phone: string; pin: string; fullName?: string };
export type PinSetupResult = { error: string } | { redirect: string };

/**
 * Register a new driver:
 * 1. Create Supabase auth user (synthetic email + PIN)
 * 2. Upsert drivers record with user_id + phone
 * 3. Sign in to establish session — returns { redirect } so the client uses
 *    router.push() and Set-Cookie headers reach the browser before navigation.
 * 4. Return redirect to /driver/onboarding/vehicle
 */
export async function completeDriverPinSetupAction(
  input: PinSetupInput,
): Promise<PinSetupResult> {
  const { phone, pin, fullName = 'Livreur' } = input;
  if (!phone || pin.length !== 4) return { error: 'invalid_input' };

  const syntheticEmail = driverSyntheticEmail(phone);
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

  // Seed default schedule for all 7 days (0=Monday … 6=Sunday).
  // ignoreDuplicates so re-setup doesn't wipe an existing schedule.
  const { data: driverRow } = await service
    .from('drivers')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();
  if (driverRow) {
    const defaultSchedule = Array.from({ length: 7 }, (_, i) => ({
      driver_id: driverRow.id,
      day_of_week: i,
      is_active: false,
      start_time: '08:00:00',
      end_time: '18:00:00',
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (service as any)
      .from('driver_schedules')
      .upsert(defaultSchedule, { onConflict: 'driver_id,day_of_week', ignoreDuplicates: true });
  }

  // Establish session with anon client
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: pin,
  });
  if (signInError) return { error: signInError.message };

  return { redirect: '/driver/onboarding/vehicle' };
}
