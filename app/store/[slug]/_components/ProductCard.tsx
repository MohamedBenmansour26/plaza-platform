'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

import type { Product } from '@/types/supabase';
import { useCart } from './CartProvider';

interface ProductCardProps {
  product: Product;
  slug: string;
}

function getStockDisplay(stock: number) {
  if (stock > 5) return null;
  if (stock >= 1) {
    return (
      <p className="text-[12px] font-medium mb-1" style={{ color: '#D97706' }}>
        Plus que {stock} en stock
      </p>
    );
  }
  // stock === 0
  return (
    <p className="text-[12px] font-medium mb-1" style={{ color: '#DC2626' }}>
      Rupture de stock
    </p>
  );
}

export function ProductCard({ product, slug }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const priceMAD = product.price / 100;
  const originalPriceMAD =
    product.original_price != null ? product.original_price / 100 : null;
  const outOfStock = product.stock === 0;
  const showDiscount =
    product.discount_active && product.original_price != null && !outOfStock;

  // Compute % discount for badge
  const discountPct =
    showDiscount && originalPriceMAD != null && originalPriceMAD > 0
      ? Math.round(((originalPriceMAD - priceMAD) / originalPriceMAD) * 100)
      : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      id: product.id,
      name: product.name_fr,
      price: priceMAD,
      image: product.image_url ?? '',
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 400);
  }

  const card = (
    <motion.div
      whileHover={!outOfStock ? { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' } : {}}
      className={`bg-white rounded-lg overflow-hidden border border-[#E2E8F0] flex flex-col transition-all duration-200 ${outOfStock ? 'pointer-events-none opacity-50' : 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]'}`}
      style={{ aspectRatio: '0.75' }}
    >
      <div className="relative w-full flex-1 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name_fr}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#F5F5F4] flex items-center justify-center">
            <span className="text-3xl text-[#D6D3D1]">🛍️</span>
          </div>
        )}
        {discountPct != null && (
          <div className="absolute top-2 left-2 bg-[#E8632A] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
            -{discountPct}%
          </div>
        )}
        {outOfStock && (
          <div className="absolute top-1.5 right-1.5 bg-[#DC2626] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
            Rupture
          </div>
        )}
      </div>

      <div className="p-3.5 flex flex-col justify-between">
        <h3 className="font-medium text-[14px] line-clamp-2 leading-tight mb-1">
          {product.name_fr}
        </h3>
        <div>{getStockDisplay(product.stock)}</div>
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="font-bold text-[15px]">{priceMAD} MAD</span>
          {originalPriceMAD != null && showDiscount && (
            <span className="text-[10px] text-[#A8A29E] line-through">
              {originalPriceMAD} MAD
            </span>
          )}
        </div>
        {/* 44px tap target */}
        <motion.button
          onClick={handleAddToCart}
          disabled={outOfStock}
          whileTap={{ scale: 0.95 }}
          animate={justAdded ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.15 }}
          className={`w-full h-11 rounded text-[13px] font-medium transition-colors ${
            outOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : ''
          }`}
          style={outOfStock ? {} : {
            backgroundColor: justAdded
              ? 'color-mix(in srgb, var(--color-primary) 75%, black)'
              : 'var(--color-primary)',
            color: 'white',
          }}
        >
          {justAdded ? '✓ Ajouté' : 'Ajouter'}
        </motion.button>
      </div>
    </motion.div>
  );

  if (outOfStock) {
    return card;
  }

  return (
    <Link href={`/store/${slug}/produit/${product.id}`} className="block">
      {card}
    </Link>
  );
}
