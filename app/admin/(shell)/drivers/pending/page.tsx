import { createServiceClient } from '@/lib/supabase/service';
import { PendingQueueClient } from './PendingQueueClient';

export const dynamic = 'force-dynamic';

type VehicleType = 'moto' | 'velo' | 'voiture' | 'autre';

export default async function DriversPendingPage() {
  const service = createServiceClient();
  const { data, error } = await service
    .from('drivers')
    .select('id, full_name, phone, city, vehicle_type, created_at')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load pending drivers: ${error.message}`);
  }

  const drivers = (data ?? []).map((d) => ({
    id: d.id,
    fullName: d.full_name,
    phone: d.phone,
    city: d.city ?? '—',
    vehicleType: (d.vehicle_type ?? 'autre') as VehicleType,
    submittedAt: d.created_at,
  }));

  return <PendingQueueClient initialDrivers={drivers} />;
}
