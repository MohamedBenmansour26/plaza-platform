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

  // If session is null, email confirmation is required — the user cannot log in yet.
  // This should not happen in normal operation (auto-confirm must be enabled in Supabase Auth
  // settings for local dev). Surface a clear error rather than silently redirecting.
  if (!data.session) {
    return { error: 'email_confirmation_required' };
  }

  // Insert merchant row using the service role client to bypass RLS.
  // SAAD-002: if the insert fails we roll back by deleting the auth account
  // so the system never ends up with an orphaned auth user and no merchant row.
  const service = createServiceClient();
  const storeSlug = slugify(storeName) || `merchant-${data.user.id.slice(0, 8)}`;

  const { error: merchantError } = await service.from('merchants').insert({
    user_id: data.user.id,
    store_name: storeName,
    store_slug: storeSlug,
  });

  if (merchantError) {
    console.error('[signup] merchant insert failed — rolling back auth account:', merchantError.message);

    // Delete the just-created auth user so we don't leave an orphaned account.
    const { error: deleteError } = await service.auth.admin.deleteUser(data.user.id);
    if (deleteError) {
      console.error('[signup] failed to delete orphaned auth user:', deleteError.message);
    }

    return { error: 'merchant_insert_failed' };
  }

  return { error: null };
}
