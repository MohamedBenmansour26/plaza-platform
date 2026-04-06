import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Service-role Supabase client — server-side only.
 * Bypasses RLS for privileged operations (e.g. creating a merchant row on signup).
 * NEVER expose this client or SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.',
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
