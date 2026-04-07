'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updateAccount(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const fullName = (formData.get('full_name') as string).trim();
  const phone = (formData.get('phone') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string).trim();

  // Update user metadata (name + phone) and email if changed
  const updatePayload: { email?: string; data?: Record<string, string> } = {
    data: { full_name: fullName, phone },
  };
  if (email !== user.email) {
    updatePayload.email = email;
  }

  const { error } = await supabase.auth.updateUser(updatePayload);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/compte');
  return {};
}

export async function updatePassword(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return {};
}
