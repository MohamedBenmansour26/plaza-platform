'use client';

import { useTranslations } from 'next-intl';

export default function DashboardError({
  reset,
}: {
  reset: () => void;
}) {
  const t = useTranslations('common');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">{t('error')}</p>
        <button
          onClick={reset}
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
        >
          {t('retry')}
        </button>
      </div>
    </main>
  );
}
