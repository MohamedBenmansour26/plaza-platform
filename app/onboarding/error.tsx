'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type Props = { error: Error; reset: () => void };

export default function OnboardingError({ reset }: Props) {
  const t = useTranslations('common');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="text-sm text-destructive">{t('error')}</p>
      <Button variant="outline" onClick={reset}>
        {t('retry')}
      </Button>
    </main>
  );
}
