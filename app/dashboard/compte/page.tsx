import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CompteClient } from './CompteClient';

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const meta = user.user_metadata as Record<string, string> | null;
  const fullName = meta?.full_name ?? '';
  const phone = meta?.phone ?? '';

  const initials = fullName
    ? fullName.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
    : (user.email ?? '').slice(0, 2).toUpperCase();

  return (
    <CompteClient
      fullName={fullName}
      email={user.email ?? ''}
      phone={phone}
      initials={initials}
    />
  );
}
