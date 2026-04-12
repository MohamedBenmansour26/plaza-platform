'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, CheckCheck, Clock, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../_components/CartProvider';
import { getDeliveryFee } from '../_lib/deliveryUtils';
import type { CartItem } from '../_components/CartProvider';

interface ConfirmedOrder {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  deliveryDate?: string;
  deliverySlot?: string;      // "09:00-10:00"
  deliveryDisplayDate?: string;
  deliveryDisplaySlot?: string;
  paymentMethod?: string;
  orderNumber?: string;
  orderId?: string;
  merchantId?: string;
  deliveryFeeThreshold?: number | null;
  merchantSlug?: string;
  customerPin?: number;
}

export default function ConfirmationPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [order, setOrder] = useState<ConfirmedOrder>({});
  const [copied, setCopied] = useState(false);
  const [snapshotItems, setSnapshotItems] = useState<CartItem[]>([]);
  const [snapshotTotal, setSnapshotTotal] = useState(0);

  useEffect(() => {
    // Read cart directly from localStorage to avoid CSR hydration timing issues
    // (cart context items/total may still be [] / 0 at mount time)
    const stored = sessionStorage.getItem('plaza_pending_order');
    let parsedOrder: ConfirmedOrder = {};
    if (stored) {
      try {
        parsedOrder = JSON.parse(stored) as ConfirmedOrder;
        setOrder(parsedOrder);
      } catch {
        // ignore
      }
    }
    const cartKey = `plaza_cart_${slug}`;
    try {
      const rawCart = localStorage.getItem(cartKey);
      if (rawCart) {
        const cartItems = JSON.parse(rawCart) as CartItem[];
        // Price from deliveryUtils — do not recalculate
        const cartTotal = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        setSnapshotItems(cartItems);
        setSnapshotTotal(cartTotal);
      } else {
        // Fallback to context values if localStorage is already cleared
        setSnapshotItems([...items]);
        setSnapshotTotal(total);
      }
    } catch {
      setSnapshotItems([...items]);
      setSnapshotTotal(total);
    }
    clearCart();
    sessionStorage.removeItem('plaza_pending_order');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderNumber = order.orderNumber ?? 'PLZ-???';
  const deliveryFee = getDeliveryFee(snapshotTotal, order.deliveryFeeThreshold ?? undefined);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderNumber);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = orderNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch {
          // ignore
        }
        textArea.remove();
      }
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-4">
      <div className="max-w-md mx-auto py-8 space-y-6">

        {/* Success */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-bold text-[#1C1917] mb-2">
            Commande confirmée !
          </h1>
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 space-y-2 border-2"
          style={{ borderColor: 'var(--color-primary)' }}
        >
          <p className="text-sm text-[#78716C]">📋 Votre numéro de commande</p>
          <div className="flex items-center justify-between">
            <span
              className="text-3xl font-bold tracking-wide"
              style={{ color: 'var(--color-primary)' }}
            >
              {orderNumber}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {copied ? (
                <CheckCheck className="w-5 h-5 text-[#16A34A]" />
              ) : (
                <Copy className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl p-4 flex items-start gap-3"
        >
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-[#92400E] font-medium">
            Conservez ce numéro pour suivre votre commande
          </p>
        </motion.div>

        {/* PIN Code */}
        {order.customerPin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 space-y-3 border-2"
            style={{ borderColor: 'var(--color-primary)' }}
          >
            <p className="text-sm text-[#78716C]">Votre code de réception</p>
            <div className="flex gap-2 justify-center">
              {String(order.customerPin).padStart(4, '0').split('').map((digit, i) => (
                <div
                  key={i}
                  className="w-12 h-14 bg-white rounded-lg flex items-center justify-center text-3xl font-bold border-2"
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#78716C] text-center">
              Communiquez ce code au livreur pour confirmer la réception.
            </p>
          </motion.div>
        )}

        {/* Delivery Time */}
        {(order.deliveryDisplayDate || order.deliverySlot) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5 text-[#2563EB]" />
            <span className="text-sm font-semibold text-[#2563EB]">
              {order.deliveryDisplayDate && order.deliverySlot
                ? (() => {
                    const [start, end] = order.deliverySlot.split('-');
                    const fmt = (t: string) => t.replace(':', 'h');
                    return `Livraison le ${order.deliveryDisplayDate} entre ${fmt(start)} et ${fmt(end)}`;
                  })()
                : order.deliveryDisplayDate
                  ? `Livraison le ${order.deliveryDisplayDate}`
                  : 'Livraison planifiée'}
            </span>
          </motion.div>
        )}

        {/* Order Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-5 space-y-4"
        >
          <h2 className="font-semibold text-[#1C1917]">Récapitulatif</h2>
          <div className="space-y-3">
            {snapshotItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1917] line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#78716C]">Quantité: {item.quantity}</p>
                </div>
                <p className="font-semibold text-[#1C1917] text-sm">
                  {item.price * item.quantity} MAD
                </p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Sous-total</span>
              {/* Price from deliveryUtils — do not recalculate */}
              <span className="font-semibold text-[#1C1917]">{snapshotTotal} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Livraison</span>
              {/* Price from deliveryUtils — do not recalculate */}
              <span
                className={`font-semibold ${deliveryFee === 0 ? 'text-[#16A34A]' : 'text-[#1C1917]'}`}
              >
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} MAD`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#1C1917]">Total</span>
              {/* Price from deliveryUtils — do not recalculate */}
              <span
                className="font-bold text-xl"
                style={{ color: 'var(--color-primary)' }}
              >
                {snapshotTotal + deliveryFee} MAD
              </span>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 pt-2"
        >
          <button
            onClick={() => router.push(`/store/${slug}/commande/${order.orderId ?? orderNumber}`)}
            className="w-full text-white font-semibold py-3.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Suivre ma commande
          </button>
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="w-full border-2 border-[#E2E8F0] text-[#78716C] font-semibold py-3.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Retour à la boutique
          </button>
        </motion.div>
      </div>
    </div>
  );
}
