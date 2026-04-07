'use client';

import { useState, useTransition, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Camera,
  Image as ImageIcon,
  Info,
  ShoppingCart,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type { Merchant } from '@/types/supabase';
import { updateBoutique } from './actions';

const COLOR_OPTIONS = [
  { value: '#2563EB', name: 'Bleu' },
  { value: '#E8632A', name: 'Orange' },
  { value: '#16A34A', name: 'Vert' },
  { value: '#7C3AED', name: 'Violet' },
  { value: '#D97706', name: 'Ambre' },
  { value: '#EC4899', name: 'Rose' },
];

const CATEGORIES = [
  'Mode & Vêtements',
  'Accessoires',
  'Maison & Décoration',
  'Beauté & Cosmétiques',
  'Électronique',
  'Alimentation',
  'Autre',
];

type Props = { merchant: Merchant };

export function BoutiqueForm({ merchant }: Props) {
  const t = useTranslations('boutique');
  const [isPending, startTransition] = useTransition();

  // Identity
  const [storeName, setStoreName] = useState(merchant.store_name);
  const [storeSlug, setStoreSlug] = useState(merchant.store_slug);
  const [description, setDescription] = useState(merchant.description ?? '');
  const [category, setCategory] = useState(merchant.category ?? CATEGORIES[0]);

  // Appearance
  const [logoUrl, setLogoUrl] = useState(merchant.logo_url ?? '');
  const [bannerUrl, setBannerUrl] = useState(merchant.banner_url ?? '');
  const [primaryColor, setPrimaryColor] = useState(merchant.primary_color ?? '#2563EB');

  // Delivery
  const rawThreshold = merchant.delivery_free_threshold
    ? String(merchant.delivery_free_threshold / 100)
    : '500';
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(
    !!merchant.delivery_free_threshold
  );
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(rawThreshold);

  // Status
  const [isOnline, setIsOnline] = useState(merchant.is_online ?? true);

  // Preview copy
  const [copied, setCopied] = useState(false);

  // Upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  async function uploadFile(
    file: File,
    setUploading: (v: boolean) => void,
    setUrl: (url: string) => void
  ) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'merchant-logos');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = (await res.json()) as { url?: string };
      if (json.url) setUrl(json.url);
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    const fd = new FormData();
    fd.set('store_name', storeName);
    fd.set('store_slug', storeSlug);
    fd.set('description', description);
    fd.set('category', category);
    fd.set('logo_url', logoUrl);
    fd.set('banner_url', bannerUrl);
    fd.set('primary_color', primaryColor);
    fd.set('is_online', String(isOnline));
    if (freeDeliveryEnabled && freeDeliveryThreshold) {
      fd.set('delivery_free_threshold', freeDeliveryThreshold);
    }
    startTransition(async () => {
      await updateBoutique(fd);
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(`plaza.ma/store/${storeSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Revenue examples
  const ex1Price = 350;
  const ex1Commission = ex1Price * 0.05;
  const ex1Revenue = ex1Price - ex1Commission;
  const ex2Price = 600;
  const ex2Commission = ex2Price * 0.05;
  const ex2Revenue = ex2Price - ex2Commission - 30;

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 ${
        checked ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  // ─── Shared sections ─────────────────────────────────────────────────────

  const identitySection = (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
        {t('identityTitle')}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">{t('storeName')}</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">{t('storeSlug')}</label>
          <input
            type="text"
            value={storeSlug}
            onChange={(e) =>
              setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
            }
            className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
          <p className="text-xs text-[#78716C] mt-1.5">plaza.ma/store/{storeSlug}</p>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">{t('description')}</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">{t('category')}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const appearanceSection = (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
        {t('appearanceTitle')}
      </h2>
      <div className="space-y-5">
        {/* Logo */}
        <div>
          <label className="block text-[13px] font-medium text-[#1C1917] mb-2">{t('logo')}</label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, setUploadingLogo, setLogoUrl);
            }}
          />
          <div
            onClick={() => !uploadingLogo && logoInputRef.current?.click()}
            className="w-[120px] h-[120px] border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#2563EB] transition-colors overflow-hidden"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-7 h-7 text-[#78716C] mb-1" />
                <span className="text-[12px] text-[#78716C]">
                  {uploadingLogo ? t('uploading') : t('addLogo')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-[13px] font-medium text-[#1C1917] mb-2">{t('primaryColor')}</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrimaryColor(opt.value)}
                title={opt.name}
                className="w-10 h-10 rounded-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: opt.value,
                  border:
                    primaryColor === opt.value
                      ? '2.5px solid #1C1917'
                      : '2px solid transparent',
                }}
              />
            ))}
          </div>
        </div>

        {/* Banner */}
        <div>
          <label className="block text-[13px] font-medium text-[#1C1917] mb-2">{t('banner')}</label>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, setUploadingBanner, setBannerUrl);
            }}
          />
          <div
            onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
            className="w-full h-[140px] border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#2563EB] transition-colors overflow-hidden"
          >
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon className="w-7 h-7 text-[#78716C] mb-1" />
                <span className="text-[12px] text-[#78716C]">
                  {uploadingBanner ? t('uploading') : t('addBanner')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const deliverySection = (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
        {t('deliveryTitle')}
      </h2>

      {/* Info box */}
      <div className="bg-[#EFF6FF] rounded-lg p-3 mb-5 flex gap-3">
        <Info className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-[#1C1917] mb-1">{t('deliveryHowTitle')}</p>
          <div className="space-y-0.5 text-xs text-[#78716C] leading-relaxed">
            <p>• {t('deliveryHow1')}</p>
            <p>• {t('deliveryHow2')}</p>
            <p>• {t('deliveryHow3')}</p>
          </div>
        </div>
      </div>

      {/* Free delivery toggle */}
      <div className="border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center justify-between h-12">
          <div>
            <div className="text-sm font-medium text-[#1C1917]">{t('freeDeliveryToggle')}</div>
            <div className="text-xs text-[#78716C] mt-0.5">{t('freeDeliverySubtitle')}</div>
          </div>
          <Toggle checked={freeDeliveryEnabled} onChange={() => setFreeDeliveryEnabled((v) => !v)} />
        </div>

        {freeDeliveryEnabled && (
          <div className="pt-4 mt-4">
            <label className="block text-[13px] font-medium text-[#1C1917] mb-2">
              {t('freeDeliveryLabel')}
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-[120px] h-12 px-3 text-center text-xl font-semibold border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <span className="text-base text-[#78716C]">MAD</span>
            </div>
            {/* Preview */}
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#78716C]" />
                  <span className="text-[13px] text-[#1C1917]">
                    {t('freeDeliveryBelow', { amount: freeDeliveryThreshold })}
                  </span>
                </div>
                <span className="text-[13px] text-[#78716C]">{t('freeDeliveryClientPays')}</span>
              </div>
              <div className="border-t border-[#D1FAE5] my-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-[13px] text-[#1C1917]">
                    {t('freeDeliveryAbove', { amount: freeDeliveryThreshold })}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-[#16A34A]">{t('freeDeliveryFree')}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#D1FAE5]">
                <p className="text-xs text-[#78716C] italic">{t('freeDeliveryNote')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue impact */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-[#1C1917] mb-3">{t('revenueImpact')}</label>
        <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg p-4">
          <p className="text-xs text-[#78716C] uppercase tracking-wide mb-2.5">
            {t('revenueExample', { price: ex1Price })}
          </p>
          <div className="space-y-2 mb-2">
            <div className="flex justify-between text-sm">
              <span>{t('revenueProducts')}</span>
              <span>{ex1Price} MAD</span>
            </div>
            <div className="flex justify-between text-sm text-[#DC2626]">
              <span>{t('revenueCommission')}</span>
              <span>- {ex1Commission.toFixed(2)} MAD</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-sm text-[#78716C]">
                <span>{t('revenueDeliveryFee')}</span>
                <span>+ 30 MAD</span>
              </div>
              <p className="text-[11px] text-[#A8A29E] italic text-right">{t('revenueDeliveryNote')}</p>
            </div>
          </div>
          <div className="border-t border-[#E2E8F0] my-2" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-[#1C1917]">{t('revenueNet')}</span>
            <span className="text-[#16A34A]">{ex1Revenue.toFixed(2)} MAD</span>
          </div>

          {freeDeliveryEnabled && (
            <>
              <div className="my-3 text-center">
                <p className="text-xs text-[#78716C]">
                  {t('revenueIfFreeDelivery', { threshold: freeDeliveryThreshold })}
                </p>
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-sm">
                  <span>{t('revenueProducts')}</span>
                  <span>{ex2Price} MAD</span>
                </div>
                <div className="flex justify-between text-sm text-[#DC2626]">
                  <span>{t('revenueCommission')}</span>
                  <span>- {ex2Commission.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-sm text-[#DC2626]">
                  <span>{t('revenueDeliveryAbsorbed')}</span>
                  <span>- 30 MAD</span>
                </div>
              </div>
              <div className="border-t border-[#E2E8F0] my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-[#1C1917]">{t('revenueNet')}</span>
                <span className="text-[#16A34A]">{ex2Revenue.toFixed(2)} MAD</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const statusSection = (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
        {t('statusTitle')}
      </h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#1C1917]">{t('storeOnlineLabel')}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOnline ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            {isOnline ? t('online') : t('offline')}
          </span>
        </div>
        <Toggle checked={isOnline} onChange={() => setIsOnline((v) => !v)} />
      </div>
      {!isOnline && (
        <p className="text-xs text-[#78716C] mt-2">{t('offlineNote')}</p>
      )}
    </div>
  );

  const previewPanel = (
    <div className="hidden md:block w-[300px] flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
        <h3 className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-4">
          {t('previewTitle')}
        </h3>

        {/* Phone mockup */}
        <div className="w-[220px] mx-auto border-2 border-[#E2E8F0] rounded-3xl overflow-hidden mb-3">
          <div className="bg-white h-[380px] overflow-hidden">
            <div
              className="h-14 flex items-center px-4 gap-3"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="w-7 h-7 rounded-full bg-white/20" />
              <span className="text-white text-sm font-medium truncate">{storeName}</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="aspect-square bg-[#F5F5F4] rounded-lg" />
                  <div className="h-2 bg-[#F5F5F4] rounded w-3/4" />
                  <div className="h-2 bg-[#F5F5F4] rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Store link */}
        <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
          <h4 className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-2">
            {t('storeLink')}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#1C1917] flex-1 truncate">
              plaza.ma/store/{storeSlug}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="p-1.5 hover:bg-[#F8FAFC] rounded transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#16A34A]" />
              ) : (
                <Copy className="w-4 h-4 text-[#78716C]" />
              )}
            </button>
          </div>
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 text-[13px] text-[#2563EB] hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('viewStore')}
          </a>
        </div>
      </div>
    </div>
  );

  // ─── Mobile layout ─────────────────────────────────────────────────────────

  const mobileLayout = (
    <div className="md:hidden bg-[#FAFAF9] min-h-screen pb-24">
      <div className="bg-white h-14 px-4 flex items-center justify-between border-b border-[#E2E8F0]">
        <h1 className="text-base font-semibold text-[#1C1917]">{t('pageTitle')}</h1>
        <a
          href={`/store/${storeSlug}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#2563EB]"
        >
          {t('viewStore')}
        </a>
      </div>

      {/* Link preview */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm p-4">
        <p className="text-xs text-[#78716C] uppercase mb-1">{t('storeLink')}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#2563EB] flex-1 truncate">
            plaza.ma/store/{storeSlug}
          </span>
          <button type="button" onClick={copyLink} className="p-1.5">
            {copied ? (
              <Check className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <Copy className="w-4 h-4 text-[#78716C]" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {identitySection}
        {appearanceSection}
        {deliverySection}
        {statusSection}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 md:hidden">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || uploadingLogo || uploadingBanner}
          className="w-full h-12 bg-[#2563EB] text-white text-base font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
        >
          {isPending ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );

  // ─── Desktop layout ────────────────────────────────────────────────────────

  const desktopLayout = (
    <div className="hidden md:block bg-[#FAFAF9] min-h-screen">
      <div className="max-w-[1280px] mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1C1917]">{t('pageTitle')}</h1>
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4 border border-[#2563EB] text-[#2563EB] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t('viewStore')}
          </a>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 max-w-[640px] space-y-3">
            {identitySection}
            {appearanceSection}
            {deliverySection}
            {statusSection}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending || uploadingLogo || uploadingBanner}
                className="w-[200px] h-12 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
              >
                {isPending ? t('saving') : t('save')}
              </button>
            </div>
          </div>

          {previewPanel}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
