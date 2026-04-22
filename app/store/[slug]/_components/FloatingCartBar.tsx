'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useCart } from './CartProvider';

interface FloatingCartBarProps {
  /** Primary prop name (matches export) */
  onClick?: () => void;
  /** Legacy alias — used by StoreHomeClient */
  onOpenCart?: () => void;
  freeThreshold?: number;
}

export function FloatingCartBar({ onClick, onOpenCart }: FloatingCartBarProps) {
  const handleClick = onClick ?? onOpenCart ?? (() => {});
  const { items, total } = useCart();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);


  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-14 left-4 right-4 lg:hidden z-30"
        >
          <button
            onClick={handleClick}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 flex items-center justify-between shadow-lg"
            data-testid="customer-floating-cart-btn"
          >
            <div className="flex items-center gap-3 text-[#1C1917]">
              <span className="text-sm">
                Voir le panier ·{' '}
                <span className="font-semibold">
                  {totalItems} article{totalItems > 1 ? 's' : ''}
                </span>{' '}
                {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
                · <span className="font-semibold">{total.toFixed(0)} MAD</span>
              </span>
            </div>
            <div
              className="text-white px-4 py-2 rounded-lg flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span className="font-semibold text-sm">Commander</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
