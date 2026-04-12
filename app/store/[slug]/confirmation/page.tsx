'use client';

// PRICE RULE: all DB prices are in centimes
// Always divide by 100 before displaying
// Display: (value / 100).toFixed(0) + " MAD"
// NOTE: cart prices and snapshotSubtotal/snapshotTotal are already in MAD (divided at addItem time)

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    // Read order metadata from sessionStorage (written by verification/page.tsx)
    const stored = sessionStorage.getItem('plaza_pending_order');
    let parsedOrder: ConfirmedOrder & {
      cartSnapshot?: CartItem[];
      snapshotSubtotal?: number;
    } = {};
    if (stored) {
      try {
        parsedOrder = JSON.parse(stored) as typeof parsedOrder;
        setOrder(parsedOrder);
      } catch {
        // ignore
      }
    }

    // ── Cart snapshot resolution (priority order) ──────────────
    // 1. sessionStorage cart snapshot — written by verification/page.tsx
    //    before navigating. This is immune to the CartProvider race
    //    condition where the persist effect overwrites localStorage with []
    //    before confirmation mounts.
    // 2. snapshotSubtotal alone — written by verification even when cartSnapshot
    //    is empty (e.g. direct-buy race where items state hadn't populated yet).
    // 3. localStorage direct read — fallback if snapshot is absent.
    // 4. Cart context — last resort if localStorage is already cleared.
    // All subtotal/deliveryFee/total values are in MAD (divided at addItem time).

    if (parsedOrder.cartSnapshot && parsedOrder.cartSnapshot.length > 0) {
      // Preferred path: use the snapshot written by verification/page.tsx
      const cartItems = parsedOrder.cartSnapshot;
      const cartTotal = parsedOrder.snapshotSubtotal ??
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setSnapshotItems(cartItems);
      setSnapshotTotal(cartTotal);
    } else if (parsedOrder.snapshotSubtotal != null && parsedOrder.snapshotSubtotal > 0) {
      // cartSnapshot was empty but snapshotSubtotal was written — use it directly.
      // This covers the "Acheter maintenant" path when cartSnapshot is [].
      setSnapshotTotal(parsedOrder.snapshotSubtotal);
    } else {
      // Fallback: read localStorage directly (may be empty due to race)
      const cartKey = `plaza_cart_${slug}`;
      try {
        const rawCart = localStorage.getItem(cartKey);
        if (rawCart) {
          const cartItems = JSON.parse(rawCart) as CartItem[];
          // price in MAD (divided by 100 at cart entry in ProductCard)
          const cartTotal = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          setSnapshotItems(cartItems);
          setSnapshotTotal(cartTotal);
        } else {
          // Last resort: context values (may be [] / 0 if already cleared)
          setSnapshotItems([...items]);
          setSnapshotTotal(total);
        }
      } catch {
        setSnapshotItems([...items]);
        setSnapshotTotal(total);
      }
    }

    clearCart();
    sessionStorage.removeItem('plaza_pending_order');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderNumber = order.orderNumber ?? 'PLZ-???';
  // delivery_free_threshold is stored in centimes in the DB and propagated as-is
  // through plaza_pending_order; divide by 100 to compare against MAD subtotal.
  const thresholdMAD =
    order.deliveryFeeThreshold != null ? order.deliveryFeeThreshold / 100 : undefined;
  const deliveryFee = getDeliveryFee(snapshotTotal, thresholdMAD);

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
              className="p-2 rounded-lg transition-colors hover:opacity-80"
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
            className="rounded-xl border px-4 py-3 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' }}
          >
            <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
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
                  {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
                  {(item.price * item.quantity).toFixed(0)} MAD
                </p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Sous-total</span>
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
              <span className="font-semibold text-[#1C1917]">{snapshotTotal.toFixed(0)} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Livraison</span>
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
              <span
                className={`font-semibold ${deliveryFee === 0 ? 'text-[#16A34A]' : 'text-[#1C1917]'}`}
              >
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} MAD`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#1C1917]">Total</span>
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
              <span
                className="font-bold text-xl"
                style={{ color: 'var(--color-primary)' }}
              >
                {(snapshotTotal + deliveryFee).toFixed(0)} MAD
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
          {/* orderId is the UUID written by verification/page.tsx after createOrder succeeds.
              When orderId is present → deep-link to the order detail page.
              When orderId is absent (DB write failed / MVP bypass) → fallback to /track
              so the customer can still look up their order by number + phone. */}
          {order.orderId ? (
            <Link
              href={`/store/${slug}/commande/${order.orderId}`}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Suivre ma commande
            </Link>
          ) : (
            <Link
              href={`/track?order=${orderNumber}`}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Suivre ma commande
            </Link>
          )}
          <Link
            href={`/store/${slug}`}
            className="w-full h-12 rounded-xl border-2 border-[#E2E8F0] text-[#78716C] font-semibold text-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            Retour à la boutique
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
