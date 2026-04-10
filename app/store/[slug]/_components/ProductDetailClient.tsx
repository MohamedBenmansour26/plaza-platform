'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

import type { Merchant, Product } from '@/types/supabase';
import { useCart } from './CartProvider';
import { CartDrawer } from './CartDrawer';

interface ProductDetailClientProps {
  product: Product;
  merchant: Merchant;
  slug: string;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="px-3 py-1 bg-[#DC2626] text-white rounded-lg text-[13px] font-medium">
        Rupture de stock
      </span>
    );
  }
  if (stock < 5) {
    return (
      <div className="flex items-center gap-2 text-[14px]">
        <div className="w-2 h-2 rounded-full bg-[#D97706]" />
        <span className="text-[#D97706] font-medium">
          Plus que {stock} en stock
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-[14px]">
      <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
      <span className="text-[#16A34A] font-medium">En stock</span>
    </div>
  );
}

function Breadcrumb({
  l1,
  l2,
  l3,
}: {
  l1: string | null;
  l2: string | null;
  l3: string | null;
}) {
  const parts = [l1, l2, l3].filter((p): p is string => p != null);
  if (parts.length === 0) return null;
  return (
    <div className="text-[13px] text-[#A8A29E] mb-2">
      {parts.join(' › ')}
    </div>
  );
}

export function ProductDetailClient({
  product,
  merchant,
  slug,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { items, addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [showMaxMsg, setShowMaxMsg] = useState(false);

  const priceMAD = product.price / 100;
  const originalPriceMAD =
    product.original_price != null ? product.original_price / 100 : null;
  const outOfStock = product.stock === 0;
  const showDiscount =
    product.discount_active &&
    product.original_price != null &&
    !outOfStock;

  const discountPct =
    showDiscount && originalPriceMAD != null && originalPriceMAD > 0
      ? Math.round(((originalPriceMAD - priceMAD) / originalPriceMAD) * 100)
      : null;

  const maxQuantity = product.stock > 0 ? Math.min(product.stock, 10) : 10;

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleAddToCart() {
    if (outOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name_fr,
        price: priceMAD,
        image: product.image_url ?? '',
      });
    }
    setCartOpen(true);
  }

  function handleIncrease() {
    if (quantity >= maxQuantity) {
      setShowMaxMsg(true);
      setTimeout(() => setShowMaxMsg(false), 2000);
      return;
    }
    setQuantity(quantity + 1);
    setShowMaxMsg(false);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Inline header for product detail */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex flex-col min-w-0 px-2">
          <span className="font-bold text-[15px] truncate">
            {merchant.store_name}
          </span>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative w-10 h-10 flex items-center justify-center"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-6"
      >
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product image */}
          <div>
            <div className="relative bg-white rounded-2xl overflow-hidden aspect-square">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name_fr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F5F5F4] flex items-center justify-center">
                  <span className="text-6xl text-[#D6D3D1]">🛍️</span>
                </div>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <Breadcrumb
                l1={product.category_l1}
                l2={product.category_l2}
                l3={product.category_l3}
              />
              <h1 className="font-bold text-[28px] mb-3 leading-tight">
                {product.name_fr}
              </h1>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-bold text-[32px] text-[#2563EB]">
                  {priceMAD} MAD
                </span>
                {showDiscount && originalPriceMAD != null && (
                  <>
                    <span className="text-[18px] text-[#A8A29E] line-through">
                      {originalPriceMAD} MAD
                    </span>
                    {discountPct != null && (
                      <span className="px-2.5 py-1 bg-[#E8632A] text-white rounded-lg text-[14px] font-medium">
                        -{discountPct}%
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <StockBadge stock={product.stock} />
              </div>
            </div>

            {/* Description */}
            {product.description != null && (
              <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                <p className="text-[15px] text-[#78716C] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity selector */}
            {!outOfStock && (
              <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                <h3 className="font-bold text-[16px] mb-4">Quantité</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-[20px] font-bold w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="w-12 h-12 flex items-center justify-center border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {showMaxMsg && (
                  <p className="text-[13px] text-[#D97706] mt-2">
                    Quantité maximale disponible atteinte ({maxQuantity}{' '}
                    unités).
                  </p>
                )}
              </div>
            )}

            {/* Add to cart */}
            <div className="space-y-3">
              <motion.button
                onClick={handleAddToCart}
                whileTap={outOfStock ? undefined : { scale: 0.98 }}
                disabled={outOfStock}
                className={`w-full h-14 bg-[#2563EB] text-white rounded-lg font-medium text-[16px] transition-colors ${
                  outOfStock
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#1d4ed8]'
                }`}
              >
                {outOfStock
                  ? 'Rupture de stock'
                  : `Ajouter au panier — ${priceMAD * quantity} MAD`}
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <Truck className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <div className="text-[13px] font-medium">
                    Livraison à votre convenance
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#EFF6FF] rounded-lg">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <div className="text-[13px] font-medium">
                    Paiement sécurisé
                  </div>
                  <div className="text-[12px] text-[#78716C]">
                    100% protégé
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        slug={slug}
      />
    </div>
  );
}
