import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ParametresClient } from './ParametresClient';

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return <ParametresClient />;
}
