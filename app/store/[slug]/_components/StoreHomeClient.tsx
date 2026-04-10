'use client';

import { useState } from 'react';
import { Info, Package } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import type { Merchant, Product } from '@/types/supabase';
import { Header } from './Header';
import { ProductCard } from './ProductCard';
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

  const filtered =
    selectedCategory === 'Tous'
      ? products
      : products.filter((p) => p.category_l1 === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header
        merchant={merchant}
        onInfoClick={() => setInfoOpen(true)}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Banner */}
      {merchant.banner_url != null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[200px] w-full overflow-hidden"
        >
          <img
            src={merchant.banner_url}
            alt={`${merchant.store_name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-bold text-[24px]">{merchant.store_name}</h1>
              {merchant.category && (
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-[12px]">
                  {merchant.category}
                </span>
              )}
            </div>
            <button
              onClick={() => setInfoOpen(true)}
              className="flex items-center gap-1 text-[13px] text-white/90 hover:text-white"
            >
              <Info className="w-4 h-4" />
              Voir les infos
            </button>
          </div>
        </motion.div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Track order link */}
        <Link
          href={`/store/${slug}/suivi`}
          className="flex items-center gap-3 p-3 bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl hover:bg-[#DBEAFE] transition-colors"
        >
          <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-[15px] text-[#1C1917]">
              Suivre ma commande
            </div>
            <div className="text-[13px] text-[#78716C]">
              Entrez votre numéro de suivi
            </div>
          </div>
        </Link>

        {/* Category filters */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 h-9 rounded-full text-[14px] font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white text-[#1C1917] border border-[#E2E8F0]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            {filtered.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <ProductCard product={product} slug={slug} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        slug={slug}
      />
      <StoreInfoSheet
        merchant={merchant}
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}
