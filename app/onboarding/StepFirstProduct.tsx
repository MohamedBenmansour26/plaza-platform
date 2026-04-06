'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  nameFr: string;
  nameAr: string;
  price: string;
  stock: string;
  imageUrl: string | null;
  imageUploading: boolean;
  submitting: boolean;
  error: string | null;
  onNameFr: (v: string) => void;
  onNameAr: (v: string) => void;
  onPrice: (v: string) => void;
  onStock: (v: string) => void;
  onImageFile: (f: File) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function StepFirstProduct({
  nameFr,
  nameAr,
  price,
  stock,
  imageUrl,
  imageUploading,
  submitting,
  error,
  onNameFr,
  onNameAr,
  onPrice,
  onStock,
  onImageFile,
  onBack,
  onSubmit,
}: Props) {
  const t = useTranslations('onboarding');
  const tc = useTranslations('common');

  const canSubmit =
    nameFr.trim().length > 0 &&
    nameAr.trim().length > 0 &&
    price.trim().length > 0 &&
    imageUrl !== null &&
    !imageUploading &&
    !submitting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="nameFr">{t('productNameFr')} *</Label>
        <Input
          id="nameFr"
          value={nameFr}
          onChange={(e) => onNameFr(e.target.value)}
          placeholder={t('productNameFrPlaceholder')}
          required
          autoFocus
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="nameAr" dir="rtl">
          {t('productNameAr')} *
        </Label>
        <Input
          id="nameAr"
          dir="rtl"
          value={nameAr}
          onChange={(e) => onNameAr(e.target.value)}
          placeholder={t('productNameArPlaceholder')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="price">{t('price')} *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => onPrice(e.target.value)}
            placeholder={t('pricePlaceholder')}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stock">{t('stock')}</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => onStock(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="photo">{t('photo')} *</Label>
        <Input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageFile(f); }}
          disabled={imageUploading}
          className="cursor-pointer file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-foreground"
          required
        />
        {imageUploading && (
          <p className="text-xs text-muted-foreground">{t('uploading')}</p>
        )}
        {!imageUploading && !imageUrl && (
          <p className="text-xs text-muted-foreground">{t('photoRequired')}</p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t('error')}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={submitting}>
          {tc('back')}
        </Button>
        <Button type="submit" className="flex-1" disabled={!canSubmit}>
          {submitting ? tc('loading') : t('finish')}
        </Button>
      </div>
    </form>
  );
}
