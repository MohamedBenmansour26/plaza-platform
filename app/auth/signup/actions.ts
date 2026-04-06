'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

type SignupResult = { error: string | null };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const storeName = formData.get('storeName') as string;

  if (!email || !password || !storeName) {
    return { error: 'validation' };
  }

  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) {
    return { error: authError.message };
  }

  if (!data.user) {
    return { error: 'no_user' };
  }

  // Insert merchant row using the service role client to bypass RLS.
  try {
    const service = createServiceClient();
    const storeSlug = slugify(storeName) || `merchant-${data.user.id.slice(0, 8)}`;

    const { error: merchantError } = await service.from('merchants').insert({
      user_id: data.user.id,
      store_name: storeName,
      store_slug: storeSlug,
    });

    if (merchantError) {
      // Log server-side — don't block sign-up if schema isn't deployed yet.
      console.error('[signup] merchant insert failed:', merchantError.message);
    }
  } catch (err) {
    // Service key not configured or table doesn't exist yet — non-blocking.
    console.error('[signup] service client error:', err);
  }

  return { error: null };
}
