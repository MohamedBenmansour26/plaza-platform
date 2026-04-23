'use server';

/**
 * Driver settings server actions — PLZ-B2.
 *
 * Exposes:
 *   • updateDriverProfileAction   — writes full_name + city back to drivers row
 *   • changeDriverPinAction       — TODO stub (handed off to Hamza). Shipped
 *                                    now so the UI has a real target; the
 *                                    real server-side PIN verify+rotate is
 *                                    tracked as a follow-up ticket because
 *                                    it requires hashing parity with the
 *                                    pin-setup flow (see auth/pin-setup/actions.ts).
 *
 * Intentionally narrow writes — phone is read-only from the UI (phone is the
 * auth key; rotating it is a separate flow).
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateDriverProfileAction(input: {
  full_name: string;
  city: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const full_name = input.full_name.trim();
  if (full_name.length < 2) return { error: 'name_too_short' };

  const city = input.city?.trim() || null;

  const { error } = await supabase
    .from('drivers')
    .update({ full_name, city } as never)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/driver/profil');
  revalidatePath('/driver/parametres');
  return { ok: true };
}

/**
 * PIN rotation — TODO (Hamza).
 *
 * Why stubbed: the driver PIN is stored as a bcrypt hash inside a custom
 * drivers.pin_hash column (see lib/db/driver-auth.ts / pin-setup/actions.ts).
 * Rotating it correctly requires verifying the current PIN under the same
 * scheme and re-hashing the new one — non-trivial and owned by Hamza's
 * auth track. Shipping the UI now so QA can wire the screen and we don't
 * leave a dead button.
 */
export async function changeDriverPinAction(_input: {
  current_pin: string;
  new_pin: string;
}): Promise<{ error: string }> {
  return { error: 'not_implemented' };
}
