import { notFound } from 'next/navigation';
import { DriverDetailClient } from './DriverDetailClient';

export const dynamic = 'force-dynamic';

// TODO (Youssef swap): replace the mock fetch with a real Supabase query
// against `drivers` joined to doc statuses. Suggested signature:
//   export async function getDriverWithDocs(id: string): Promise<
//     DriverDetail | null
//   >
// and call it here instead of the mock map.
type DocStatus = 'pending' | 'approved' | 'rejected' | 'resubmit';

export type DriverDetail = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  vehicleType: 'moto' | 'velo' | 'voiture' | 'autre';
  submittedAt: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'resubmit';
  rejectionReason: string | null;
  docs: {
    license: { url: string; status: DocStatus; uploadedAt: string };
    insurance: { url: string; status: DocStatus; uploadedAt: string };
    id_front: { url: string; status: DocStatus; uploadedAt: string };
    id_back: { url: string; status: DocStatus; uploadedAt: string };
  };
};

// Placeholder image so the viewer has something to render in dev.
const PLACEHOLDER_IMG =
  'https://placehold.co/800x520/1C1917/FFFFFF?text=Document';

const MOCK_DRIVERS: Record<string, DriverDetail> = {
  'd-001': {
    id: 'd-001',
    fullName: 'Hassan Benjelloun',
    phone: '+212 6 12 34 56 78',
    email: 'hassan.benj@gmail.com',
    city: 'Casablanca',
    vehicleType: 'moto',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    approvalStatus: 'pending',
    rejectionReason: null,
    docs: {
      license: { url: PLACEHOLDER_IMG, status: 'pending', uploadedAt: new Date().toISOString() },
      insurance: { url: PLACEHOLDER_IMG, status: 'pending', uploadedAt: new Date().toISOString() },
      id_front: { url: PLACEHOLDER_IMG, status: 'pending', uploadedAt: new Date().toISOString() },
      id_back: { url: PLACEHOLDER_IMG, status: 'pending', uploadedAt: new Date().toISOString() },
    },
  },
  'd-002': {
    id: 'd-002',
    fullName: 'Fatima Zahra El Amrani',
    phone: '+212 6 98 76 54 32',
    email: 'fatima.elamrani@gmail.com',
    city: 'Rabat',
    vehicleType: 'moto',
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    approvalStatus: 'pending',
    rejectionReason: null,
    docs: {
      license: { url: PLACEHOLDER_IMG, status: 'pending', uploadedAt: new Date().toISOString() },
      insurance: { url: PLACEHOLDER_IMG, status: 'resubmit', uploadedAt: new Date().toISOString() },
      id_front: { url: PLACEHOLDER_IMG, status: 'approved', uploadedAt: new Date().toISOString() },
      id_back: { url: PLACEHOLDER_IMG, status: 'pending', uploadedAt: new Date().toISOString() },
    },
  },
};

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = MOCK_DRIVERS[id] ?? MOCK_DRIVERS['d-001'];
  if (!driver) notFound();
  return <DriverDetailClient driver={{ ...driver, id }} />;
}
