'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

import type { Product } from '@/types/supabase';
import { useCart } from './CartProvider';

interface ProductCardProps {
  product: Product;
  slug: string;
}

function getStockDisplay(stock: number) {
  if (stock === 0) return null;
  if (stock <= 5) {
    return (
      <div className="flex items-center gap-0.5 text-[10px] text-[#D97706] mb-1">
        <div className="w-1 h-1 rounded-full bg-[#D97706]" />
        <span>+{stock}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 text-[10px] text-[#16A34A] mb-1">
      <div className="w-1 h-1 rounded-full bg-[#16A34A]" />
      <span>Stock</span>
    </div>
  );
}

export function ProductCard({ product, slug }: ProductCardProps) {
  const { addItem } = useCart();

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
    e.preventDefault(); // prevent Link navigation
    if (outOfStock) return;
    addItem({
      id: product.id,
      name: product.name_fr,
      price: priceMAD,
      image: product.image_url ?? '',
    });
  }

  const card = (
    <motion.div
      whileHover={!outOfStock ? { y: -2 } : {}}
      className={`bg-white rounded-lg overflow-hidden border border-[#E2E8F0] flex flex-col ${outOfStock ? 'opacity-60' : ''}`}
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
          <div className="absolute top-1.5 right-1.5 bg-[#E8632A] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
            -{discountPct}%
          </div>
        )}
        {outOfStock && (
          <div className="absolute top-1.5 right-1.5 bg-[#DC2626] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
            Rupture
          </div>
        )}
      </div>

      <div className="p-2 flex flex-col justify-between">
        <h3 className="font-medium text-[12px] line-clamp-2 leading-tight mb-1">
          {product.name_fr}
        </h3>
        <div>{getStockDisplay(product.stock)}</div>
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="font-bold text-[13px]">{priceMAD} MAD</span>
          {originalPriceMAD != null && showDiscount && (
            <span className="text-[10px] text-[#A8A29E] line-through">
              {originalPriceMAD} MAD
            </span>
          )}
        </div>
        {/* 44px tap target */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`w-full h-11 rounded text-[11px] font-medium transition-colors ${
            outOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
          }`}
        >
          Ajouter
        </button>
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
