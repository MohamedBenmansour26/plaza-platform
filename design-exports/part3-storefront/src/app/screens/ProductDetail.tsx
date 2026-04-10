import { useState } from "react";
import { ArrowLeft, ShoppingCart, Minus, Plus, ChevronRight, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { useCart } from "../contexts/CartContext";
import CartDrawer from "../components/CartDrawer";

const productImages = [
  "https://images.unsplash.com/photo-1649109670360-32498fda05b2?w=800",
  "https://images.unsplash.com/photo-1649109667850-40d5d462578c?w=800",
  "https://images.unsplash.com/photo-1649109669258-84a962e88a32?w=800",
];

// Stock for this product (0 = out of stock)
const stock = 3;

export default function ProductDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { items, addItem } = useCart();
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  // FIX-05: out-of-stock derived from stock number
  const outOfStock = stock === 0;

  // FIX-20: max quantity cap and message
  const maxQuantity = stock > 0 ? Math.min(stock, 3) : 3;
  const [showMaxMsg, setShowMaxMsg] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = () => {
    if (outOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: "1",
        name: "Robe Caftan Brodée",
        price: 450,
        image: productImages[0],
      });
    }
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        <button onClick={() => setCartOpen(true)} className="relative w-10 h-10 flex items-center justify-center">
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
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden aspect-square">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={productImages[currentImage]}
                  alt="Product"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
            <div className="flex gap-3">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentImage === index ? "border-[#2563EB]" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <div className="text-[13px] text-[#A8A29E] mb-2">Mode › Robes › Caftans</div>
              <h1 className="font-bold text-[28px] mb-3 leading-tight">Robe Caftan Brodée</h1>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D97706] text-[#D97706]" />
                  ))}
                </div>
                <span className="text-[14px] text-[#78716C]">4.8 (124 avis)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-bold text-[32px] text-[#2563EB]">450 MAD</span>
                <span className="text-[18px] text-[#A8A29E] line-through">600 MAD</span>
                <span className="px-2.5 py-1 bg-[#E8632A] text-white rounded-lg text-[14px] font-medium">
                  -25%
                </span>
              </div>

              {/* FIX-05: stock indicator */}
              <div className="flex items-center gap-2 text-[14px]">
                {outOfStock ? (
                  <span className="px-3 py-1 bg-[#DC2626] text-white rounded-lg text-[13px] font-medium">
                    Rupture de stock
                  </span>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-[#16A34A] font-medium">En stock</span>
                    <span className="text-[#78716C]">• Plus que {stock} disponibles</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
              <p className="text-[15px] text-[#78716C] leading-relaxed">
                Magnifique caftan brodé à la main, tissu de qualité supérieure. Taille unique ajustable. Disponible en rouge bordeaux. Parfait pour les occasions spéciales et les célébrations traditionnelles.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
              <h3 className="font-bold text-[16px] mb-4">Quantité</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-[20px] font-bold w-16 text-center">{quantity}</span>
                {/* FIX-20: quantity cap with message */}
                <button
                  onClick={() => {
                    if (quantity >= maxQuantity) {
                      setShowMaxMsg(true);
                      setTimeout(() => setShowMaxMsg(false), 2000);
                      return;
                    }
                    setQuantity(quantity + 1);
                    setShowMaxMsg(false);
                  }}
                  className="w-12 h-12 flex items-center justify-center border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {/* FIX-20: max quantity message */}
              {showMaxMsg && (
                <p className="text-[13px] text-[#D97706] mt-2">
                  Quantité maximale disponible atteinte ({maxQuantity} unités).
                </p>
              )}
            </div>

            <div className="space-y-3">
              {/* FIX-05: disable add to cart when out of stock */}
              <motion.button
                onClick={handleAddToCart}
                whileTap={outOfStock ? undefined : { scale: 0.98 }}
                disabled={outOfStock}
                className={`w-full h-14 bg-[#2563EB] text-white rounded-lg font-medium text-[16px] transition-colors ${
                  outOfStock
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#1d4ed8]"
                }`}
              >
                Ajouter au panier — {450 * quantity} MAD
              </motion.button>
              {/* FIX-06: "Acheter maintenant" button removed */}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <Truck className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <div className="text-[13px] font-medium">Livraison rapide</div>
                  <div className="text-[12px] text-[#78716C]">2-3 jours</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#EFF6FF] rounded-lg">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <div className="text-[13px] font-medium">Paiement sécurisé</div>
                  <div className="text-[12px] text-[#78716C]">100% protégé</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
