'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { checkSlugAction, submitOnboardingAction } from './actions';
import { StepStoreDetails } from './StepStoreDetails';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

type Props = { merchantId: string | null };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

async function uploadFile(file: File, bucket: string): Promise<string | null> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('bucket', bucket);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) return null;
  const json = (await res.json()) as { url?: string };
  return json.url ?? null;
}

export function OnboardingForm({ merchantId }: Props) {
  const t = useTranslations('onboarding');
  const router = useRouter();

  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from store name
  useEffect(() => {
    setStoreSlug(slugify(storeName));
  }, [storeName]);

  // Debounced slug uniqueness check
  useEffect(() => {
    if (!storeSlug || storeSlug.length < 2) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    if (slugTimer.current) clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      const { available } = await checkSlugAction(storeSlug, merchantId);
      setSlugStatus(available ? 'available' : 'taken');
    }, 500);
    return () => { if (slugTimer.current) clearTimeout(slugTimer.current); };
  }, [storeSlug, merchantId]);

  async function handleLogoFile(file: File) {
    setLogoUploading(true);
    const url = await uploadFile(file, 'merchant-logos');
    setLogoUrl(url);
    setLogoUploading(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitOnboardingAction({
      merchantId,
      storeName,
      storeSlug,
      description,
      logoUrl,
    });
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('step1Title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('step1Subtitle')}
          </p>
        </div>

        <StepStoreDetails
          storeName={storeName}
          storeSlug={storeSlug}
          description={description}
          logoUploading={logoUploading}
          slugStatus={slugStatus}
          onStoreName={setStoreName}
          onStoreSlug={setStoreSlug}
          onDescription={setDescription}
          onLogoFile={handleLogoFile}
          onNext={handleSubmit}
          submitting={submitting}
          error={error}
        />
      </div>
    </main>
  );
}
