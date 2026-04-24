'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { motion } from 'motion/react';

import type { Merchant, Product } from '@/types/supabase';
import { TopNavBar } from './TopNavBar';
import { ProductCard } from './ProductCard';
import { BottomTabBar } from './BottomTabBar';
import { FloatingCartBar } from './FloatingCartBar';
import { CartDrawer } from './CartDrawer';
import { StoreInfoSheet } from './StoreInfoSheet';

interface StoreHomeClientProps {
  merchant: Merchant;
  products: Product[];
  slug: string;
}

export function StoreHomeClient({
  merchant,
  products,
  slug,
}: StoreHomeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [cartOpen, setCartOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener('plaza:open-cart', handler);
    return () => window.removeEventListener('plaza:open-cart', handler);
  }, []);

  // Derive unique category_l1 values from products
  const categories = [
    'Tous',
    ...Array.from(
      new Set(
        products
          .map((p) => p.category_l1)
          .filter((c): c is string => c != null),
      ),
    ),
  ];

  // Filter by category AND search query
  const filtered = products
    .filter((p) =>
      selectedCategory === 'Tous' ? true : p.category_l1 === selectedCategory,
    )
    .filter((p) =>
      searchQuery
        ? p.name_fr.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    );

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20 lg:pb-0">
      {/* Navigation */}
      <TopNavBar
        merchant={merchant}
        slug={slug}
        onInfoClick={() => setInfoOpen(true)}
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Banner */}
      {merchant.banner_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative h-60 overflow-hidden"
        >
          <img
            src={merchant.banner_url}
            alt={`${merchant.store_name} banner`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Category chips */}
      {categories.length > 1 && (
        <div className="px-4 my-6 max-w-[1280px] mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'bg-white text-[#78716C] border border-[#E2E8F0] hover:border-[var(--color-primary)]'
                }`}
                style={
                  selectedCategory === category
                    ? { backgroundColor: 'var(--color-primary)' }
                    : {}
                }
                data-testid="customer-store-category-btn"
                data-category={category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <Package className="w-12 h-12 text-[#D6D3D1] mb-4" />
          <p className="font-medium text-[16px] text-[#1C1917]">
            Aucun produit disponible
          </p>
          <p className="text-[14px] text-[#78716C] mt-1">
            Revenez bientôt !
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-4 grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch max-w-[1280px] mx-auto pb-24 lg:pb-16 mb-8"
        >
          {filtered.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex flex-col"
            >
              <ProductCard product={product} slug={slug} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <BottomTabBar
        slug={slug}
        onInfoClick={() => setInfoOpen(true)}
        onCartClick={() => setCartOpen(true)}
      />

      <FloatingCartBar
        onOpenCart={() => setCartOpen(true)}
        freeThreshold={merchant.delivery_free_threshold ?? undefined}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        slug={slug}
        freeThreshold={merchant.delivery_free_threshold ?? undefined}
      />

      <StoreInfoSheet
        merchant={merchant}
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}
