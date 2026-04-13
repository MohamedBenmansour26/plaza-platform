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
import type { CartItem } from '../_components/CartProvider';

interface ConfirmedOrder {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  deliveryDate?: string;
  deliverySlot?: string; // "09:00-10:00"
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

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

function formatDateFR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const monthName = MONTHS_FR[parseInt(month, 10) - 1];
  if (!monthName) return dateStr;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

export default function ConfirmationPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [order, setOrder] = useState<ConfirmedOrder>({});
  const [copied, setCopied] = useState(false);
  const [snapshotItems, setSnapshotItems] = useState<CartItem[]>([]);
  const [confirmSubtotal, setConfirmSubtotal] = useState(0);
  const [confirmDelivery, setConfirmDelivery] = useState(30);
  const [confirmTotal, setConfirmTotal] = useState(0);
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmSlot, setConfirmSlot] = useState('');
  // Prevent empty order-number flash: hold render until sessionStorage is read
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ── Read confirm* keys (written by verification/page.tsx before createOrder) ──
    // These are written BEFORE any clearCart() call, so they are always accurate.
    // All values are in MAD — do NOT divide by 100.
    const ssSubtotal = sessionStorage.getItem('confirmSubtotal');
    const ssDelivery = sessionStorage.getItem('confirmDelivery');
    const ssTotal = sessionStorage.getItem('confirmTotal');
    const ssOrderId = sessionStorage.getItem('confirmOrderId');
    const ssOrderNumber = sessionStorage.getItem('confirmOrderNumber');
    const ssPin = sessionStorage.getItem('confirmPin');
    const ssDate =
      sessionStorage.getItem('confirmDate') ||
      sessionStorage.getItem('deliveryDate') ||
      '';
    const ssSlot =
      sessionStorage.getItem('confirmSlot') ||
      sessionStorage.getItem('deliverySlot') ||
      '';

    if (ssSubtotal) setConfirmSubtotal(parseFloat(ssSubtotal));
    if (ssDelivery) setConfirmDelivery(parseFloat(ssDelivery));
    if (ssTotal) setConfirmTotal(parseFloat(ssTotal));
    if (ssDate) setConfirmDate(ssDate);
    if (ssSlot) setConfirmSlot(ssSlot);

    // ── Read order metadata from plaza_pending_order ──
    // Used for order number, orderId, customerPin, delivery date/slot display.
    // Fall back to confirm* keys for identity fields if plaza_pending_order is absent.
    const stored = sessionStorage.getItem('plaza_pending_order');
    let parsedOrder: ConfirmedOrder & {
      cartSnapshot?: CartItem[];
      snapshotSubtotal?: number;
    } = {};
    if (stored) {
      try {
        parsedOrder = JSON.parse(stored) as typeof parsedOrder;
        setOrder({
          ...parsedOrder,
          // Prefer confirm* identity keys as they are written after createOrder resolves
          orderId: ssOrderId || parsedOrder.orderId || undefined,
          orderNumber: ssOrderNumber || parsedOrder.orderNumber || undefined,
          customerPin:
            parsedOrder.customerPin ??
            (ssPin ? parseInt(ssPin, 10) : undefined),
        });
      } catch {
        // Fallback to confirm* keys only
        setOrder({
          orderId: ssOrderId ?? undefined,
          orderNumber: ssOrderNumber ?? undefined,
          customerPin: ssPin ? parseInt(ssPin, 10) : undefined,
        });
      }
    } else {
      // No plaza_pending_order — use confirm* keys for identity
      setOrder({
        orderId: ssOrderId ?? undefined,
        orderNumber: ssOrderNumber ?? undefined,
        customerPin: ssPin ? parseInt(ssPin, 10) : undefined,
      });
    }

    // ── Cart items snapshot for the item list display ──
    // Read from cartSnapshot in plaza_pending_order (written by verification/page.tsx).
    // Falls back to localStorage then context — only used for the item list, not prices.
    if (parsedOrder.cartSnapshot && parsedOrder.cartSnapshot.length > 0) {
      setSnapshotItems(parsedOrder.cartSnapshot);
    } else {
      const cartKey = `plaza_cart_${slug}`;
      try {
        const rawCart = localStorage.getItem(cartKey);
        if (rawCart) {
          const cartItems = JSON.parse(rawCart) as CartItem[];
          setSnapshotItems(cartItems);
        } else {
          setSnapshotItems([...items]);
        }
      } catch {
        setSnapshotItems([...items]);
      }
    }

    // Guard: redirect to store if there is no order number — user landed here directly
    const resolvedOrderNumber = ssOrderNumber || parsedOrder.orderNumber || '';
    if (!resolvedOrderNumber) {
      router.replace(`/store/${slug}`);
      return;
    }

    clearCart();
    sessionStorage.removeItem('plaza_pending_order');
    // Clean up confirm* keys
    sessionStorage.removeItem('confirmSubtotal');
    sessionStorage.removeItem('confirmDelivery');
    sessionStorage.removeItem('confirmTotal');
    sessionStorage.removeItem('confirmOrderId');
    sessionStorage.removeItem('confirmOrderNumber');
    sessionStorage.removeItem('confirmPin');
    sessionStorage.removeItem('confirmDate');
    sessionStorage.removeItem('confirmSlot');

    // Mark ready — all state is now populated from sessionStorage
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderNumber = order.orderNumber || '';
  const deliveryFee = confirmDelivery;

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

  // Hold render until sessionStorage has been read — prevents blank order number flash
  if (!ready)
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );

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
              {orderNumber || ''}
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
              {String(order.customerPin)
                .padStart(4, '0')
                .split('')
                .map((digit, i) => (
                  <div
                    key={i}
                    className="w-12 h-14 bg-white rounded-lg flex items-center justify-center text-3xl font-bold border-2"
                    style={{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                    }}
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
        {(() => {
          const rawDate = order.deliveryDisplayDate || confirmDate;
          const slot = order.deliverySlot || confirmSlot;
          if (!rawDate && !slot) return null;
          // Format date: if it looks like ISO (YYYY-MM-DD) convert to "16 avril 2026"
          const displayDate =
            rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
              ? formatDateFR(rawDate)
              : rawDate;
          const fmt = (t: string) => t.replace(':', 'h');
          let label = 'Livraison planifiée';
          if (displayDate && slot) {
            const parts = slot.split('-');
            const start = parts[0];
            const end = parts[1];
            if (start && end) {
              label = `Livraison le ${displayDate} entre ${fmt(start)} et ${fmt(end)}`;
            } else if (start) {
              label = `Livraison le ${displayDate} à partir de ${fmt(start)}`;
            }
          } else if (displayDate) {
            label = `Livraison le ${displayDate}`;
          }
          return (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border px-4 py-3 flex items-center justify-center gap-2"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                borderColor:
                  'color-mix(in srgb, var(--color-primary) 40%, transparent)',
              }}
            >
              <Clock
                className="w-5 h-5"
                style={{ color: 'var(--color-primary)' }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {label}
              </span>
            </motion.div>
          );
        })()}

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
                  <p className="text-xs text-[#78716C]">
                    Quantité: {item.quantity}
                  </p>
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
              {/* confirmSubtotal is in MAD — written by verification/page.tsx before clearCart */}
              <span className="font-semibold text-[#1C1917]">
                {confirmSubtotal.toFixed(0)} MAD
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#78716C]">Livraison</span>
              {/* confirmDelivery is in MAD — written by verification/page.tsx before clearCart */}
              <span
                className={`font-semibold ${deliveryFee === 0 ? 'text-[#16A34A]' : 'text-[#1C1917]'}`}
              >
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} MAD`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#1C1917]">Total</span>
              {/* confirmTotal is in MAD — written by verification/page.tsx before clearCart */}
              <span
                className="font-bold text-xl"
                style={{ color: 'var(--color-primary)' }}
              >
                {confirmTotal.toFixed(0)} MAD
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
