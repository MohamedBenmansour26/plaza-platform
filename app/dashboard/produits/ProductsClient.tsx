'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Edit2, Trash2, Plus } from 'lucide-react';
import type { Product } from '@/types/supabase';
import { toggleProductVisibility, deleteProduct } from './actions';
import { getProductImages } from '@/lib/product-images';

type FilterStatus = 'tous' | 'en-stock' | 'rupture' | 'masques';

function formatPrice(centimes: number) {
  return `${(centimes / 100).toLocaleString('fr-MA')} MAD`;
}

type Props = { products: Product[] };

export function ProductsClient({ products: initialProducts }: Props) {
  const t = useTranslations('products');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('tous');
  // Optimistic visibility state: track overrides per product id
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

  const filters: { id: FilterStatus; label: string }[] = [
    { id: 'tous',     label: t('filterAll') },
    { id: 'en-stock', label: t('filterInStock') },
    { id: 'rupture',  label: t('filterOutOfStock') },
    { id: 'masques',  label: t('filterHidden') },
  ];

  // Merge optimistic overrides into products
  const products = initialProducts.map((p) =>
    visibilityMap[p.id] !== undefined ? { ...p, is_visible: visibilityMap[p.id] } : p,
  );

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name_fr.toLowerCase().includes(search.toLowerCase()) ||
      (p.name_ar?.includes(search) ?? false);
    if (filter === 'en-stock') return matchesSearch && p.stock > 0;
    if (filter === 'rupture')  return matchesSearch && p.stock === 0;
    if (filter === 'masques')  return matchesSearch && !p.is_visible;
    return matchesSearch;
  });

  function handleToggleVisibility(productId: string, currentVisible: boolean) {
    const newVisible = !currentVisible;
    // Optimistic update
    setVisibilityMap((prev) => ({ ...prev, [productId]: newVisible }));
    startTransition(async () => {
      try {
        await toggleProductVisibility(productId, newVisible);
      } catch {
        // Rollback on error
        setVisibilityMap((prev) => ({ ...prev, [productId]: currentVisible }));
      }
    });
  }

  function handleDeleteConfirm(productId: string) {
    startTransition(async () => {
      await deleteProduct(productId);
      setDeleteModal(null);
    });
  }

  return (
    <>
      {/* Search — brief §2.2 input with primary focus ring */}
      <div className="px-4 py-3 md:px-0 md:pt-0 md:pb-4">
        <div className="relative w-full md:w-[280px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 ps-10 pe-4 border border-border rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] bg-card"
            data-testid="merchant-products-search-input"
          />
        </div>
      </div>

      {/* Filter chips — brief §2.8 pill sizing */}
      <div className="px-4 pb-3 md:px-0 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 h-10 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground border border-border hover:bg-muted/40'
            }`}
            data-testid={`merchant-products-filter-${f.id}-btn`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mobile card list — brief §2.3 card */}
      <div className="px-4 space-y-2 md:hidden">
        {filtered.length === 0 ? (
          <EmptyState hasProducts={initialProducts.length > 0} />
        ) : (
          filtered.map((product) => {
            // PLZ-090c — cover image comes from images[0] (the reorderable
            // slot 1), falling back to image_url for pre-090a rows.
            const coverUrl = getProductImages(product)[0]?.url ?? null;
            return (
            <Link key={product.id} href={`/dashboard/produits/${product.id}`} data-testid="merchant-products-row" data-id={product.id}>
              <div className="bg-card rounded-xl p-3 shadow-card flex gap-3 hover:shadow-card-hover transition-shadow">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={product.name_fr}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted/60 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{product.name_fr}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.discount_active && product.original_price != null && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-destructive/10 text-destructive">
                          -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                  {product.stock === 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive mt-1">
                      {t('outOfStock')}
                    </span>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('inStock', { count: product.stock })}
                    </div>
                  )}
                </div>
              </div>
            </Link>
            );
          })
        )}
      </div>

      {/* Desktop table — brief §2.4 */}
      <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
        <div className="h-12 bg-muted/40 border-b border-border px-4 flex items-center">
          <div className="w-16 text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('colImage')}</div>
          <div className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('colName')}</div>
          <div className="w-[120px] text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('colPrice')}</div>
          <div className="w-[140px] text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('colStock')}</div>
          <div className="w-[120px] text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('colStatus')}</div>
          <div className="w-20 text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('colActions')}</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState hasProducts={initialProducts.length > 0} />
        ) : (
          filtered.map((product) => {
            // PLZ-090c — cover image comes from images[0] (the reorderable
            // slot 1), falling back to image_url for pre-090a rows.
            const coverUrl = getProductImages(product)[0]?.url ?? null;
            return (
            <div
              key={product.id}
              className="min-h-16 px-4 flex items-center border-b border-border hover:bg-muted/40 transition-colors last:border-b-0"
              data-testid="merchant-products-row"
              data-id={product.id}
            >
              <div className="w-16">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={product.name_fr}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted/60" />
                )}
              </div>
              <div className="flex-1 text-sm font-semibold text-foreground">{product.name_fr}</div>
              <div className="w-[120px]">
                <div className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</div>
                {product.discount_active && product.original_price != null && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <span className="px-1 py-0.5 rounded text-[10px] font-semibold bg-destructive/10 text-destructive">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="w-[140px]">
                {product.stock === 0 ? (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                    {t('outOfStock')}
                  </span>
                ) : (
                  <span className="text-[13px] text-muted-foreground">
                    {t('inStock', { count: product.stock })}
                  </span>
                )}
              </div>
              {/* M7 — Inline visibility toggle (mobile primary keeps var(--color-primary) per PLZ-088) */}
              <div className="w-[120px]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={product.is_visible}
                  aria-label={product.is_visible ? t('visible') : t('hidden')}
                  disabled={isPending}
                  onClick={() => handleToggleVisibility(product.id, product.is_visible)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-60 ${
                    product.is_visible ? 'bg-[var(--color-primary)]' : 'bg-border'
                  }`}
                  data-testid="merchant-products-visibility-toggle-checkbox"
                  data-id={product.id}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      product.is_visible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {/* M8 — Edit + Delete actions */}
              <div className="w-20 flex items-center gap-1">
                <Link
                  href={`/dashboard/produits/${product.id}`}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  title={t('editButton')}
                  data-testid="merchant-products-edit-link"
                  data-id={product.id}
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ id: product.id, name: product.name_fr })}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  title={t('formDelete')}
                  data-testid="merchant-products-delete-btn"
                  data-id={product.id}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Delete confirmation modal — brief §2.3 card + §2.1 destructive button */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" data-testid="merchant-products-delete-dialog">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('formDeleteTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('formDeleteBody')}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isPending}
                className="flex-1 h-10 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors disabled:opacity-50"
                data-testid="merchant-products-delete-cancel-btn"
              >
                {t('formDeleteCancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleteModal.id)}
                disabled={isPending}
                className="flex-1 h-10 bg-destructive text-destructive-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                data-testid="merchant-products-delete-confirm-btn"
              >
                {isPending ? '…' : t('formDeleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState({ hasProducts }: { hasProducts: boolean }) {
  const t = useTranslations('products');

  if (hasProducts) {
    return (
      <div className="py-16 text-center">
        <Search className="w-12 h-12 text-border mx-auto mb-4" />
        <h3 className="text-base font-semibold text-foreground mb-1">{t('emptySearchTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('emptySearchSub')}</p>
      </div>
    );
  }
  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)' }}>
        <Plus className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{t('emptyTitle')}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t('emptyCta')}</p>
      <Link
        href="/dashboard/produits/nouveau"
        className="inline-flex items-center gap-2 h-9 px-4 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        style={{ backgroundColor: 'var(--color-primary)' }}
        data-testid="merchant-products-empty-add-btn"
      >
        <Plus className="w-4 h-4" />
        {t('addButton')}
      </Link>
    </div>
  );
}
