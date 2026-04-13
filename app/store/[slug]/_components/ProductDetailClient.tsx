'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

import type { Merchant, Product } from '@/types/supabase';
import { useCart } from './CartProvider';
import { CartDrawer } from './CartDrawer';
import { BottomTabBar } from './BottomTabBar';

interface ProductDetailClientProps {
  product: Product;
  merchant: Merchant;
  slug: string;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#D97706]" />
        <span className="text-sm text-[#D97706] font-semibold">Rupture de stock</span>
      </div>
    );
  }
  if (stock < 5) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
        <span className="text-sm text-[#16A34A] font-semibold">
          Plus que {stock} en stock
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
      <span className="text-sm text-[#16A34A] font-semibold">En stock</span>
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
  const [_infoOpen, setInfoOpen] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener('plaza:open-cart', handler);
    return () => window.removeEventListener('plaza:open-cart', handler);
  }, []);

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

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const atStockLimit = product.stock !== null && quantity >= product.stock;

  // Breadcrumb parts
  const breadcrumbParts = [product.category_l1, product.category_l2, product.category_l3].filter(
    (p): p is string => p != null,
  );

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(
      {
        id: product.id,
        name: product.name_fr,
        price: priceMAD,
        image: product.image_url ?? '',
        stock: product.stock,
      },
      quantity,
    );
  }

  function handleBuyNow() {
    if (outOfStock) return;
    setBuyingNow(true);
    // Build a direct single-item cart and write to sessionStorage
    // so commande/page.tsx reads it immediately without localStorage race
    const directCart = [{
      id: product.id,
      name: product.name_fr,
      price: priceMAD,          // MAD (already divided by 100)
      quantity: quantity,
      image: product.image_url ?? '',
    }];
    sessionStorage.setItem('cartItems', JSON.stringify(directCart));
    sessionStorage.setItem('cartSlug', slug);
    sessionStorage.setItem('subtotal', String(priceMAD * quantity));
    router.push(`/store/${slug}/commande`);
    // Note: no setBuyingNow(false) needed — navigation unmounts the component
  }

  const productImage = product.image_url ?? '';

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-32 lg:pb-0">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] h-14 flex items-center justify-between px-4 lg:hidden"
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-base font-bold text-[#1C1917] flex-1 text-center">
          {merchant.store_name}
        </h1>
        <button
          onClick={() => setCartOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 relative"
        >
          <ShoppingCart className="w-5 h-5 text-[#78716C]" />
          {cartCount > 0 && (
            <div
              className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {cartCount}
            </div>
          )}
        </button>
      </motion.header>

      {/* Mobile: Full-width Image */}
      <div className="relative w-full aspect-square overflow-hidden lg:hidden">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name_fr}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#F5F5F4] flex items-center justify-center">
            <span className="text-6xl text-[#D6D3D1]">🛍️</span>
          </div>
        )}
      </div>

      {/* Desktop: 2-col layout */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:max-w-[1280px] lg:mx-auto lg:px-6 lg:py-12">
        {/* Left: Sticky image panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-20 h-fit"
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            {productImage ? (
              <img
                src={productImage}
                alt={product.name_fr}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#F5F5F4] flex items-center justify-center">
                <span className="text-6xl text-[#D6D3D1]">🛍️</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Product info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Breadcrumb */}
          {breadcrumbParts.length > 0 && (
            <p className="text-xs text-[#A8A29E]">
              {breadcrumbParts.join(' › ')}
            </p>
          )}

          {/* Product Name */}
          <h1 className="text-4xl font-bold text-[#1C1917]">{product.name_fr}</h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {priceMAD} MAD
            </span>
            {showDiscount && originalPriceMAD != null && (
              <>
                <span className="text-xl text-[#A8A29E] line-through">
                  {originalPriceMAD} MAD
                </span>
                {discountPct != null && (
                  <span className="bg-[#E8632A] text-white px-2.5 py-1 rounded text-sm font-bold">
                    -{discountPct}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock */}
          <StockBadge stock={product.stock} />

          {/* Description */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="font-semibold text-[#1C1917] mb-2">Description</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">
              {product.description || 'Produit de qualité premium avec finitions soignées.'}
            </p>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-semibold text-[#1C1917] mb-2">
              Quantité
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-[#E2E8F0] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-5 h-5 text-[#78716C]" />
                </button>
                <span className="w-12 text-center text-lg font-bold text-[#1C1917]">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    if (product.stock !== null && quantity >= product.stock) return;
                    setQuantity(quantity + 1);
                  }}
                  disabled={atStockLimit}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 text-[#78716C]" />
                </button>
              </div>
            </div>
            {atStockLimit && (
              <p className="text-xs text-amber-600 mt-1">Plus que {product.stock} en stock</p>
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex-1 py-3.5 rounded-lg font-semibold transition-colors border-2 ${
                outOfStock
                  ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-50'
              }`}
              style={
                !outOfStock
                  ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                  : {}
              }
            >
              Ajouter au panier
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock || buyingNow}
              className={`flex-1 py-3.5 rounded-lg font-bold text-white transition-colors disabled:opacity-70 disabled:cursor-wait ${
                outOfStock ? 'bg-gray-300 cursor-not-allowed' : ''
              }`}
              style={!outOfStock && !buyingNow ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {buyingNow ? (
                <span className="flex items-center justify-center gap-1.5">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </span>
              ) : (
                'Acheter maintenant'
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <Truck className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-[#16A34A]">Livraison</p>
                <p className="text-xs text-[#16A34A]/80">À votre convenance</p>
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex items-start gap-2">
              <Shield className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-[#16A34A]">Paiement sécurisé</p>
                <p className="text-xs text-[#16A34A]/80">100% protégé</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile: Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 space-y-4 lg:hidden"
      >
        {/* Breadcrumb */}
        {breadcrumbParts.length > 0 && (
          <p className="text-xs text-[#A8A29E]">
            {breadcrumbParts.join(' › ')}
          </p>
        )}

        {/* Product Name */}
        <h1 className="text-3xl font-bold text-[#1C1917]">{product.name_fr}</h1>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {priceMAD} MAD
          </span>
          {showDiscount && originalPriceMAD != null && (
            <>
              <span className="text-lg text-[#A8A29E] line-through">
                {originalPriceMAD} MAD
              </span>
              {discountPct != null && (
                <span className="bg-[#E8632A] text-white px-2 py-1 rounded text-sm font-bold">
                  -{discountPct}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Stock */}
        <StockBadge stock={product.stock} />

        {/* Description */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-[#1C1917] mb-2">Description</h3>
          <p className="text-sm text-[#78716C] leading-relaxed">
            {product.description || 'Produit de qualité premium avec finitions soignées.'}
          </p>
        </div>

        {/* Quantity Selector */}
        <div>
          <label className="block text-sm font-semibold text-[#1C1917] mb-2">
            Quantité
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-[#E2E8F0] rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-5 h-5 text-[#78716C]" />
              </button>
              <span className="w-12 text-center text-lg font-bold text-[#1C1917]">
                {quantity}
              </span>
              <button
                onClick={() => {
                  if (product.stock !== null && quantity >= product.stock) return;
                  setQuantity(quantity + 1);
                }}
                disabled={atStockLimit}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 text-[#78716C]" />
              </button>
            </div>
          </div>
          {atStockLimit && (
            <p className="text-xs text-amber-600 mt-1">Plus que {product.stock} en stock</p>
          )}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
            <Truck className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-[#16A34A]">Livraison</p>
              <p className="text-xs text-[#16A34A]/80">À votre convenance</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <Shield className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-[#2563EB]">Paiement sécurisé</p>
              <p className="text-xs text-[#2563EB]/80">100% protégé</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 lg:hidden z-20">
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`flex-1 h-12 rounded-lg font-medium transition-colors border-2 ${
              outOfStock
                ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white active:scale-[0.97]'
            }`}
            style={
              !outOfStock
                ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                : {}
            }
          >
            Ajouter au panier
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock || buyingNow}
            className={`flex-1 h-12 rounded-lg font-semibold text-white transition-colors disabled:opacity-70 disabled:cursor-wait ${
              outOfStock ? 'bg-gray-300 cursor-not-allowed' : buyingNow ? '' : 'active:scale-[0.97]'
            }`}
            style={!outOfStock && !buyingNow ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {buyingNow ? (
              <span className="flex items-center justify-center gap-1.5">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Chargement...
              </span>
            ) : (
              'Acheter maintenant'
            )}
          </button>
        </div>
      </div>

      <BottomTabBar
        slug={slug}
        onInfoClick={() => setInfoOpen(false)}
        onCartClick={() => setCartOpen(true)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        slug={slug}
      />
    </div>
  );
}
