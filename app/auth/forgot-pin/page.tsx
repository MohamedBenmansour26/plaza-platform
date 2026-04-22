'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Lock, Phone } from 'lucide-react';

function ForgotPINContent() {
  const t = useTranslations('auth.forgotPin');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';

  function handleSendOTP() {
    // TODO: [SMS stub — implement real recovery OTP send via SMS provider]
    const params = new URLSearchParams({ phone, mode: 'reset' });
    router.push(`/auth/otp?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
      <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        {/* TODO PLZ-033: migrate to i18n */}
        <button
          onClick={() => router.back()}
          className="w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors mt-4 ms-4 md:mt-0 md:ms-0"
          aria-label="Retour"
          data-testid="merchant-forgot-pin-back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>

        <div className="flex-1 px-4 mt-12">
          {/* Lock icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#FFFBEB] rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#D97706]" />
            </div>
          </div>

          <h1 className="text-[22px] font-semibold text-[#1C1917] text-center mt-4">{t('title')}</h1>
          <p className="text-sm text-[#78716C] text-center mt-2 max-w-[280px] mx-auto">
            {t('subtitle')}
          </p>

          {/* Phone display */}
          {phone && (
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 mt-8">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#78716C]" />
                <span className="text-sm text-[#1C1917]">{phone}</span>
              </div>
              <p className="text-xs text-[#78716C] mt-2">{t('phoneNote')}</p>
            </div>
          )}
        </div>

        <div className="px-4 pb-8">
          <button
            onClick={handleSendOTP}
            className="h-14 w-full rounded-xl text-white text-base font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-primary)' }}
            data-testid="merchant-forgot-pin-send-sms-btn"
          >
            {t('sendSms')}
          </button>
          <button
            onClick={() => router.push('/auth/recovery')}
            className="text-[13px] text-[#78716C] text-center mt-4 w-full"
            data-testid="merchant-forgot-pin-wrong-number-btn"
          >
            {t('wrongNumber')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPINPage() {
  return (
    <Suspense>
      <ForgotPINContent />
    </Suspense>
  );
}
