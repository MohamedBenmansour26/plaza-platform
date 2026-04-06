'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

type Props = {
  storeName: string;
  storeSlug: string;
  description: string;
  logoUploading: boolean;
  slugStatus: SlugStatus;
  onStoreName: (v: string) => void;
  onStoreSlug: (v: string) => void;
  onDescription: (v: string) => void;
  onLogoFile: (f: File) => void;
  onNext: () => void;
};

export function StepStoreDetails({
  storeName,
  storeSlug,
  description,
  logoUploading,
  slugStatus,
  onStoreName,
  onStoreSlug,
  onDescription,
  onLogoFile,
  onNext,
}: Props) {
  const t = useTranslations('onboarding');

  const slugIndicator =
    slugStatus === 'available'
      ? <span className="text-xs text-green-600">{t('storeSlugAvailable')}</span>
      : slugStatus === 'taken'
      ? <span className="text-xs text-destructive">{t('storeSlugTaken')}</span>
      : slugStatus === 'checking'
      ? <span className="text-xs text-muted-foreground">…</span>
      : null;

  const canContinue =
    storeName.trim().length > 0 &&
    storeSlug.trim().length > 0 &&
    slugStatus === 'available' &&
    !logoUploading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canContinue) onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="storeName">{t('storeName')} *</Label>
        <Input
          id="storeName"
          value={storeName}
          onChange={(e) => onStoreName(e.target.value)}
          placeholder={t('storeNamePlaceholder')}
          required
          autoFocus
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="storeSlug">{t('storeSlug')} *</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-xs text-muted-foreground">
            {t('storeSlugHint')}
          </span>
          <Input
            id="storeSlug"
            value={storeSlug}
            onChange={(e) => onStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder={t('storeSlugPlaceholder')}
            className="ps-[7.5rem]"
            required
          />
        </div>
        <div className="min-h-[1.25rem]">{slugIndicator}</div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="logo">{t('logo')}</Label>
        <Input
          id="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogoFile(f); }}
          disabled={logoUploading}
          className="cursor-pointer file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-foreground"
        />
        {logoUploading && (
          <p className="text-xs text-muted-foreground">{t('uploading')}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!canContinue}>
        {t('next')}
      </Button>
    </form>
  );
}
