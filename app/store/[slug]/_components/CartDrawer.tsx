'use client';

import { Drawer } from 'vaul';
import { X, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useCart } from './CartProvider';
import { getDeliveryFee } from '../_lib/deliveryUtils';
import { useIsDesktop } from '../_hooks/useIsDesktop';
import type { CartItem } from './CartProvider';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  freeThreshold?: number;
}

interface CartContentProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  subtotal: number;
  deliveryFee: number;
  finalTotal: number;
  onClose: () => void;
  onCheckout: () => void;
}

function CartContent({
  items,
  updateQuantity,
  removeItem,
  subtotal,
  deliveryFee,
  finalTotal,
  onClose,
  onCheckout,
}: CartContentProps) {
  return (
    <>
      {/* Drag handle — mobile only */}
      <div className="lg:hidden mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-4" />

      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#1C1917]">Mon panier</h2>
          <p className="text-sm text-[#78716C]">
            {items.reduce((s, i) => s + i.quantity, 0)} article
            {items.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-[#78716C]" />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
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
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[#F5F5F4] flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[#1C1917] line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-3.5 h-3.5 text-[#78716C]" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#1C1917]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#78716C]" />
                      </button>
                    </div>
                    <span className="font-bold text-sm text-[#1C1917]">
                      {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
                      {(item.price * item.quantity).toFixed(0)} MAD
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#DC2626] hover:bg-red-50 p-1.5 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer — summary + CTA */}
      {items.length > 0 && (
        <div
          className="p-4 border-t border-[#E2E8F0] space-y-3 flex-shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Sous-total</span>
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
            <span className="font-semibold text-[#1C1917]">{subtotal.toFixed(0)} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Livraison</span>
              <span
                className={`font-semibold ${deliveryFee === 0 ? 'text-[#16A34A]' : 'text-[#1C1917]'}`}
              >
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} MAD`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#1C1917]">Total</span>
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
              <span className="font-bold text-xl text-[#1C1917]">{finalTotal.toFixed(0)} MAD</span>
            </div>
          </div>

          {deliveryFee === 0 && (
            <div className="bg-[#16A34A]/10 text-[#16A34A] px-3 py-2 rounded-lg text-sm font-semibold text-center">
              🎉 Livraison gratuite atteinte !
            </div>
          )}

          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full text-white font-semibold py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Passer la commande — {finalTotal.toFixed(0)} MAD
          </button>

          <button
            onClick={onClose}
            className="w-full text-sm font-semibold py-1"
            style={{ color: 'var(--color-primary)' }}
          >
            Continuer mes achats
          </button>
        </div>
      )}
    </>
  );
}

export function CartDrawer({ open, onClose, slug, freeThreshold }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, total } = useCart();
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const deliveryFee = getDeliveryFee(total, freeThreshold);
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
    finalTotal,
    onClose,
    onCheckout: handleCheckout,
  };

  return (
    <>
      {isDesktop ? (
        <>
          {/* Desktop: fixed right side panel */}
          <div
            className={`flex fixed inset-y-0 right-0 w-[420px] flex-col bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
              open ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <CartContent {...contentProps} />
          </div>
          {open && (
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onClose}
            />
          )}
        </>
      ) : (
        /* Mobile: vaul bottom sheet */
        <Drawer.Root open={open} onOpenChange={onClose}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 flex flex-col max-h-[90vh]">
              <Drawer.Title className="sr-only">Mon panier</Drawer.Title>
              <Drawer.Description className="sr-only">
                {items.length} articles
              </Drawer.Description>
              <CartContent {...contentProps} />
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </>
  );
}
