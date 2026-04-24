import { createClient } from '@/lib/supabase/server';
import { getDriverProfile } from '@/lib/db/driver';
import { redirect } from 'next/navigation';
import { SettingsClient } from './_components/SettingsClient';

/**
 * Driver settings page — PLZ-B2.
 *
 * Previously the "Paramètres" row on /driver/profil was wired to href="#"
 * (dead CTA). Now points here. Exposes:
 *   - Edit profile (name + city, phone read-only)
 *   - Shortcut to /driver/profil/horaires
 *   - Change PIN flow (UI shipped; server action stubbed — see actions.ts)
 *   - Logout (reuses shared <LogoutButton/>)
 */
export default async function ParametresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/driver/auth/phone');

  const driver = await getDriverProfile(user.id);
  if (!driver) redirect('/driver/auth/phone');
  if (driver.onboarding_status !== 'active') redirect('/driver/onboarding/pending');

  return (
    <SettingsClient
      initialDriver={{
        full_name: driver.full_name,
        phone: driver.phone,
        city: driver.city,
      }}
    />
  );
}
