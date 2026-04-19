import { PendingQueueClient } from './PendingQueueClient';

export const dynamic = 'force-dynamic';

// TODO (Youssef swap): swap the mock data below for a real server fetch
// once `drivers.approval_status` + the list server action ship. Suggested
// API:
//   import { listPendingDrivers } from '@/app/admin/drivers/[id]/actions';
//   const drivers = await listPendingDrivers();
// then pass `drivers` to <PendingQueueClient initialDrivers={drivers} />.
const MOCK_PENDING = [
  {
    id: 'd-001',
    fullName: 'Hassan Benjelloun',
    phone: '+212 6 12 34 56 78',
    city: 'Casablanca',
    vehicleType: 'moto' as const,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd-002',
    fullName: 'Fatima Zahra El Amrani',
    phone: '+212 6 98 76 54 32',
    city: 'Rabat',
    vehicleType: 'moto' as const,
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd-003',
    fullName: 'Youssef Mansouri',
    phone: '+212 6 45 67 89 12',
    city: 'Casablanca',
    vehicleType: 'voiture' as const,
    submittedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd-004',
    fullName: 'Karim Idrissi',
    phone: '+212 6 11 22 33 44',
    city: 'Marrakech',
    vehicleType: 'velo' as const,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd-005',
    fullName: 'Amina Berrada',
    phone: '+212 6 77 88 99 00',
    city: 'Fès',
    vehicleType: 'moto' as const,
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd-006',
    fullName: 'Omar Tazi',
    phone: '+212 6 33 44 55 66',
    city: 'Tanger',
    vehicleType: 'autre' as const,
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function DriversPendingPage() {
  return <PendingQueueClient initialDrivers={MOCK_PENDING} />;
}
