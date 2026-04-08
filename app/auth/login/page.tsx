'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { checkPhoneAction } from './actions';

function formatPhoneDisplay(value: string): string {
  if (!value) return '';
  const groups = value.match(/.{1,2}/g) ?? [];
  return groups.join(' ');
}

function validatePhone(value: string): boolean {
  const cleaned = value.replace(/\s/g, '');
  return cleaned.length === 9 && cleaned.startsWith('6');
}

export default function PhoneEntryPage() {
  const t = useTranslations('auth.welcome');
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhone(value);
      setError(false);
    }
  }

  async function handleSubmit() {
    if (!validatePhone(phone)) {
      setError(true);
      return;
    }
    setLoading(true);
    // Strip leading 0, prepend country code: e.g. 0612345678 → +212612345678
    // phone already starts with 6 (9 digits), so full number is +212 + phone
    const fullPhone = `+212${phone}`;
    // TODO: [SMS stub — implement real OTP send via SMS provider]

    // Check if phone is already registered → returning user goes to PIN login,
    // new user goes through OTP → PIN setup flow.
    try {
      const { exists, merchantName } = await checkPhoneAction(fullPhone);
      const params = new URLSearchParams({ phone: fullPhone });
      if (exists) {
        if (merchantName) params.set('name', merchantName);
        router.push(`/auth/pin-login?${params.toString()}`);
      } else {
        router.push(`/auth/otp?${params.toString()}`);
      }
    } catch {
      setLoading(false);
      setError(true);
    }
  }

  const isValid = validatePhone(phone);

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8">
        {/* Logo area */}
        <div className="flex flex-col items-center justify-center pb-8">
          <div className="text-[28px] font-bold text-[#2563EB]">{t('logo')}</div>
          <div className="text-sm text-[#78716C] text-center mt-2">{t('tagline')}</div>
        </div>

        {/* Phone input */}
        <div className="mt-2">
          <label className="block text-[13px] font-medium text-[#78716C] mb-2">
            {t('phoneLabel')}
          </label>
          <div
            className={`flex items-center h-14 rounded-xl bg-white ${
              error ? 'border-2 border-[#DC2626]' : 'border border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center justify-center gap-1 w-20 h-full border-e border-[#E2E8F0] px-2">
              <span className="text-lg">🇲🇦</span>
              <span className="text-sm font-medium text-[#1C1917]">+212</span>
            </div>
            <input
              type="tel"
              value={formatPhoneDisplay(phone)}
              onChange={handlePhoneChange}
              placeholder={t('phonePlaceholder')}
              className="flex-1 h-full px-4 text-base bg-transparent outline-none text-[#1C1917]"
              inputMode="numeric"
              autoComplete="tel"
            />
          </div>
          <div className={`text-xs mt-2 ${error ? 'text-[#DC2626]' : 'text-[#78716C]'}`}>
            {error ? t('phoneError') : t('phoneHint')}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`h-14 w-full rounded-xl text-base font-semibold transition-colors ${
              isValid && !loading
                ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                : 'bg-[#E2E8F0] text-[#A8A29E] cursor-not-allowed'
            }`}
          >
            {t('continue')}
          </button>
          <div className="text-[11px] text-[#A8A29E] text-center mt-4 leading-relaxed">
            {t('terms')}
          </div>
        </div>
      </div>
    </main>
  );
}
