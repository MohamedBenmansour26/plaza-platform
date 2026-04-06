'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { checkSlugAction, submitOnboardingAction } from './actions';
import { StepStoreDetails } from './StepStoreDetails';
import { StepFirstProduct } from './StepFirstProduct';

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

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
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

  async function handleImageFile(file: File) {
    setImageUploading(true);
    const url = await uploadFile(file, 'product-images');
    setImageUrl(url);
    setImageUploading(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const priceInCentimes = Math.round(parseFloat(price) * 100);
    const result = await submitOnboardingAction({
      merchantId,
      storeName,
      storeSlug,
      description,
      logoUrl,
      nameFr,
      nameAr,
      price: priceInCentimes,
      stock: parseInt(stock, 10) || 0,
      imageUrl,
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {step === 1 ? '1 / 2' : '2 / 2'}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {step === 1 ? t('step1Title') : t('step2Title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? t('step1Subtitle') : t('step2Subtitle')}
          </p>
        </div>

        {step === 1 ? (
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
            onNext={() => setStep(2)}
          />
        ) : (
          <StepFirstProduct
            nameFr={nameFr}
            nameAr={nameAr}
            price={price}
            stock={stock}
            imageUrl={imageUrl}
            imageUploading={imageUploading}
            submitting={submitting}
            error={error}
            onNameFr={setNameFr}
            onNameAr={setNameAr}
            onPrice={setPrice}
            onStock={setStock}
            onImageFile={handleImageFile}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </main>
  );
}
