'use client';

import { useState, useTransition, useRef } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import {
  Camera,
  Image as ImageIcon,
  Info,
  ShoppingCart,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import type { Merchant, DeliveryZone } from '@/types/supabase';
import { createClient } from '@/lib/supabase/client';
import { updateBoutique, updateTerminalEnabled } from './actions';
import { DeliveryZones } from './DeliveryZones';
import { WorkingHoursSection } from './WorkingHoursSection';
import type { WorkingHours } from './actions';

const MapboxLocationPicker = dynamic(
  () => import('@/components/MapboxMap'),
  { ssr: false }
);

const COLOR_OPTIONS = [
  { value: '#2563EB', name: 'Bleu' },
  { value: '#E8632A', name: 'Orange' },
  { value: '#16A34A', name: 'Vert' },
  { value: '#7C3AED', name: 'Violet' },
  { value: '#D97706', name: 'Ambre' },
  { value: '#EC4899', name: 'Rose' },
];

const STORE_CATEGORIES = [
  { value: 'fashion',     label: 'Mode & Vêtements' },
  { value: 'beauty',      label: 'Beauté & Bien-être' },
  { value: 'food',        label: 'Alimentation & Boissons' },
  { value: 'home',        label: 'Maison & Décoration' },
  { value: 'electronics', label: 'Électronique & Tech' },
  { value: 'sport',       label: 'Sport & Loisirs' },
  { value: 'jewelry',     label: 'Bijoux & Accessoires' },
  { value: 'kids',        label: 'Enfants & Jouets' },
  { value: 'other',       label: 'Autre' },
] as const;


type Props = { merchant: Merchant; deliveryZones: DeliveryZone[] };

export function BoutiqueForm({ merchant, deliveryZones }: Props) {
  const t = useTranslations('boutique');
  const [isPending, startTransition] = useTransition();
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Identity
  const [storeName, setStoreName] = useState(merchant.store_name);
  const [storeSlug, setStoreSlug] = useState(merchant.store_slug);
  const [description, setDescription] = useState(merchant.description ?? '');
  const [category, setCategory] = useState(merchant.category ?? '');
  const [locationLat, setLocationLat] = useState<number | null>(merchant.location_lat ?? null);
  const [locationLng, setLocationLng] = useState<number | null>(merchant.location_lng ?? null);
  const [locationDescription, setLocationDescription] = useState(merchant.location_description ?? '');

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

  // Payment modes
  const [terminalEnabled, setTerminalEnabled] = useState(merchant.terminal_enabled ?? false);

  // Working hours — column is DRAFT (not yet in DB)
  const DEFAULT_WORKING_HOURS: WorkingHours = {
    lundi:    { open: true,  from: '09:00', to: '18:00' },
    mardi:    { open: true,  from: '09:00', to: '18:00' },
    mercredi: { open: true,  from: '09:00', to: '18:00' },
    jeudi:    { open: true,  from: '09:00', to: '18:00' },
    vendredi: { open: true,  from: '09:00', to: '18:00' },
    samedi:   { open: false, from: '',      to: '' },
    dimanche: { open: false, from: '',      to: '' },
  };
  const initialWorkingHours =
    (merchant as unknown as { working_hours?: WorkingHours }).working_hours ??
    DEFAULT_WORKING_HOURS;
  const workingHoursSection = (
    <WorkingHoursSection initialHours={initialWorkingHours} />
  );

  // Checklist gate modal
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [missingItems, setMissingItems] = useState<{ label: string; href: string }[]>([]);

  /**
   * handleToggleOnline — gate logic before setting is_online = true.
   * Toggling offline is always allowed.
   * Toggling online requires logo, description, category, location pin, and
   * at least 1 visible product — otherwise a blocking modal is shown.
   */
  async function handleToggleOnline() {
    if (isOnline) {
      // Turning off — always allow
      setIsOnline(false);
      return;
    }

    // Re-fetch saved merchant record + product count in parallel to verify saved state
    // (prevents gap where form is filled but not yet saved)
    const supabase = createClient();
    type GateFields = Pick<Merchant, 'logo_url' | 'description' | 'category' | 'location_lat' | 'phone_verified'>;
    const [gateResult, { count: visibleCount }] = await Promise.all([
      supabase
        .from('merchants')
        .select('logo_url, description, category, location_lat, phone_verified')
        .eq('id', merchant.id)
        .maybeSingle(),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('is_visible', true),
    ]);
    const saved = gateResult.data as GateFields | null;

    const missing: { label: string; href: string }[] = [];

    if (!saved?.logo_url || saved.logo_url.trim().length === 0) {
      missing.push({ label: 'Photo de la boutique', href: '#logo' });
    }
    if (!saved?.description || saved.description.trim().length === 0) {
      missing.push({ label: 'Description de la boutique', href: '#description' });
    }
    if (!saved?.category || saved.category.trim().length === 0) {
      missing.push({ label: 'Catégorie', href: '#category' });
    }
    if (saved?.location_lat === null || saved?.location_lat === undefined) {
      missing.push({ label: 'Localisation — épingle sur la carte', href: '#location' });
    }
    if (!saved?.phone_verified) {
      missing.push({ label: 'Vérifiez votre numéro de téléphone', href: '/dashboard/compte' });
    }
    if ((visibleCount ?? 0) < 1) {
      missing.push({ label: 'Au moins 1 produit publié', href: '/dashboard/produits' });
    }

    if (missing.length > 0) {
      setMissingItems(missing);
      setShowIncompleteModal(true);
      return; // toggle must NOT flip to true
    }

    setIsOnline(true);
  }

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
    if (locationLat !== null) fd.set('location_lat', String(locationLat));
    if (locationLng !== null) fd.set('location_lng', String(locationLng));
    fd.set('location_description', locationDescription);
    fd.set('logo_url', logoUrl);
    fd.set('banner_url', bannerUrl);
    fd.set('primary_color', primaryColor);
    fd.set('is_online', String(isOnline));
    if (freeDeliveryEnabled && freeDeliveryThreshold) {
      fd.set('delivery_free_threshold', freeDeliveryThreshold);
    }
    startTransition(async () => {
      await updateBoutique(fd);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
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

  const Toggle = ({
    checked,
    onChange,
    testId,
  }: {
    checked: boolean;
    onChange: () => void;
    testId?: string;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        checked ? 'bg-success' : 'bg-border'
      }`}
      data-testid={testId}
    >
      <span
        className={`absolute top-0.5 start-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  // ─── Shared sections ─────────────────────────────────────────────────────

  // design-refresh §2.3 card + §2.2 inputs — all inputs share border-border / focus ring.
  const identitySection = (
    <div className="bg-card rounded-xl shadow-card p-6">
      <h2 className="text-base font-semibold text-foreground pb-3 mb-4 border-b border-border">
        {t('identityTitle')}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">{t('storeName')}</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            data-testid="merchant-boutique-store-name-input"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">{t('storeSlug')}</label>
          <input
            type="text"
            value={storeSlug}
            onChange={(e) =>
              setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
            }
            className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            data-testid="merchant-boutique-store-slug-input"
          />
          <p className="text-xs text-muted-foreground mt-1.5">plaza.ma/store/{storeSlug}</p>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">{t('description')}</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring resize-none"
            data-testid="merchant-boutique-description-textarea"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">{t('category')}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring bg-card"
            data-testid="merchant-boutique-category-select"
          >
            <option value="" disabled>Choisir une catégorie…</option>
            {STORE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">
            Localisation de la boutique
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Cliquez sur la carte pour épingler l&apos;adresse exacte de votre boutique.
          </p>
          <MapboxLocationPicker
            lat={locationLat}
            lng={locationLng}
            onLocationChange={(lat, lng) => {
              setLocationLat(lat);
              setLocationLng(lng);
            }}
          />
          {locationLat && locationLng && (
            <p className="text-xs text-success mt-1.5">
              ✓ Position enregistrée ({locationLat.toFixed(5)}, {locationLng.toFixed(5)})
            </p>
          )}
        </div>
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">
            Indications supplémentaires
          </label>
          <input
            type="text"
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            placeholder="Ex: 2ème étage, porte bleue, en face du café..."
            className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            data-testid="merchant-boutique-location-description-input"
          />
        </div>
      </div>
    </div>
  );

  const appearanceSection = (
    <div className="bg-card rounded-xl shadow-card p-6">
      <h2 className="text-base font-semibold text-foreground pb-3 mb-4 border-b border-border">
        {t('appearanceTitle')}
      </h2>
      <div className="space-y-5">
        {/* Logo */}
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">{t('logo')}</label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, setUploadingLogo, setLogoUrl);
            }}
            data-testid="merchant-boutique-logo-input"
          />
          <div
            onClick={() => !uploadingLogo && logoInputRef.current?.click()}
            className="w-[120px] h-[120px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-7 h-7 text-muted-foreground mb-1" />
                <span className="text-[12px] text-muted-foreground">
                  {uploadingLogo ? t('uploading') : t('addLogo')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Color — user-facing brand color picker; hex values are *data* (tenant
            primary_color), not design tokens. Border of the selected swatch
            uses the foreground token so it reads on any swatch colour. */}
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">{t('primaryColor')}</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrimaryColor(opt.value)}
                title={opt.name}
                className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                  primaryColor === opt.value
                    ? 'ring-[2.5px] ring-foreground'
                    : 'ring-2 ring-transparent'
                }`}
                style={{ backgroundColor: opt.value }}
                data-testid={`merchant-boutique-color-${opt.value.replace('#', '').toLowerCase()}-btn`}
              />
            ))}
          </div>
        </div>

        {/* Banner */}
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">{t('banner')}</label>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, setUploadingBanner, setBannerUrl);
            }}
            data-testid="merchant-boutique-banner-input"
          />
          <div
            onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
            className="w-full h-[140px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
          >
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon className="w-7 h-7 text-muted-foreground mb-1" />
                <span className="text-[12px] text-muted-foreground">
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
    <div className="bg-card rounded-xl shadow-card p-6">
      <h2 className="text-base font-semibold text-foreground pb-3 mb-4 border-b border-border">
        {t('deliveryTitle')}
      </h2>

      {/* Info box — design-refresh §2.8 primary-tint badge pattern. */}
      <div className="rounded-lg p-3 mb-5 flex gap-3 bg-primary/10">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-1">{t('deliveryHowTitle')}</p>
          <div className="space-y-0.5 text-xs text-muted-foreground leading-relaxed">
            <p>• {t('deliveryHow1')}</p>
            <p>• {t('deliveryHow2')}</p>
            <p>• {t('deliveryHow3')}</p>
          </div>
        </div>
      </div>

      {/* Free delivery toggle */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between h-12">
          <div>
            <div className="text-sm font-medium text-foreground">{t('freeDeliveryToggle')}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t('freeDeliverySubtitle')}</div>
          </div>
          <Toggle
            checked={freeDeliveryEnabled}
            onChange={() => setFreeDeliveryEnabled((v) => !v)}
            testId="merchant-boutique-free-delivery-toggle-checkbox"
          />
        </div>

        {freeDeliveryEnabled && (
          <div className="pt-4 mt-4">
            <label className="block text-[13px] font-medium text-foreground mb-2">
              {t('freeDeliveryLabel')}
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-[120px] h-12 px-3 text-center text-xl font-semibold border-2 border-border rounded-lg focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                data-testid="merchant-boutique-free-delivery-threshold-input"
              />
              <span className="text-base text-muted-foreground">MAD</span>
            </div>
            {/* Preview — §2.8 success-tint info card. */}
            <div className="bg-success/10 border border-success/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[13px] text-foreground">
                    {t('freeDeliveryBelow', { amount: freeDeliveryThreshold })}
                  </span>
                </div>
                <span className="text-[13px] text-muted-foreground">{t('freeDeliveryClientPays')}</span>
              </div>
              <div className="border-t border-success/20 my-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-[13px] text-foreground">
                    {t('freeDeliveryAbove', { amount: freeDeliveryThreshold })}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-success">{t('freeDeliveryFree')}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-success/20">
                <p className="text-xs text-muted-foreground italic">{t('freeDeliveryNote')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue impact */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-foreground mb-3">{t('revenueImpact')}</label>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2.5">
            {t('revenueExample', { price: ex1Price })}
          </p>
          <div className="space-y-2 mb-2">
            <div className="flex justify-between text-sm">
              <span>{t('revenueProducts')}</span>
              <span>{ex1Price} MAD</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
              <span>{t('revenueCommission')}</span>
              <span>- {ex1Commission.toFixed(2)} MAD</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('revenueDeliveryFee')}</span>
                <span>+ 30 MAD</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic text-right">{t('revenueDeliveryNote')}</p>
            </div>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-foreground">{t('revenueNet')}</span>
            <span className="text-success">{ex1Revenue.toFixed(2)} MAD</span>
          </div>

          {freeDeliveryEnabled && (
            <>
              <div className="my-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {t('revenueIfFreeDelivery', { threshold: freeDeliveryThreshold })}
                </p>
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-sm">
                  <span>{t('revenueProducts')}</span>
                  <span>{ex2Price} MAD</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>{t('revenueCommission')}</span>
                  <span>- {ex2Commission.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>{t('revenueDeliveryAbsorbed')}</span>
                  <span>- 30 MAD</span>
                </div>
              </div>
              <div className="border-t border-border my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-foreground">{t('revenueNet')}</span>
                <span className="text-success">{ex2Revenue.toFixed(2)} MAD</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const statusSection = (
    <div className="bg-card rounded-xl shadow-card p-6">
      <h2 className="text-base font-semibold text-foreground pb-3 mb-4 border-b border-border">
        {t('statusTitle')}
      </h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">{t('storeOnlineLabel')}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOnline ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}
          >
            {isOnline ? t('online') : t('offline')}
          </span>
        </div>
        <Toggle
          checked={isOnline}
          onChange={handleToggleOnline}
          testId="merchant-boutique-online-toggle-checkbox"
        />
      </div>
      {!isOnline && (
        <p className="text-xs text-muted-foreground mt-2">{t('offlineNote')}</p>
      )}
    </div>
  );

  const paymentModesSection = (
    <div className="bg-card rounded-xl shadow-card p-6">
      <h2 className="text-base font-semibold text-foreground pb-3 mb-4 border-b border-border">
        Modes de paiement acceptés
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-foreground">Paiement à la livraison (espèces)</span>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-success">Activé</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="text-sm text-foreground">Terminal carte</span>
          <Toggle
            checked={terminalEnabled}
            onChange={() => {
              const next = !terminalEnabled;
              setTerminalEnabled(next);
              startTransition(() => updateTerminalEnabled(next));
            }}
            testId="merchant-boutique-terminal-toggle-checkbox"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="text-sm text-foreground">Carte en ligne (CMI)</span>
          {merchant.cmi_enabled ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-success">Activé par Plaza</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Non activé</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="hidden md:block w-[300px] flex-shrink-0">
      <div className="bg-card rounded-xl shadow-card p-4 sticky top-8">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t('previewTitle')}
        </h3>

        {/* Phone mockup — the interior card colour stays `bg-white` for the
            mini preview of the storefront (always light irrespective of our
            dashboard tokens). The header bar is tenant primaryColor (data). */}
        <div className="w-[220px] mx-auto border-2 border-border rounded-3xl overflow-hidden mb-3">
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
                  <div className="aspect-square bg-muted rounded-lg" />
                  <div className="h-2 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Store link */}
        <div className="mt-3 pt-3 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t('storeLink')}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground flex-1 truncate">
              plaza.ma/store/{storeSlug}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="p-1.5 hover:bg-muted rounded transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 text-[13px] hover:underline flex items-center gap-1 text-primary"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('viewStore')}
          </a>
        </div>
      </div>
    </div>
  );

  // ─── Unified layout (mobile + desktop via responsive classes) ─────────────
  // PLZ-079: removed the previous `md:hidden` / `hidden md:block` fork so each
  // testid (save button, inputs, selects) resolves to exactly one DOM element
  // at any breakpoint. The "Enregistré ✓" indicator now lives in the single
  // save-button row, fixing SAAD-003 (indicator invisible on desktop).
  return (
    <>
      {/* design-refresh §3.1 — canvas is `bg-background` (#F8F9FA). */}
      <div className="bg-background min-h-screen pb-40 md:pb-0">
        {/* Top bar — mobile: compact h-14 with text link.
                      desktop: bordered ExternalLink button. */}
        <div className="bg-card md:bg-transparent h-14 md:h-auto px-4 md:px-0 flex items-center justify-between border-b md:border-b-0 border-border md:pt-8 md:mb-6 md:max-w-[1280px] md:mx-auto md:w-full md:px-8">
          <h1 className="text-base md:text-2xl font-semibold text-foreground">{t('pageTitle')}</h1>
          {/* Mobile variant: plain text link. Tenant primary via CSS var.    */}
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm md:hidden"
            style={{ color: 'var(--color-primary)' }}
          >
            {t('viewStore')}
          </a>
          {/* Desktop variant: bordered button with ExternalLink icon. Uses
              tenant `--color-primary` so it matches the storefront
              per-tenant colour the merchant configures below. */}
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex h-10 px-4 rounded-lg text-sm font-medium transition-colors items-center gap-2"
            style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 8%, white)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ExternalLink className="w-4 h-4" />
            {t('viewStore')}
          </a>
        </div>

        {/* Mobile-only link preview card (desktop has it inside the preview panel). */}
        <div className="md:hidden bg-card mx-4 mt-4 rounded-xl shadow-card p-4">
          <p className="text-xs text-muted-foreground uppercase mb-1">{t('storeLink')}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm flex-1 truncate" style={{ color: 'var(--color-primary)' }}>
              plaza.ma/store/{storeSlug}
            </span>
            <button type="button" onClick={copyLink} className="p-1.5">
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Main content: single-column on mobile, 2-column on desktop with preview aside. */}
        <div className="max-w-[1280px] mx-auto md:px-8 md:flex md:gap-6">
          <div className="flex-1 md:max-w-[640px] p-4 md:p-0 space-y-3">
            {identitySection}
            {appearanceSection}
            {deliverySection}
            <DeliveryZones initialZones={deliveryZones} />
            {statusSection}
            {workingHoursSection}
            {paymentModesSection}

            {/* Save row — single element, positioned fixed bottom on mobile,
                static inline on desktop. `flex-col-reverse` on mobile puts the
                indicator ABOVE the button (DOM order is button → indicator).
                PLZ-082: on mobile (<lg) MobileNav is fixed at bottom-0 with h-16
                so the save bar sits at `bottom-16` to stack above it. Z-index
                stays below MobileNav's z-50 so the nav's shadow doesn't bleed
                over the save bar; the vertical offset prevents occlusion. */}
            {/* Save bar — tenant `--color-primary` var kept intact for PLZ-088
                mobile fix. Surface colour swapped to `bg-card`. */}
            <div className="fixed md:static bottom-16 md:bottom-0 start-0 end-0 z-10 bg-card md:bg-transparent border-t md:border-t-0 border-border p-4 md:p-0 md:pt-2 flex flex-col-reverse md:flex-row md:items-center md:gap-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending || uploadingLogo || uploadingBanner}
                className="w-full md:w-[200px] h-12 text-white text-base md:text-sm font-semibold md:font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
                data-testid="merchant-boutique-save-btn"
              >
                {isPending ? t('saving') : t('save')}
              </button>
              {savedIndicator && (
                <span className="text-center md:text-start text-sm font-medium text-success mb-2 md:mb-0">
                  Enregistré ✓
                </span>
              )}
            </div>
          </div>

          {previewPanel}
        </div>
      </div>

      {/* ── Checklist gate modal ─────────────────────────────────────────────── */}
      {showIncompleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="incomplete-modal-title"
          data-testid="merchant-boutique-incomplete-dialog"
        >
          <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-6">
            <h2
              id="incomplete-modal-title"
              className="text-base font-semibold text-foreground mb-4"
            >
              Complétez d&apos;abord ces étapes :
            </h2>
            <ul className="space-y-2 mb-6">
              {missingItems.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0 mt-0.5" />
                  <a
                    href={item.href}
                    onClick={() => setShowIncompleteModal(false)}
                    className="text-sm hover:underline text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowIncompleteModal(false)}
              className="w-full h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              data-testid="merchant-boutique-incomplete-close-btn"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
