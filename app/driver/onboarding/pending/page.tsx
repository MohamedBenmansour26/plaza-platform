import { AlertTriangle, CheckCircle2, Circle, Clock } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Driver "your file is being reviewed" screen.
 *
 * - `approval_status = 'pending'` → default waiting-room copy.
 * - `approval_status = 'resubmit'` → show rejection reason + CTA back to
 *   /driver/onboarding/identity so the driver can re-upload.
 *
 * TODO (Youssef swap): when the backend adds an `approval_status` column
 * + `rejection_reason` column to the `drivers` table (PLZ-061 backend),
 * the `approvalStatus` + `rejectionReason` below will come from that row
 * automatically. Until then, we fall back to the legacy
 * `onboarding_status` field.
 */
export default async function PendingPage() {
  const t = await getTranslations('driver.onboarding.pending');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let approvalStatus: 'pending' | 'resubmit' | 'rejected' | 'approved' = 'pending';
  let rejectionReason: string | null = null;
  if (user) {
    const { data: driver } = await supabase
      .from('drivers')
      // `approval_status` and `rejection_reason` land with Youssef's PR;
      // select defensively so this compiles today.
      .select('onboarding_status')
      .eq('user_id', user.id)
      .maybeSingle<{ onboarding_status: string | null }>();
    if (driver) {
      // Best-effort mapping while `approval_status` isn't live.
      const row = driver as unknown as {
        approval_status?: string | null;
        rejection_reason?: string | null;
      };
      if (row.approval_status === 'resubmit') {
        approvalStatus = 'resubmit';
        rejectionReason = row.rejection_reason ?? null;
      } else if (row.approval_status === 'rejected') {
        approvalStatus = 'rejected';
        rejectionReason = row.rejection_reason ?? null;
      } else if (row.approval_status === 'approved') {
        approvalStatus = 'approved';
      } else {
        approvalStatus = 'pending';
      }
    }
  }

  if (approvalStatus === 'resubmit') {
    return (
      <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-6 py-10">
        <div className="relative">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-[#FEF3C7]">
            <AlertTriangle className="w-10 h-10 text-[#D97706]" />
          </div>
        </div>
        <h1 className="text-[22px] font-bold text-[#1C1917] mt-5 text-center">
          {t('resubmit.title')}
        </h1>
        <p className="text-[14px] text-[#78716C] mt-2 text-center max-w-[420px]">
          {t('resubmit.body')}
        </p>
        {rejectionReason ? (
          <div className="mt-5 w-full max-w-[420px] rounded-[12px] border border-[#FEF3C7] bg-[#FEF3C7]/30 p-4">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#92400E]">
              {t('resubmit.reasonLabel')}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#78716C]">
              {rejectionReason}
            </p>
          </div>
        ) : null}
        <Link
          href="/driver/onboarding/identity"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-[12px] bg-[#2563EB] px-6 text-[14px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          {t('resubmit.cta')}
        </Link>
        <Link
          href="#"
          className="mt-4 text-[13px] underline"
          style={{ color: 'var(--color-primary)' }}
        >
          {t('contactSupport')}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-8">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
          }}
        >
          <Clock
            className="w-12 h-12"
            style={{ color: 'var(--color-primary)' }}
          />
        </div>
      </div>
      <h1 className="text-[24px] font-bold text-[#1C1917] mt-6">
        {t('pending.title')}
      </h1>
      <p className="text-[15px] text-[#78716C] mt-2 text-center">
        {t('pending.body')}
      </p>
      <div className="w-full max-w-[420px] mt-8 bg-white rounded-2xl shadow-sm p-5 space-y-3">
        {[
          { icon: CheckCircle2, color: 'text-green-600', label: t('step.phoneVerified'), badge: t('badge.validated'), badgeColor: 'text-green-600 bg-green-50' },
          { icon: CheckCircle2, color: 'text-green-600', label: t('step.documentsSubmitted'), badge: t('badge.received'), badgeColor: 'text-green-600 bg-green-50' },
          { icon: Clock, color: '', label: t('step.verifying'), badge: t('badge.inProgress'), badgeColor: '' },
          { icon: Circle, color: 'text-[#A8A29E]', label: t('step.activation'), badge: null, badgeColor: '' },
        ].map(({ icon: Icon, color, label, badge, badgeColor }, i) => (
          <div key={i} className="flex items-center gap-3">
            <Icon
              className={`w-5 h-5 ${color}`}
              style={i === 2 ? { color: 'var(--color-primary)' } : {}}
            />
            <span
              className={`flex-1 text-sm ${i === 3 ? 'text-[#A8A29E]' : 'text-[#1C1917]'}`}
            >
              {label}
            </span>
            {badge && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}
                style={
                  i === 2
                    ? {
                        color: 'var(--color-primary)',
                        background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
                      }
                    : {}
                }
              >
                {badge}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-[13px] text-[#78716C] mt-8 text-center">
        {t('pending.smsHint')}
      </p>
      <Link
        href="#"
        className="text-[14px] mt-4 underline"
        style={{ color: 'var(--color-primary)' }}
      >
        {t('contactSupport')}
      </Link>
    </main>
  );
}
