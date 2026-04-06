'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signupAction } from './actions';

export default function SignupPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signupAction(formData);

    if (result.error) {
      setError(result.error === 'validation' ? t('validationError') : t('signUpError'));
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t('signUpTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('signUpSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="storeName">{t('storeName')}</Label>
            <Input
              id="storeName"
              name="storeName"
              type="text"
              placeholder={t('storeNamePlaceholder')}
              required
              autoComplete="organization"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? tc('loading') : t('signUp')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </main>
  );
}
