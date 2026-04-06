'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function SignupError({
  reset,
}: {
  reset: () => void;
}) {
  const t = useTranslations('common');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">{t('error')}</p>
        <Button variant="outline" onClick={reset}>
          {t('retry')}
        </Button>
      </div>
    </main>
  );
}
