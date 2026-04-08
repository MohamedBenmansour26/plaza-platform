'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * publishStoreAction — sets merchants.is_online = true for the given merchantId.
 * Called from OnboardingChecklist when all required steps are complete.
 */
export async function publishStoreAction(merchantId: string): Promise<void> {
  const supabase = await createClient();

  // Verify caller owns this merchant record
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: merchant, error: fetchErr } = await supabase
    .from('merchants')
    .select('id, user_id')
    .eq('id', merchantId)
    .eq('user_id', user.id)
    .maybeSingle<{ id: string; user_id: string }>();

  if (fetchErr) throw new Error(`publishStoreAction (fetch): ${fetchErr.message}`);
  if (!merchant) throw new Error('Merchant not found or access denied.');

  const { error: updateErr } = await supabase
    .from('merchants')
    .update({ is_online: true } as never)
    .eq('id', merchantId)
    .eq('user_id', user.id);

  if (updateErr) throw new Error(`publishStoreAction (update): ${updateErr.message}`);

  revalidatePath('/dashboard');
}
