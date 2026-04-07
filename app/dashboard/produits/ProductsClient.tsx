'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Edit2, Eye, EyeOff, Plus } from 'lucide-react';
import type { Product } from '@/types/supabase';

type FilterStatus = 'tous' | 'en-stock' | 'rupture' | 'masques';

function formatPrice(centimes: number) {
  return `${(centimes / 100).toLocaleString('fr-MA')} MAD`;
}

type Props = { products: Product[] };

export function ProductsClient({ products }: Props) {
  const t = useTranslations('products');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('tous');

  const filters: { id: FilterStatus; label: string }[] = [
    { id: 'tous',     label: t('filterAll') },
    { id: 'en-stock', label: t('filterInStock') },
    { id: 'rupture',  label: t('filterOutOfStock') },
    { id: 'masques',  label: t('filterHidden') },
  ];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name_fr.toLowerCase().includes(search.toLowerCase()) ||
      (p.name_ar?.includes(search) ?? false);
    if (filter === 'en-stock') return matchesSearch && p.stock > 0;
    if (filter === 'rupture')  return matchesSearch && p.stock === 0;
    if (filter === 'masques')  return matchesSearch && !p.is_visible;
    return matchesSearch;
  });

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden bg-white h-14 px-4 flex items-center justify-between shadow-sm border-b border-[#E2E8F0]">
        <h1 className="text-[18px] font-semibold text-[#1C1917]">{t('title')}</h1>
        <Link
          href="/dashboard/produits/nouveau"
          className="h-9 px-4 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#1d4ed8] transition-colors flex items-center"
        >
          {t('add')}
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-3 md:px-0 md:pt-0 md:pb-4">
        <div className="relative w-full md:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-white"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-3 md:px-0 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 h-8 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
              filter === f.id
                ? 'bg-[#2563EB] text-white'
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
          <EmptyState hasProducts={products.length > 0} />
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
                  <div className="text-sm font-semibold text-[#1C1917] mt-1">
                    {formatPrice(product.price)}
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
                <div className="flex flex-col items-end justify-start pt-1">
                  {product.is_visible ? (
                    <Eye size={18} className="text-[#2563EB]" />
                  ) : (
                    <EyeOff size={18} className="text-[#78716C]" />
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
          <div className="w-[100px] text-[13px] font-medium text-[#78716C] uppercase">{t('colStatus')}</div>
          <div className="w-16 text-[13px] font-medium text-[#78716C] uppercase">{t('colActions')}</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState hasProducts={products.length > 0} />
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="h-16 px-4 flex items-center border-b border-[#F3F4F6] hover:bg-[#F8FAFC] transition-colors"
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
              <div className="w-[120px] text-sm font-semibold text-[#1C1917]">
                {formatPrice(product.price)}
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
              <div className="w-[100px]">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.is_visible
                      ? 'bg-[#F0FDF4] text-[#16A34A]'
                      : 'bg-[#F5F5F4] text-[#78716C]'
                  }`}
                >
                  {product.is_visible ? t('visible') : t('hidden')}
                </span>
              </div>
              <div className="w-16 flex items-center gap-1">
                <Link
                  href={`/dashboard/produits/${product.id}`}
                  className="p-1 text-[#78716C] hover:text-[#2563EB] transition-colors"
                  title={t('editButton')}
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
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
      <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-4">
        <Plus className="w-8 h-8 text-[#2563EB]" />
      </div>
      <h3 className="text-base font-semibold text-[#1C1917] mb-2">{t('emptyTitle')}</h3>
      <p className="text-sm text-[#78716C] mb-4">{t('emptyCta')}</p>
      <Link
        href="/dashboard/produits/nouveau"
        className="inline-flex items-center gap-2 h-9 px-4 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t('addButton')}
      </Link>
    </div>
  );
}
