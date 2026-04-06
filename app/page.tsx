import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold tracking-tight">{t('welcome')}</h1>
      <p className="mt-2 text-muted-foreground">{t('tagline')}</p>
    </main>
  );
}
