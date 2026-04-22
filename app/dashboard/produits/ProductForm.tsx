'use client';

import { useState, useTransition, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types/supabase';
import { createProduct, updateProduct, deleteProduct } from './actions';

const PRODUCT_CATEGORIES: Record<string, Record<string, string[]>> = {
  'Mode': {
    'Femme': ['Robes', 'Tops & T-shirts', 'Pantalons', 'Vestes', 'Sous-vêtements', 'Chaussures', 'Accessoires'],
    'Homme': ['Chemises', 'Pantalons', 'Vestes', 'T-shirts', 'Chaussures', 'Accessoires'],
    'Enfants': ['Vêtements fille', 'Vêtements garçon', 'Chaussures enfant'],
    'Autre': [],
  },
  'Beauté': {
    'Soins visage': ['Crèmes hydratantes', 'Sérums', 'Masques', 'Contours des yeux'],
    'Soins corps': ['Lotions', 'Huiles corps', 'Gommages'],
    'Maquillage': ['Fond de teint', 'Rouge à lèvres', 'Mascara', 'Fards'],
    'Parfums': ['Eau de parfum', 'Eau de toilette', 'Huiles parfumées'],
    'Cheveux': ['Shampooings', 'Soins & masques', 'Colorations'],
  },
  'Alimentation': {
    'Épices & condiments': ['Ras el hanout', 'Cumin', 'Paprika', 'Harissa', "Mélange d'épices"],
    'Huiles & vinaigres': ["Huile d'olive", "Huile d'argan", 'Vinaigres'],
    'Boissons': ['Thé & tisanes', 'Café', 'Jus naturels'],
    'Pâtisseries & sucreries': ['Gâteaux secs', 'Miel', 'Confiture', 'Chocolats'],
    'Produits frais': ['Fromages', 'Yaourts', 'Autres'],
    'Autre': [],
  },
  'Maison': {
    'Cuisine': ['Ustensiles', 'Art de la table', 'Rangement cuisine'],
    'Salon & séjour': ['Coussins', 'Tapis', 'Rideaux', 'Décoration'],
    'Chambre': ['Linge de lit', 'Oreillers & couettes'],
    'Salle de bain': ['Serviettes', 'Accessoires salle de bain'],
    'Autre': [],
  },
  'Électronique': {
    'Smartphones & téléphonie': ['Smartphones', 'Accessoires téléphone', 'Coque & protection'],
    'Informatique': ['PC & laptops', 'Périphériques', 'Stockage'],
    'Audio & vidéo': ['Écouteurs', 'Enceintes', 'TV & projecteurs'],
    'Électroménager': ['Petit électroménager', 'Gros électroménager'],
    'Autre': [],
  },
  'Sport': {
    'Fitness & musculation': ['Vêtements sport', 'Équipement fitness', 'Nutrition sportive'],
    'Sports outdoor': ['Randonnée', 'Cyclisme', 'Football & sports collectifs'],
    'Bien-être': ['Yoga & méditation', 'Massage'],
    'Autre': [],
  },
  'Bijoux': {
    'Colliers & pendentifs': [],
    'Bagues': [],
    'Bracelets': [],
    "Boucles d'oreilles": [],
    'Montres': [],
    'Bijoux fantaisie': [],
  },
  'Enfants': {
    'Jouets & jeux': ["Jouets d'éveil", 'Jeux de société', 'Peluches'],
    'Vêtements enfant': ['0-2 ans', '3-6 ans', '7-12 ans'],
    'Puériculture': ['Poussettes', 'Sièges auto', 'Accessoires bébé'],
    'Livres & éducatif': [],
    'Autre': [],
  },
  'Autre': {
    'Autre': [],
  },
};

type Props = {
  product?: Product;
};

export function ProductForm({ product }: Props) {
  const t = useTranslations('products');
  const isEdit = !!product;
  const [isPending, startTransition] = useTransition();

  // Form state
  const [nameFr, setNameFr] = useState(product?.name_fr ?? '');
  const nameAr = product?.name_ar ?? '';
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(
    product ? String(product.price / 100) : ''
  );
  // New products default to stock=1 so they appear orderable immediately.
  // Edited products keep their existing stock value.
  const [stock, setStock] = useState(product?.stock ?? (isEdit ? 0 : 1));
  const [isVisible, setIsVisible] = useState(product?.is_visible ?? true);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Categories
  const [catL1, setCatL1] = useState(product?.category_l1 ?? '');
  const [catL2, setCatL2] = useState(product?.category_l2 ?? '');
  const [catL3, setCatL3] = useState(product?.category_l3 ?? '');

  // Discount / promotion
  const [discountActive, setDiscountActive] = useState(product?.discount_active ?? false);
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price ? String(product.original_price / 100) : ''
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Price calculator
  const priceNum = parseFloat(price) || 0;
  const commission = priceNum * 0.05;
  const revenue = priceNum - commission;
  const showCalc = priceNum >= 1;
  const priceError = price !== '' && priceNum > 0 && priceNum < 1;

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'product-images');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (json.url) setImageUrl(json.url);
    } finally {
      setUploading(false);
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!nameFr.trim()) newErrors.nameFr = t('formNameRequired');
    if (!price || priceNum <= 0) newErrors.price = t('formPriceRequired');
    if (priceNum > 0 && priceNum < 1) newErrors.price = t('formPriceMin');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    // Warn the merchant if they are saving with stock = 0
    if (stock === 0) {
      const confirmed = window.confirm(
        'Ce produit sera affiché comme épuisé et ne pourra pas être commandé. Continuer ?'
      );
      if (!confirmed) return;
    }
    const fd = new FormData();
    fd.set('name_fr', nameFr);
    fd.set('name_ar', nameAr);
    fd.set('description', description);
    fd.set('price', price);
    fd.set('stock', String(stock));
    fd.set('image_url', imageUrl);
    fd.set('is_visible', String(isVisible));
    fd.set('category_l1', catL1);
    fd.set('category_l2', catL2);
    fd.set('category_l3', catL3);
    fd.set('discount_active', String(discountActive));
    if (discountActive && originalPrice) {
      fd.set('original_price', String(Math.round(parseFloat(originalPrice) * 100)));
    }
    startTransition(async () => {
      if (isEdit && product) {
        await updateProduct(product.id, fd);
      } else {
        await createProduct(fd);
      }
    });
  }

  function handleDelete() {
    if (!product) return;
    startDeleteTransition(async () => {
      await deleteProduct(product.id);
    });
  }

  // ─── Shared sub-components ────────────────────────────────────────────────

  const priceCalculator = (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderLeftColor: 'var(--color-primary)' }}>
      <h2 className="text-base font-semibold text-[#1C1917] mb-1">{t('formPriceTitle')}</h2>
      <p className="text-[13px] text-[#78716C] mb-4">{t('formPriceSubtitle')}</p>

      {/* Promotion toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-[#FFF7ED] rounded-lg">
        <div>
          <div className="text-sm font-medium text-[#1C1917]">Activer une promotion</div>
          <div className="text-xs text-[#78716C]">Afficher un prix barré sur le produit</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={discountActive}
          onClick={() => setDiscountActive(v => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
            discountActive ? 'bg-[#E8632A]' : 'bg-[#E2E8F0]'
          }`}
          data-testid="merchant-product-form-discount-toggle-checkbox"
        >
          <span className={`absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            discountActive ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {discountActive && (
        <div className="mb-3">
          <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">
            Prix original (barré)
          </label>
          <div className="relative">
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full h-14 px-4 pr-16 border border-[#E2E8F0] rounded-lg text-2xl font-semibold text-[#1C1917] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              data-testid="merchant-product-form-original-price-input"
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-base text-[#78716C]">MAD</span>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">
          {discountActive ? 'Prix promotionnel' : t('formPriceLabel')}
        </label>
        <div className="relative">
          <input
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setErrors((prev) => ({ ...prev, price: '' }));
            }}
            className={`w-full h-14 px-4 pr-16 border rounded-lg text-2xl font-semibold text-[#1C1917] focus:outline-none transition-all ${
              errors.price || priceError
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
                : 'border-[#E2E8F0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20'
            }`}
            data-testid="merchant-product-form-price-input"
          />
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-base text-[#78716C]">MAD</span>
        </div>
        {(errors.price || priceError) && (
          <p className="text-xs text-[#DC2626] mt-1.5">{errors.price || t('formPriceMin')}</p>
        )}
      </div>

      <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg p-3">
        <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-2.5">
          {t('formRevenueTitle')}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#1C1917]">{t('formPriceClient')}</span>
            <span className="text-[#1C1917]">{showCalc ? `${priceNum.toFixed(2)} MAD` : '—'}</span>
          </div>
          <div className="flex justify-between text-sm text-[#DC2626]">
            <span>{t('formPriceCommission')}</span>
            <span>{showCalc ? `- ${commission.toFixed(2)} MAD` : '—'}</span>
          </div>
          <div className="border-t border-[#E2E8F0]" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-[#1C1917]">{t('formPriceRevenue')}</span>
            <span className="text-[#16A34A]">{showCalc ? `${revenue.toFixed(2)} MAD` : '—'}</span>
          </div>
        </div>
        <div className="my-2.5 border-t border-dashed border-[#E2E8F0]" />
        <div className="flex gap-1.5 items-start">
          <Info className="w-4 h-4 text-[#78716C] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#78716C] leading-relaxed">{t('formPriceNote')}</p>
        </div>
      </div>
    </div>
  );

  const photoCard = (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#1C1917] mb-3">{t('formPhoto')}</h3>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageChange}
        data-testid="merchant-product-form-photo-input"
      />
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="w-full h-[200px] rounded-lg flex flex-col items-center justify-center gap-2 mb-2 cursor-pointer transition-colors overflow-hidden"
        style={{ background: imageUrl ? 'transparent' : undefined }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="w-full h-full bg-[#F5F5F4] hover:bg-[#EEEEEE] transition-colors flex flex-col items-center justify-center gap-2">
            <Camera className="w-8 h-8 text-[#A8A29E]" />
            <span className="text-[13px]" style={{ color: 'var(--color-primary)' }}>
              {uploading ? t('uploading') : (imageUrl ? t('formPhotoChange') : t('formPhotoAdd'))}
            </span>
          </div>
        )}
      </div>
      {imageUrl && (
        <button
          type="button"
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="text-[13px] hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          {uploading ? t('uploading') : t('formPhotoChange')}
        </button>
      )}
      <p className="text-xs text-[#A8A29E] mt-1">{t('formPhotoFormats')}</p>
    </div>
  );

  const visibilityCard = (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#1C1917]">{t('formVisible')}</span>
        <button
          type="button"
          onClick={() => setIsVisible((v) => !v)}
          role="switch"
          aria-checked={isVisible}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
            isVisible ? 'bg-[var(--color-primary)]' : 'bg-[#E2E8F0]'
          }`}
          data-testid="merchant-product-form-visibility-toggle-checkbox"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isVisible ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-[#78716C] mt-1">
        {isVisible ? t('formVisibleDesc') : t('formHiddenDesc')}
      </p>
    </div>
  );

  const dangerCard = isEdit ? (
    <div className="bg-white rounded-xl border border-[#FEE2E2] shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#DC2626] mb-2">{t('formDangerZone')}</h3>
      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="w-full h-10 bg-white border-[1.5px] border-[#DC2626] text-[#DC2626] rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors"
        data-testid="merchant-product-form-delete-btn"
      >
        {t('formDelete')}
      </button>
      <p className="text-xs text-[#78716C] mt-1.5">{t('formDangerDesc')}</p>
    </div>
  ) : null;

  // ─── Info form (name / description / categories / stock) ────────────────
  // Rendered once. Inputs share responsive classes (mobile h-11 / desktop h-10).
  // Stock has desktop-only ± stepper buttons — those testids only exist once.
  const infoForm = (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 space-y-4">
      <h2 className="hidden md:block text-base font-semibold text-[#1C1917] mb-4">
        {t('formInfoTitle')}
      </h2>

      {/* Name FR */}
      <div>
        <label className="block text-sm md:text-[13px] font-medium md:font-normal text-[#1C1917] md:text-[#78716C] mb-2 md:mb-1.5">
          {t('formNameFr')}
        </label>
        <input
          type="text"
          value={nameFr}
          onChange={(e) => {
            setNameFr(e.target.value);
            setErrors((prev) => ({ ...prev, nameFr: '' }));
          }}
          className={`w-full h-11 md:h-10 px-3 border rounded-lg text-sm focus:outline-none md:focus:ring-1 ${
            errors.nameFr
              ? 'border-[#DC2626] focus:border-[#DC2626] md:focus:ring-[#DC2626]'
              : 'border-[#E2E8F0] focus:border-[var(--color-primary)] md:focus:ring-[var(--color-primary)]'
          }`}
          data-testid="merchant-product-form-name-input"
        />
        {errors.nameFr && (
          <p className="text-xs text-[#DC2626] mt-1">{errors.nameFr}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm md:text-[13px] font-medium md:font-normal text-[#1C1917] md:text-[#78716C] mb-2 md:mb-1.5">
          {t('formDescription')}
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] md:focus:ring-1 md:focus:ring-[var(--color-primary)] resize-none md:min-h-[104px]"
          data-testid="merchant-product-form-description-textarea"
        />
      </div>

      {/* Product categories — 3 levels */}
      <div>
        <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">
          Catégorie
        </label>
        <select
          value={catL1}
          onChange={(e) => { setCatL1(e.target.value); setCatL2(''); setCatL3(''); }}
          className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] bg-white mb-2"
          data-testid="merchant-product-form-category-l1-select"
        >
          <option value="">Sélectionner une catégorie</option>
          {Object.keys(PRODUCT_CATEGORIES).map((l1) => (
            <option key={l1} value={l1}>{l1}</option>
          ))}
        </select>

        {catL1 && Object.keys(PRODUCT_CATEGORIES[catL1] ?? {}).length > 0 && (
          <select
            value={catL2}
            onChange={(e) => { setCatL2(e.target.value); setCatL3(''); }}
            className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] bg-white mb-2"
            data-testid="merchant-product-form-category-l2-select"
          >
            <option value="">Sous-catégorie</option>
            {Object.keys(PRODUCT_CATEGORIES[catL1]).map((l2) => (
              <option key={l2} value={l2}>{l2}</option>
            ))}
          </select>
        )}

        {catL1 && catL2 && (PRODUCT_CATEGORIES[catL1]?.[catL2] ?? []).length > 0 && (
          <select
            value={catL3}
            onChange={(e) => setCatL3(e.target.value)}
            className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
            data-testid="merchant-product-form-category-l3-select"
          >
            <option value="">Type (optionnel)</option>
            {(PRODUCT_CATEGORIES[catL1][catL2]).map((l3) => (
              <option key={l3} value={l3}>{l3}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stock — desktop shows ± stepper buttons around the input, mobile shows plain input. */}
      <div>
        <label className="block text-sm md:text-[13px] font-medium md:font-normal text-[#1C1917] md:text-[#78716C] mb-2 md:mb-1.5">
          {t('formStock')}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStock((s) => Math.max(0, s - 1))}
            className="hidden md:inline-flex items-center justify-center w-8 h-8 border border-[#E2E8F0] rounded text-[#78716C] hover:bg-[#F8FAFC] text-lg leading-none"
            data-testid="merchant-product-form-stock-decrement-btn"
          >
            −
          </button>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full md:w-24 h-11 md:h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm md:text-center focus:outline-none focus:border-[var(--color-primary)] md:focus:ring-1 md:focus:ring-[var(--color-primary)]"
            data-testid="merchant-product-form-stock-input"
          />
          <button
            type="button"
            onClick={() => setStock((s) => s + 1)}
            className="hidden md:inline-flex items-center justify-center w-8 h-8 border border-[#E2E8F0] rounded text-[#78716C] hover:bg-[#F8FAFC] text-lg leading-none"
            data-testid="merchant-product-form-stock-increment-btn"
          >
            +
          </button>
        </div>
        <p className="text-xs text-[#78716C] mt-1 md:mt-1.5">
          Stock = 0 signifie rupture de stock — le produit sera visible mais non commandable.
        </p>
      </div>
    </div>
  );

  // ─── Unified layout (mobile + desktop via responsive classes) ─────────────
  // PLZ-079: collapsed the previous `md:hidden` / `hidden md:block` fork so
  // each testid (publish-btn, name-input, description-textarea, category
  // selects, stock-input, visibility toggle) resolves to exactly one DOM
  // element at any breakpoint. Cards use responsive `order-*` classes to
  // reposition themselves between the mobile stack and desktop 2-column grid.
  //
  // The single publish button below is positioned via its wrapper:
  //  - mobile: `fixed bottom-0` sticky footer across the viewport.
  //  - desktop: `static` inline top-right action bar.
  // PLZ-082: on mobile (<lg) MobileNav is fixed bottom-0 h-16 at z-50. The
  // publish bar sits at `bottom-16` so it stacks above MobileNav instead of
  // being occluded by it. On md+ the wrapper flips to `static`, which nullifies
  // any `bottom-*` class, so the inline desktop layout is unaffected.
  const publishRow = (
    <div className="fixed md:static bottom-16 md:bottom-0 start-0 end-0 z-10 md:z-0 bg-white md:bg-transparent border-t md:border-t-0 border-[#E2E8F0] p-4 md:p-0 md:mb-6 flex justify-stretch md:justify-end">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || uploading}
        className="w-full md:w-auto h-12 md:h-10 md:px-4 text-white text-base md:text-sm font-semibold md:font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-primary)' }}
        data-testid="merchant-product-form-publish-btn"
      >
        {isPending
          ? isEdit ? t('formSaving') : t('formPublishing')
          : isEdit ? t('formSave') : t('formPublish')}
      </button>
    </div>
  );

  const deleteModal = showDeleteModal ? (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      data-testid="merchant-product-form-delete-dialog"
    >
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-[#1C1917] mb-2">{t('formDeleteTitle')}</h3>
        <p className="text-sm text-[#78716C] mb-6">{t('formDeleteBody')}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
            className="flex-1 h-10 border border-[#E2E8F0] text-[#1C1917] text-sm font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors disabled:opacity-50"
            data-testid="merchant-product-form-delete-cancel-btn"
          >
            {t('formDeleteCancel')}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 h-10 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
            data-testid="merchant-product-form-delete-confirm-btn"
          >
            {isDeleting ? t('loading') : t('formDeleteConfirm')}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="bg-[#FAFAF9] min-h-screen pb-40 md:pb-0">
        {/* Mobile top bar (back link + title) — hidden on desktop. */}
        <div className="md:hidden bg-white h-14 px-4 flex items-center justify-center relative border-b border-[#E2E8F0]">
          <Link
            href="/dashboard/produits"
            className="absolute start-4 p-2 -ms-2 text-[#1C1917]"
            data-testid="merchant-product-form-back-link"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-semibold text-[#1C1917]">
            {isEdit ? t('editProduct') : t('newProduct')}
          </h1>
        </div>

        <div className="max-w-[1040px] mx-auto md:p-8">
          {/* Desktop breadcrumb — hidden on mobile. */}
          <div className="hidden md:block text-xs text-[#78716C] mb-6">
            <Link href="/dashboard/produits" className="hover:underline">
              {t('title')}
            </Link>
            {' > '}
            <span>{isEdit ? (product?.name_fr ?? t('editProduct')) : t('newProduct')}</span>
          </div>

          {/* Single publish button. Its wrapper handles positioning:
              mobile: `fixed bottom-0` sticky footer.
              desktop: `static` inline top-right. */}
          {publishRow}

          {/* Main content: single column on mobile, 2-column grid on desktop.
              `order-*` classes reposition cards between breakpoints:
              mobile: photo → info → price → visibility → danger
              desktop left col: info
              desktop right col: price → photo → visibility → danger */}
          <div className="p-4 md:p-0 md:grid md:grid-cols-[1fr_320px] md:gap-6 md:items-start space-y-3 md:space-y-0">
            {/* Photo — mobile first, desktop second in right column. */}
            <div className="order-1 md:order-3 md:col-start-2">
              {photoCard}
            </div>

            {/* Info form — mobile second, desktop first (left column). */}
            <div className="order-2 md:order-1 md:col-start-1 md:row-start-1 md:row-span-4">
              {infoForm}
            </div>

            {/* Price calculator — mobile third, desktop second in right column. */}
            <div className="order-3 md:order-2 md:col-start-2 md:row-start-1">
              {priceCalculator}
            </div>

            {/* Visibility card — mobile fourth, desktop fourth in right column. */}
            <div className="order-4 md:order-4 md:col-start-2">
              {visibilityCard}
            </div>

            {/* Danger zone (edit only) — mobile fifth, desktop last in right column. */}
            {dangerCard && (
              <div className="order-5 md:order-5 md:col-start-2">
                {dangerCard}
              </div>
            )}
          </div>
        </div>
      </div>
      {deleteModal}
    </>
  );
}
