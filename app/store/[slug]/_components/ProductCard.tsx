'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

import type { Product } from '@/types/supabase';
import { useCart } from './CartProvider';

interface ProductCardProps {
  product: Product;
  slug: string;
}

export function ProductCard({ product, slug }: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  const priceMAD = product.price / 100;
  const originalPriceMAD =
    product.original_price != null ? product.original_price / 100 : null;
  const outOfStock = product.stock === 0;
  const showDiscount =
    product.discount_active && product.original_price != null && !outOfStock;

  const discountPct =
    showDiscount && originalPriceMAD != null && originalPriceMAD > 0
      ? Math.round(((originalPriceMAD - priceMAD) / originalPriceMAD) * 100)
      : null;

  const lowStock = product.stock > 0 && product.stock < 5;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      id: product.id,
      name: product.name_fr,
      price: priceMAD,
      image: product.image_url ?? '',
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      id: product.id,
      name: product.name_fr,
      price: priceMAD,
      image: product.image_url ?? '',
    });
    router.push(`/store/${slug}/commande`);
  }

  return (
    <Link href={`/store/${slug}/produit/${product.id}`}>
      <motion.div
        whileHover={!outOfStock ? { y: -4 } : {}}
        className={`w-full flex flex-col bg-white rounded-xl overflow-hidden transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] ${
          outOfStock ? 'opacity-60' : ''
        }`}
      >
        {/* Image container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden">
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

          {/* Discount badge top-left */}
          {discountPct != null && (
            <div className="absolute top-2 left-2 bg-[#E8632A] text-white text-[10px] font-bold px-2 py-1 rounded-full">
              -{discountPct}%
            </div>
          )}

          {/* Low stock badge bottom-left */}
          {lowStock && (
            <div className="absolute bottom-2 left-2 bg-[#FFFBEB] text-[#D97706] text-[10px] font-semibold px-2 py-1 rounded-full">
              Plus que {product.stock} en stock
            </div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Rupture de stock</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3">
          <p className="text-[10px] text-[#78716C] uppercase mb-1">
            {product.category_l1 ?? ''}
          </p>
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] text-[#1C1917] leading-tight">
            {product.name_fr}
          </h3>

          {/* Price row */}
          <div className="mt-auto flex items-center gap-2 mb-2">
            {originalPriceMAD != null && showDiscount && (
              <span className="text-[11px] text-[#A8A29E] line-through">
                {originalPriceMAD} MAD
              </span>
            )}
            <span className="text-[15px] font-semibold text-[#1C1917]">
              {priceMAD} MAD
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-2 flex gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex-1 h-8 text-xs font-medium rounded-lg transition-colors ${
                outOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-[#16A34A] text-white'
                  : 'text-white'
              }`}
              style={
                !outOfStock && !isAdded
                  ? { backgroundColor: 'var(--color-primary)' }
                  : {}
              }
            >
              {isAdded ? (
                <span className="flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" />
                  Ajouté
                </span>
              ) : (
                'Ajouter'
              )}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className={`flex-1 h-8 text-xs font-semibold rounded-lg transition-colors text-white ${
                outOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''
              }`}
              style={!outOfStock ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              Acheter
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
