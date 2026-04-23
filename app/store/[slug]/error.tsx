'use client';

import { useTranslations } from 'next-intl';

export default function StorefrontError({
  reset,
}: {
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-[#FAFAF9]">
      <p className="text-sm text-[#DC2626]">{t('error')}</p>
      <button
        onClick={reset}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 hover:border-[var(--color-primary)] active:scale-[0.97]"
      >
        {t('retry')}
      </button>
    </main>
  );
}
