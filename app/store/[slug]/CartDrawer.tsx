'use client';

import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CartItem } from './StorefrontClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  locale: string;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
};

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  subtotal,
  locale,
  onRemove,
  onUpdateQuantity,
}: Props) {
  const t = useTranslations('store');

  const isEmpty = cart.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Drawer panel — slides in from the trailing edge (right in LTR, left in RTL) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('cart')}
        className={cn(
          'fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen
            ? 'translate-x-0'
            : 'ltr:translate-x-full rtl:-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-base font-semibold">{t('cart')}</h2>
          <button
            type="button"
            aria-label={t('closeCart')}
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">{t('cartEmpty')}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('cartEmptyDesc')}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map(({ product, quantity }) => {
                const name =
                  locale === 'ar' ? product.name_ar : product.name_fr;
                return (
                  <li
                    key={product.id}
                    className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    {/* Product name + price */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="line-clamp-2 text-sm font-medium leading-snug">
                        {name}
                      </span>
                      <span className="mt-1 text-sm font-bold text-plaza-primary-600">
                        {product.price * quantity} {t('currency')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.price} {t('currency')} × {quantity}
                      </span>
                    </div>

                    {/* Quantity controls + remove */}
                    <div className="flex shrink-0 flex-col items-center gap-2">
                      <div className="flex items-center rounded-md border">
                        <button
                          type="button"
                          aria-label={`-1 ${name}`}
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-accent"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`+1 ${name}`}
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-accent"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`${t('remove')} ${name}`}
                        onClick={() => onRemove(product.id)}
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — subtotal + CTA */}
        {!isEmpty && (
          <div className="border-t px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('subtotal')}</span>
              <span className="text-base font-bold">
                {subtotal} {t('currency')}
              </span>
            </div>
            <Button asChild className="w-full">
              <a href="/checkout">{t('placeOrder')}</a>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
