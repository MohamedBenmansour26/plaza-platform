'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import type { Product } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  product: Product;
  locale: string;
  onAddToCart: (product: Product) => void;
};

function getStockLevel(stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 5) return 'low_stock';
  return 'in_stock';
}

export function ProductCard({ product, locale, onAddToCart }: Props) {
  const t = useTranslations('store');

  const name = locale === 'ar' ? product.name_ar : product.name_fr;
  const stockLevel = getStockLevel(product.stock);
  const isOutOfStock = stockLevel === 'out_of_stock';

  const stockLabelKey = {
    in_stock: 'inStock',
    low_stock: 'lowStock',
    out_of_stock: 'outOfStock',
  } as const;

  const stockColorClass = {
    in_stock: 'text-plaza-success-500',
    low_stock: 'text-plaza-warning-500',
    out_of_stock: 'text-plaza-error-500',
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Product image */}
      <div className="relative aspect-square w-full overflow-hidden bg-plaza-neutral-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl text-plaza-neutral-300">🛍️</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {name}
        </p>

        <div className="mt-2 flex items-center justify-between gap-1">
          <span className="text-base font-bold text-plaza-primary-600">
            {product.price} {t('currency')}
          </span>
          <span
            className={cn(
              'text-xs font-medium',
              stockColorClass[stockLevel],
            )}
          >
            {t(stockLabelKey[stockLevel])}
          </span>
        </div>

        <Button
          size="sm"
          className="mt-3 w-full"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
          aria-label={`${t('addToCart')} — ${name}`}
        >
          {t('addToCart')}
        </Button>
      </div>
    </article>
  );
}
