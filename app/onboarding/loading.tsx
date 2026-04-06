import { getTranslations } from 'next-intl/server';

export default async function OnboardingLoading() {
  const t = await getTranslations('common');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">{t('loading')}</p>
    </main>
  );
}
