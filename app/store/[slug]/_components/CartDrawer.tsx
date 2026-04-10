'use client';

import { Drawer } from 'vaul';
import { X, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

import { useCart } from './CartProvider';
import { getDeliveryFee } from '../_lib/deliveryUtils';
import type { CartItem } from './CartProvider';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  slug: string;
}

interface CartContentProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onClose: () => void;
  onCheckout: () => void;
}

function CartContent({
  items,
  updateQuantity,
  removeItem,
  subtotal,
  deliveryFee,
  total,
  onClose,
  onCheckout,
}: CartContentProps) {
  return (
    <>
      <div className="flex-shrink-0">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3 md:hidden" />
        <div className="flex items-center justify-between px-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <p className="font-bold text-[18px]">Mon panier</p>
            <p className="text-[13px] text-[#78716C]">{items.length} articles</p>
          </div>
          {/* 44px tap target */}
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
            <div className="w-16 h-16 bg-[#F5F5F4] rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-[#A8A29E]" />
            </div>
            <p className="font-medium text-[16px] text-[#1C1917] mb-1">
              Votre panier est vide
            </p>
            <p className="text-[14px] text-[#78716C]">
              Ajoutez des produits pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-[#FAFAF9] rounded-lg p-3 border border-[#E2E8F0]"
              >
                <div className="flex gap-3 mb-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#F5F5F4] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-medium text-[14px] mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <span className="font-bold text-[16px] text-[#2563EB] mt-auto">
                      {item.price} MAD
                    </span>
                  </div>
                  {/* 44px tap target */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-11 h-11 flex items-center justify-center text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    {/* 44px tap target */}
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-11 h-11 flex items-center justify-center border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-[15px] font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    {/* 44px tap target */}
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-11 h-11 flex items-center justify-center border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] text-[#78716C]">Total</div>
                    <div className="font-bold text-[16px]">
                      {item.price * item.quantity} MAD
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex-shrink-0 border-t border-[#E2E8F0] p-4 space-y-3"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-[14px]">
            <span className="text-[#78716C]">Sous-total</span>
            <span className="font-medium">{subtotal} MAD</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[#78716C]">Livraison</span>
            <span
              className={
                deliveryFee === 0
                  ? 'text-[#16A34A] font-medium'
                  : 'font-medium'
              }
            >
              {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} MAD`}
            </span>
          </div>
          {deliveryFee === 0 && (
            <div className="flex items-center gap-1 text-[#16A34A] text-[13px]">
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Livraison gratuite atteinte !</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
            <span className="font-bold text-[20px]">Total</span>
            <span className="font-bold text-[20px]">{total} MAD</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className={`w-full h-14 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Passer la commande
        </button>
        <button
          onClick={onClose}
          className="w-full text-[14px] text-[#78716C] py-2"
        >
          Continuer mes achats
        </button>
      </div>
    </>
  );
}

export function CartDrawer({ open, onClose, slug }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, total } = useCart();
  const router = useRouter();

  const deliveryFee = getDeliveryFee(total);
  const finalTotal = total + deliveryFee;

  const handleCheckout = () => {
    onClose();
    router.push(`/store/${slug}/commande`);
  };

  const contentProps: CartContentProps = {
    items,
    updateQuantity,
    removeItem,
    subtotal: total,
    deliveryFee,
    total: finalTotal,
    onClose,
    onCheckout: handleCheckout,
  };

  return (
    <>
      {/* Desktop: right side panel */}
      <div
        className={`hidden md:flex fixed inset-y-0 right-0 w-[420px] flex-col bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <CartContent {...contentProps} />
      </div>
      {open && (
        <div
          className="hidden md:block fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile: vaul Drawer */}
      <div className="md:hidden">
        <Drawer.Root open={open} onOpenChange={onClose}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 flex flex-col max-h-[70vh]">
              <Drawer.Title className="sr-only">Mon panier</Drawer.Title>
              <Drawer.Description className="sr-only">
                {items.length} articles
              </Drawer.Description>
              <CartContent {...contentProps} />
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  );
}
