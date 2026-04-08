'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MailOpen, CheckCircle2 } from 'lucide-react';

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PhoneRecoveryPage() {
  const t = useTranslations('auth.recovery');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSubmit() {
    if (!validateEmail(email)) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }
    // TODO: [Recovery stub — implement real recovery email lookup]
    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
        <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
          {/* TODO PLZ-033: migrate to i18n */}
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors mt-4 ms-4 md:mt-0 md:ms-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
          </button>

          <div className="flex-1 px-4 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>

            <h1 className="text-[22px] font-semibold text-[#1C1917] text-center mt-4">
              {t('successTitle')}
            </h1>
            <p className="text-sm text-[#78716C] text-center mt-2 max-w-[280px]">
              {t('successSubtitle')}
            </p>

            <p className="text-xs text-[#A8A29E] text-center mt-4">{t('successExpiry')}</p>

            <button
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              className="text-[13px] text-[#2563EB] mt-6"
            >
              {t('resend')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
      <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        {/* TODO PLZ-033: migrate to i18n */}
        <button
          onClick={() => router.back()}
          className="w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors mt-4 ms-4 md:mt-0 md:ms-0"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>

        <div className="flex-1 px-4 mt-12">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center">
              <MailOpen className="w-8 h-8 text-[#2563EB]" />
            </div>
          </div>

          <h1 className="text-[22px] font-semibold text-[#1C1917] text-center mt-4">{t('title')}</h1>
          <p className="text-sm text-[#78716C] text-center mt-2 max-w-[280px] mx-auto">
            {t('subtitle')}
          </p>

          <div className="mt-8">
            <label className="block text-[13px] font-medium text-[#78716C] mb-2">
              {t('emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(false);
              }}
              placeholder={t('emailPlaceholder')}
              className={`h-12 w-full border rounded-xl px-4 text-sm text-[#1C1917] outline-none transition-colors ${
                error ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#2563EB]'
              }`}
            />
            {error && (
              <div className="text-[13px] text-[#DC2626] mt-2">{t('emailError')}</div>
            )}
          </div>
        </div>

        <div className="px-4 pb-8">
          <button
            onClick={handleSubmit}
            disabled={!email}
            className={`h-14 w-full rounded-xl text-base font-semibold transition-colors ${
              email
                ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                : 'bg-[#E2E8F0] text-[#A8A29E] cursor-not-allowed'
            }`}
          >
            {t('submit')}
          </button>
          <div className="text-xs text-[#78716C] text-center mt-4">
            {t('noEmailNote')}{' '}
            <button className="text-[#E8632A]">{t('contactSupport')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
