'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Edit2, Trash2, Plus } from 'lucide-react';
import type { Product } from '@/types/supabase';
import { toggleProductVisibility, deleteProduct } from './actions';

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
      {/* Search */}
      <div className="px-4 py-3 md:px-0 md:pt-0 md:pb-4">
        <div className="relative w-full md:w-[280px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 ps-10 pe-4 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-3 md:px-0 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 h-10 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
              filter === f.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[#78716C] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mobile card list */}
      <div className="px-4 space-y-2 md:hidden">
        {filtered.length === 0 ? (
          <EmptyState hasProducts={initialProducts.length > 0} />
        ) : (
          filtered.map((product) => (
            <Link key={product.id} href={`/dashboard/produits/${product.id}`}>
              <div className="bg-white rounded-xl p-3 shadow-sm flex gap-3 hover:shadow-md transition-shadow">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name_fr}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-[#F5F5F4] flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1C1917]">{product.name_fr}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-sm font-semibold text-[#1C1917]">
                      {formatPrice(product.price)}
                    </span>
                    {product.discount_active && product.original_price != null && (
                      <>
                        <span className="text-xs text-[#A8A29E] line-through">
                          {formatPrice(product.original_price)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626]">
                          -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                  {product.stock === 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[#FEF2F2] text-[#DC2626] mt-1">
                      {t('outOfStock')}
                    </span>
                  ) : (
                    <div className="text-xs text-[#78716C] mt-1">
                      {t('inStock', { count: product.stock })}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 flex items-center">
          <div className="w-16 text-[13px] font-medium text-[#78716C] uppercase">{t('colImage')}</div>
          <div className="flex-1 text-[13px] font-medium text-[#78716C] uppercase">{t('colName')}</div>
          <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">{t('colPrice')}</div>
          <div className="w-[140px] text-[13px] font-medium text-[#78716C] uppercase">{t('colStock')}</div>
          <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">{t('colStatus')}</div>
          <div className="w-20 text-[13px] font-medium text-[#78716C] uppercase">{t('colActions')}</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState hasProducts={initialProducts.length > 0} />
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="min-h-16 px-4 flex items-center border-b border-[#F3F4F6] hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="w-16">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name_fr}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#F5F5F4]" />
                )}
              </div>
              <div className="flex-1 text-sm font-semibold text-[#1C1917]">{product.name_fr}</div>
              <div className="w-[120px]">
                <div className="text-sm font-semibold text-[#1C1917]">{formatPrice(product.price)}</div>
                {product.discount_active && product.original_price != null && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-[#A8A29E] line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <span className="px-1 py-0.5 rounded text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626]">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="w-[140px]">
                {product.stock === 0 ? (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[#FEF2F2] text-[#DC2626]">
                    {t('outOfStock')}
                  </span>
                ) : (
                  <span className="text-[13px] text-[#78716C]">
                    {t('inStock', { count: product.stock })}
                  </span>
                )}
              </div>
              {/* M7 — Inline visibility toggle */}
              <div className="w-[120px]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={product.is_visible}
                  aria-label={product.is_visible ? t('visible') : t('hidden')}
                  disabled={isPending}
                  onClick={() => handleToggleVisibility(product.id, product.is_visible)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-60 ${
                    product.is_visible ? 'bg-[var(--color-primary)]' : 'bg-[#E2E8F0]'
                  }`}
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
                  className="p-1 text-[#78716C] hover:text-[var(--color-primary)] transition-colors"
                  title={t('editButton')}
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ id: product.id, name: product.name_fr })}
                  className="p-1 text-[#78716C] hover:text-[#DC2626] transition-colors"
                  title={t('formDelete')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-[#1C1917] mb-2">{t('formDeleteTitle')}</h3>
            <p className="text-sm text-[#78716C] mb-6">
              {t('formDeleteBody')}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isPending}
                className="flex-1 h-10 border border-[#E2E8F0] text-[#1C1917] text-sm font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors disabled:opacity-50"
              >
                {t('formDeleteCancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleteModal.id)}
                disabled={isPending}
                className="flex-1 h-10 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
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
        <Search className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
        <h3 className="text-base font-semibold text-[#1C1917] mb-1">{t('emptySearchTitle')}</h3>
        <p className="text-sm text-[#78716C]">{t('emptySearchSub')}</p>
      </div>
    );
  }
  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)' }}>
        <Plus className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
      </div>
      <h3 className="text-base font-semibold text-[#1C1917] mb-2">{t('emptyTitle')}</h3>
      <p className="text-sm text-[#78716C] mb-4">{t('emptyCta')}</p>
      <Link
        href="/dashboard/produits/nouveau"
        className="inline-flex items-center gap-2 h-9 px-4 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <Plus className="w-4 h-4" />
        {t('addButton')}
      </Link>
    </div>
  );
}
