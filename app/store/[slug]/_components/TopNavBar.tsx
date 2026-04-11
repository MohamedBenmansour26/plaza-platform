'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, X } from 'lucide-react';

import type { Merchant } from '@/types/supabase';
import { useCart } from './CartProvider';

interface TopNavBarProps {
  merchant: Merchant;
  slug: string;
  onInfoClick: () => void;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function TopNavBar({
  merchant,
  slug,
  onInfoClick,
  onCartClick,
  searchQuery,
  onSearchChange,
}: TopNavBarProps) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const initials = merchant.store_name.slice(0, 2).toUpperCase();

  const navLinks = [
    { name: 'Accueil', path: `/store/${slug}`, onClick: undefined as (() => void) | undefined },
    { name: 'Suivre ma commande', path: '/track', onClick: undefined as (() => void) | undefined },
    { name: 'Infos', path: '#', onClick: onInfoClick },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm h-16">
        <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold text-base"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {initials}
            </div>
            <h1 className="text-lg font-semibold text-[#1C1917]">{merchant.store_name}</h1>

            <div className="w-px h-6 bg-[#E2E8F0] mx-2" />

            <nav className="flex gap-6">
              {navLinks.map((link) => {
                const isActive = link.path !== '#' && pathname === link.path;
                if (link.onClick) {
                  return (
                    <button
                      key={link.name}
                      onClick={link.onClick}
                      className={`text-sm font-medium relative pb-1 ${
                        isActive
                          ? ''
                          : 'text-[#78716C] hover:text-[#1C1917]'
                      }`}
                      style={isActive ? { color: 'var(--color-primary)' } : {}}
                    >
                      {link.name}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        />
                      )}
                    </button>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`text-sm font-medium relative pb-1 ${
                      isActive
                        ? ''
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                    style={isActive ? { color: 'var(--color-primary)' } : {}}
                  >
                    {link.name}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-sm mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-9 bg-[#F5F5F4] rounded-full pl-10 pr-10 text-sm placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-[#78716C]" />
                </button>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCartClick}
              className="relative hover:opacity-70 transition-opacity"
            >
              <ShoppingBag className="w-[22px] h-[22px] text-[#1C1917]" />
              {cartCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full text-white text-[10px] font-semibold flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {cartCount}
                </div>
              )}
            </button>
            <button
              onClick={onCartClick}
              className="hidden xl:block text-sm text-[#78716C] hover:text-[#1C1917]"
            >
              Mon panier
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation — logo + store name only (cart lives in BottomTabBar) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-14">
        <div className="h-full px-4 flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {initials}
            </div>
            <h1 className="text-base font-semibold text-[#1C1917]">{merchant.store_name}</h1>
          </div>
        </div>
      </header>
    </>
  );
}
