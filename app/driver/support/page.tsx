import { createClient } from '@/lib/supabase/server';
import { getDriverProfile } from '@/lib/db/driver';
import { redirect } from 'next/navigation';
import { SupportClient } from './_components/SupportClient';

/**
 * Driver support page — PLZ-B2.
 *
 * Previously the "Aide & Support" row on /driver/profil pointed to href="#"
 * (dead CTA). Now points here.
 *
 * Why not reuse /dashboard/support:
 *   The merchant ticketing hub is tightly coupled to `support_tickets.merchant_id`
 *   + merchant session / RLS. Extending it to drivers requires a schema change
 *   (driver_id column + policy fan-out) that belongs in a dedicated ticket.
 *   For now this page ships the same visual pattern (contact cards + FAQ
 *   placeholder) and routes drivers to the direct support channels —
 *   WhatsApp + phone — that PM already publishes for launch.
 *
 * Follow-up ticket: "driver-side support_tickets (feat: driver inbox)".
 */
export default async function DriverSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/driver/auth/phone');

  const driver = await getDriverProfile(user.id);
  if (!driver) redirect('/driver/auth/phone');
  // Allow support access even if onboarding is pending — a driver who's
  // stuck on validation is exactly the user who needs to reach support.

  return <SupportClient driverName={driver.full_name} driverPhone={driver.phone} />;
}
