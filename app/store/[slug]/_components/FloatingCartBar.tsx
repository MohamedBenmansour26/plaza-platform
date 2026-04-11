'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCart } from './CartProvider';
import { getDeliveryFee } from '../_lib/deliveryUtils';

interface FloatingCartBarProps {
  onOpenCart: () => void;
  freeThreshold?: number;
}

export function FloatingCartBar({ onOpenCart, freeThreshold }: FloatingCartBarProps) {
  const { items, total } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = getDeliveryFee(total, freeThreshold);
  const grandTotal = total + deliveryFee;

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="lg:hidden fixed left-4 right-4 z-50"
          style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 8px)' }}
        >
          <button
            onClick={onOpenCart}
            className="w-full h-14 rounded-xl text-white font-medium flex items-center justify-between px-5 shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-[13px] font-bold">
              {cartCount}
            </div>
            <span className="text-[15px] font-semibold">Voir le panier</span>
            <span className="text-[15px] font-semibold">{grandTotal} MAD</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
