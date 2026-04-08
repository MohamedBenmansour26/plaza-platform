'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

type LoginResult = { error: string | null };

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'validation' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Check whether a phone number is already registered as a merchant.
 * Returns the merchant's store name so the PIN login screen can greet them.
 */
export async function checkPhoneAction(
  phone: string,
): Promise<{ exists: boolean; merchantName: string | null }> {
  const service = createServiceClient();

  const { data } = await service
    .from('merchants')
    .select('store_name')
    .eq('phone', phone)
    .maybeSingle();

  return {
    exists: data !== null,
    merchantName: data?.store_name ?? null,
  };
}
