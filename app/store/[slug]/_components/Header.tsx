'use client';

import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { Merchant } from '@/types/supabase';
import { useCart } from './CartProvider';

interface HeaderProps {
  merchant: Merchant;
  showBack?: boolean;
  showCart?: boolean;
  onInfoClick?: () => void;
  onCartClick?: () => void;
}

export function Header({
  merchant,
  showBack = false,
  showCart = true,
  onInfoClick,
  onCartClick,
}: HeaderProps) {
  const router = useRouter();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Logo initials fallback
  const initials = merchant.store_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <>
              {/* Logo */}
              <Link href={`/store/${merchant.store_slug}`} className="flex-shrink-0">
                {merchant.logo_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <img
                      src={merchant.logo_url}
                      alt={merchant.store_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[14px]"
                    style={{ backgroundColor: 'var(--color-primary)' }}>
                    {initials}
                  </div>
                )}
              </Link>

              {/* Store name + category */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-[18px] leading-tight max-w-[160px] truncate">
                    {merchant.store_name}
                  </span>
                  {merchant.category && (
                    <span className="px-2 py-0.5 bg-[#E2E8F0] rounded text-[11px] flex-shrink-0">
                      {merchant.category}
                    </span>
                  )}
                </div>
                {onInfoClick && (
                  <button
                    onClick={onInfoClick}
                    className="text-[12px] text-left hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Voir les infos
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {showCart && (
          <button
            onClick={onCartClick}
            className="relative w-10 h-10 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-medium"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
