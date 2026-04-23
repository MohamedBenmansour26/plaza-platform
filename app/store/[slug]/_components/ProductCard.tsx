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
  const { addItem, items } = useCart();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

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

  const lowStock = product.stock !== null && product.stock > 0 && product.stock <= 5;

  const cartItem = items.find((i) => i.id === product.id);
  const atMaxStock =
    product.stock != null && cartItem != null && cartItem.quantity >= product.stock;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const result = addItem({
      id: product.id,
      name: product.name_fr,
      price: priceMAD,
      image: product.image_url ?? '',
      stock: product.stock ?? null,
    });
    if (result.blocked) return;
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    setBuyingNow(true);
    // Build a direct single-item cart and write to sessionStorage
    // so commande/page.tsx reads it immediately without localStorage race
    const directCart = [{ id: product.id, name: product.name_fr, price: priceMAD, quantity: 1, image: product.image_url ?? '', stock: product.stock ?? null }];
    sessionStorage.setItem('cartItems', JSON.stringify(directCart));
    sessionStorage.setItem('cartSlug', slug);
    sessionStorage.setItem('subtotal', String(priceMAD));
    router.push(`/store/${slug}/commande`);
    // Note: no setBuyingNow(false) needed — navigation unmounts the component
  }

  return (
    <Link href={`/store/${slug}/produit/${product.id}`} className="flex flex-col h-full" data-testid="customer-store-product-card" data-id={product.id}>
      <motion.div
        whileHover={!outOfStock ? { y: -4 } : {}}
        className={`w-full flex flex-col h-full bg-white rounded-xl overflow-hidden transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] ${
          outOfStock ? 'opacity-60' : ''
        }`}
      >
        {/* Image container */}
        <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name_fr}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#F5F5F4] flex items-center justify-center">
              <span className="text-3xl text-[#D6D3D1]">🛍️</span>
            </div>
          )}

          {/* Discount badge top-left */}
          {discountPct != null && (
            <div
              className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-orange-accent, #FF6B1A)' }}
            >
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
          <h3 className="text-sm font-medium line-clamp-2 h-10 overflow-hidden text-[#1C1917] leading-tight">
            {product.name_fr}
          </h3>

          {/* Price row */}
          <div className="mt-2 flex items-center gap-2 mb-2">
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
          <div className="mt-auto pt-2 flex gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || atMaxStock}
              className={`flex-1 h-8 text-xs font-medium rounded-lg transition-all ${
                outOfStock || atMaxStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-[#16A34A] text-white active:scale-[0.97]'
                  : 'text-white hover:brightness-[0.92] active:scale-[0.97]'
              }`}
              style={
                !outOfStock && !atMaxStock && !isAdded
                  ? { backgroundColor: 'var(--color-primary)' }
                  : {}
              }
              data-testid="customer-product-card-add-to-cart-btn"
            >
              {outOfStock ? (
                'Rupture de stock'
              ) : atMaxStock ? (
                'Maximum atteint'
              ) : isAdded ? (
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
              disabled={outOfStock || buyingNow}
              className={`flex-1 h-8 text-xs font-semibold rounded-lg transition-all text-white disabled:opacity-70 disabled:cursor-wait ${
                outOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : buyingNow
                  ? ''
                  : 'hover:brightness-[0.92] active:scale-[0.97]'
              }`}
              style={!outOfStock && !buyingNow ? { backgroundColor: 'var(--color-primary)' } : {}}
              data-testid="customer-product-card-buy-now-btn"
            >
              {buyingNow ? (
                <span className="flex items-center justify-center gap-1.5">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </span>
              ) : (
                'Acheter'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
