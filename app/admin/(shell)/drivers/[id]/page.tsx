import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import { DriverDetailClient } from './DriverDetailClient';

export const dynamic = 'force-dynamic';

type DocStatus = 'pending' | 'approved' | 'rejected' | 'resubmit';
type VehicleType = 'moto' | 'velo' | 'voiture' | 'autre';
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'resubmit';

export type DriverDetail = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  vehicleType: VehicleType;
  submittedAt: string;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  docs: {
    license: { url: string; status: DocStatus; uploadedAt: string };
    insurance: { url: string; status: DocStatus; uploadedAt: string };
    id_front: { url: string; status: DocStatus; uploadedAt: string };
    id_back: { url: string; status: DocStatus; uploadedAt: string };
  };
};

function docStatusFor(
  approvalStatus: ApprovalStatus,
  approved: boolean,
): DocStatus {
  if (approvalStatus === 'approved') return 'approved';
  if (approvalStatus === 'rejected') return 'rejected';
  if (approved) return 'approved';
  if (approvalStatus === 'resubmit') return 'resubmit';
  return 'pending';
}

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: driver, error } = await service
    .from('drivers')
    .select(
      'id, full_name, phone, city, vehicle_type, created_at, user_id, approval_status, rejection_reason, license_photo_url, insurance_url, id_front_url, id_back_url, license_approved, insurance_approved, id_front_approved, id_back_approved',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !driver) notFound();

  let email = '';
  if (driver.user_id) {
    const { data: userResp } = await service.auth.admin.getUserById(
      driver.user_id,
    );
    email = userResp?.user?.email ?? '';
  }

  async function sign(path: string | null): Promise<string> {
    if (!path) return '';
    const { data } = await service.storage
      .from('driver-documents')
      .createSignedUrl(path, 60);
    return data?.signedUrl ?? '';
  }

  const [licenseUrl, insuranceUrl, idFrontUrl, idBackUrl] = await Promise.all([
    sign(driver.license_photo_url),
    sign(driver.insurance_url),
    sign(driver.id_front_url),
    sign(driver.id_back_url),
  ]);

  const approvalStatus = driver.approval_status as ApprovalStatus;
  const uploadedAt = driver.created_at;

  const detail: DriverDetail = {
    id: driver.id,
    fullName: driver.full_name,
    phone: driver.phone,
    email,
    city: driver.city ?? '—',
    vehicleType: (driver.vehicle_type ?? 'autre') as VehicleType,
    submittedAt: driver.created_at,
    approvalStatus,
    rejectionReason: driver.rejection_reason,
    docs: {
      license: {
        url: licenseUrl,
        status: docStatusFor(approvalStatus, driver.license_approved),
        uploadedAt,
      },
      insurance: {
        url: insuranceUrl,
        status: docStatusFor(approvalStatus, driver.insurance_approved),
        uploadedAt,
      },
      id_front: {
        url: idFrontUrl,
        status: docStatusFor(approvalStatus, driver.id_front_approved),
        uploadedAt,
      },
      id_back: {
        url: idBackUrl,
        status: docStatusFor(approvalStatus, driver.id_back_approved),
        uploadedAt,
      },
    },
  };

  return <DriverDetailClient driver={detail} />;
}
