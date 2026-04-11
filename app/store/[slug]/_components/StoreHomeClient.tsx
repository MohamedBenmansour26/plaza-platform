'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import type { Merchant, Product } from '@/types/supabase';
import { Header } from './Header';
import { ProductCard } from './ProductCard';
import { CartDrawer } from './CartDrawer';
import { StoreInfoSheet } from './StoreInfoSheet';
import { FloatingCartBar } from './FloatingCartBar';

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
          className="h-[240px] sm:h-[280px] w-full overflow-hidden relative"
        >
          <img
            src={merchant.banner_url}
            alt={`${merchant.store_name} banner`}
            className="w-full h-full object-cover"
          />
          {/* COD badge overlaid on banner */}
          <div className="absolute bottom-3 left-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[12px] font-medium backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', border: '1px solid rgba(255,255,255,0.30)' }}
            >
              💳 Paiement à la livraison
            </span>
          </div>
        </motion.div>
      )}

      {/* Store info section */}
      <div className="px-4 py-4 border-b border-[#F3F4F6]">
        <h1 className="text-[20px] font-bold text-[#1C1917]">{merchant.store_name}</h1>
        {merchant.description && (
          <p className="text-[14px] text-[#78716C] mt-1 line-clamp-2">{merchant.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[12px] font-medium rounded-full">Livraison 30 MAD</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0FDF4] text-[#16A34A] text-[12px] font-medium rounded-full">Gratuite dès 500 MAD</span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 text-white text-[12px] font-medium rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            💳 Paiement à la livraison
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Track order link */}
        <Link
          href="/track"
          className="flex items-center gap-3 p-3 bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl hover:bg-[#DBEAFE] transition-colors"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}>
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
                    ? 'text-white'
                    : 'bg-white text-[#1C1917] border border-[#E2E8F0]'
                }`}
                style={selectedCategory === category ? { backgroundColor: 'var(--color-primary)' } : {}}
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
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4"
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

      <FloatingCartBar onOpenCart={() => setCartOpen(true)} freeThreshold={merchant.delivery_free_threshold ?? undefined} />
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
