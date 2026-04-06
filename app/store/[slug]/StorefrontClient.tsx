'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';

import type { Merchant, Product } from '@/types/supabase';
import { ProductCard } from './ProductCard';
import { CartDrawer } from './CartDrawer';

export type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  merchant: Merchant;
  products: Product[];
  locale: string;
};

export function StorefrontClient({ merchant, products, locale }: Props) {
  const t = useTranslations('store');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  function addToCart(product: Product): void {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function removeFromCart(productId: string): void {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function updateQuantity(productId: string, delta: number): void {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.product.id !== productId) return [i];
        const newQty = i.quantity + delta;
        return newQty <= 0 ? [] : [{ ...i, quantity: newQty }];
      }),
    );
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Store header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-lg font-bold text-foreground">
              {merchant.store_name}
            </h1>
            {merchant.description && (
              <p className="truncate text-sm text-muted-foreground">
                {merchant.description}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label={t('viewCart')}
            onClick={() => setIsCartOpen(true)}
            className="relative ms-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-plaza-accent-600 text-xs font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Product grid */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-base font-medium text-foreground">
              {t('noProducts')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('noProductsDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        subtotal={cartSubtotal}
        locale={locale}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </div>
  );
}
