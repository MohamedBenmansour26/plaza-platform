'use client';

// PRICE RULE: all DB prices are in centimes
// Always divide by 100 before displaying
// Display: (value / 100).toFixed(0) + " MAD"
// NOTE: cart prices (item.price, total, subtotal) are in MAD — divided by 100 at addItem time in CartProvider

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { createOrder } from '../actions';
import type { CreateOrderPayload } from '../actions';
import { useCart } from '../_components/CartProvider';
import type { CartItem } from '../_components/CartProvider';
import { getDeliveryFee } from '../_lib/deliveryUtils';

interface PendingOrder {
  name: string;
  phone: string;
  address: string;
  city: string;
  locationLat?: number | null;        // PLZ-068: customer map-pin latitude
  locationLng?: number | null;        // PLZ-068: customer map-pin longitude
  deliveryDate?: string | null;       // YYYY-MM-DD
  deliverySlot?: string | null;       // "09:00-10:00"
  deliveryDisplayDate?: string | null;
  deliveryDisplaySlot?: string | null;
  paymentMethod: string;
  paymentMethodDb: 'cod' | 'terminal' | 'card';
  notes?: string | null;
  orderNumber?: string;               // Optional: generated server-side; may be absent on error path
  merchantId: string;
  merchantSlug: string;
  deliveryFeeThreshold?: number | null;
}

export default function VerificationPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items: cartContextItems, total: cartContextTotal } = useCart();

  // "Acheter maintenant" direct-buy: items may only be in sessionStorage, not CartProvider
  const [directBuyItems, setDirectBuyItems] = useState<CartItem[]>([]);
  const [directBuyTotal, setDirectBuyTotal] = useState<number>(0);

  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('plaza_pending_order');
    if (stored) {
      try {
        setPendingOrder(JSON.parse(stored) as PendingOrder);
      } catch {
        // ignore malformed data
      }
    }

    // Check for "Acheter maintenant" direct-buy cart in sessionStorage
    const ssItems = sessionStorage.getItem('cartItems');
    const ssSlug = sessionStorage.getItem('cartSlug');
    if (ssItems && ssSlug === slug) {
      try {
        const parsed = JSON.parse(ssItems) as CartItem[];
        setDirectBuyItems(parsed);
        const ssSubtotal = sessionStorage.getItem('subtotal');
        setDirectBuyTotal(
          ssSubtotal
            ? parseFloat(ssSubtotal)
            : parsed.reduce((sum, item) => sum + item.price * item.quantity, 0),
        );
      } catch {
        // ignore
      }
    }

    inputRefs.current[0]?.focus();
  }, [slug]);

  const phone = pendingOrder?.phone ?? 'votre numéro';

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData
      .split('')
      .concat(Array<string>(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(true);
      setErrorMessage('Veuillez entrer un code à 6 chiffres.');
      return;
    }

    if (!pendingOrder) {
      setError(true);
      setErrorMessage('Données de commande introuvables. Veuillez recommencer.');
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setError(false);

    try {
      // Resolve cart items: prefer sessionStorage direct-buy (written synchronously
      // by handleBuyNow) so we never depend on potentially-stale React state.
      // Fall back to CartProvider context for the normal add-to-cart flow.
      const ssItems = sessionStorage.getItem('cartItems');
      const ssSlug = sessionStorage.getItem('cartSlug');
      const ssSubtotal = sessionStorage.getItem('subtotal');
      const directBuyFromStorage =
        ssItems && ssSlug === slug
          ? (JSON.parse(ssItems) as CartItem[])
          : null;

      const items: CartItem[] =
        directBuyFromStorage && directBuyFromStorage.length > 0
          ? directBuyFromStorage
          : cartContextItems.length > 0
            ? cartContextItems
            : directBuyItems;

      const total: number =
        directBuyFromStorage && directBuyFromStorage.length > 0
          ? ssSubtotal
            ? parseFloat(ssSubtotal)
            : directBuyFromStorage.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              )
          : cartContextTotal > 0
            ? cartContextTotal
            : directBuyTotal;

      const payload: CreateOrderPayload = {
        // SAAD-003: orderNumber is generated by the DB sequence — not passed from client
        merchantId: pendingOrder.merchantId,
        merchantSlug: pendingOrder.merchantSlug,
        customerName: pendingOrder.name,
        customerPhone: pendingOrder.phone,
        customerAddress: pendingOrder.address || null,
        customerCity: pendingOrder.city || null,
        locationLat: pendingOrder.locationLat ?? null,    // PLZ-068: map pin coordinates
        locationLng: pendingOrder.locationLng ?? null,    // PLZ-068: for dispatch distance calc
        deliveryDate: pendingOrder.deliveryDate ?? null,
        deliverySlot: pendingOrder.deliverySlot ?? null,
        paymentMethod: pendingOrder.paymentMethodDb,
        notes: pendingOrder.notes ?? null,
        items: items.map((item) => ({
          productId: item.id,
          nameFr: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: total,
        deliveryFee: getDeliveryFee(total, pendingOrder.deliveryFeeThreshold ?? undefined),
        total: total + getDeliveryFee(total, pendingOrder.deliveryFeeThreshold ?? undefined),
      };

      // ── Snapshot cart into sessionStorage BEFORE navigating ──
      // This prevents the race condition where CartProvider's persist
      // effect writes [] to localStorage before confirmation/page.tsx
      // can read the cart items. We snapshot here while items are
      // guaranteed to be populated (we just built the payload above).
      // subtotal in MAD (prices already divided by 100 at cart entry)
      const snapshotSubtotal = total;
      const snapshotDeliveryFee = getDeliveryFee(total, pendingOrder.deliveryFeeThreshold ?? undefined);
      const snapshotTotal = snapshotSubtotal + snapshotDeliveryFee;
      // Cart items snapshot — written so confirmation can display the
      // order summary even after clearCart() wipes localStorage.
      const cartSnapshot = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price, // MAD
        quantity: item.quantity,
        image: item.image,
      }));

      // Write confirm* keys BEFORE clearCart() runs anywhere.
      // These prefixed keys are the authoritative source for confirmation/page.tsx
      // and are immune to CartProvider context being wiped by clearCart().
      // All values are in MAD (prices divided by 100 at cart entry time).
      sessionStorage.setItem('confirmSubtotal', total.toString());
      sessionStorage.setItem('confirmDelivery', snapshotDeliveryFee.toString());
      sessionStorage.setItem('confirmTotal', snapshotTotal.toString());
      sessionStorage.setItem('confirmDate', pendingOrder.deliveryDate ?? '');
      sessionStorage.setItem('confirmSlot', pendingOrder.deliverySlot ?? '');

      try {
        const result = await createOrder(payload);
        // Update sessionStorage with confirmed data including PIN.
        // orderId is the UUID returned by createOrder — guard against undefined
        // so confirmation/page.tsx only shows "Suivre ma commande" when the order
        // was actually persisted in the DB.
        const existing = JSON.parse(sessionStorage.getItem('plaza_pending_order') ?? '{}');
        sessionStorage.setItem('plaza_pending_order', JSON.stringify({
          ...existing,
          orderNumber: result.orderNumber,
          ...(result.orderId ? { orderId: result.orderId } : {}),
          customerPin: result.customerPin,
          deliveryDisplayDate: pendingOrder.deliveryDisplayDate,
          deliveryDisplaySlot: pendingOrder.deliveryDisplaySlot,
          deliverySlot: pendingOrder.deliverySlot,
          // Cart snapshot for confirmation page (avoids localStorage race)
          // subtotal/deliveryFee/total in MAD
          cartSnapshot,
          snapshotSubtotal,
          snapshotDeliveryFee,
          snapshotTotal,
        }));

        // Also write order identity to confirm* keys (available after createOrder)
        sessionStorage.setItem('confirmOrderId', result.orderId ?? '');
        sessionStorage.setItem('confirmOrderNumber', result.orderNumber ?? pendingOrder.orderNumber ?? '');
        sessionStorage.setItem('confirmPin', String(result.customerPin ?? ''));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        if (message.includes('Stock insuffisant')) {
          setStockError(message);
          setIsProcessing(false);
          setLoading(false);
          return; // do NOT navigate to confirmation
        }

        // createOrder failed — navigate to confirmation with fallback /track link
        // MVP bypass: still navigate to confirmation so the customer sees their
        // order number. orderId absent → "Suivre ma commande" shows /track fallback.
        // Write cart snapshot so confirmation shows correct prices even without DB.
        const existing = JSON.parse(sessionStorage.getItem('plaza_pending_order') ?? '{}');
        sessionStorage.setItem('plaza_pending_order', JSON.stringify({
          ...existing,
          deliveryDisplayDate: pendingOrder.deliveryDisplayDate,
          deliveryDisplaySlot: pendingOrder.deliveryDisplaySlot,
          deliverySlot: pendingOrder.deliverySlot,
          // Cart snapshot for confirmation page (avoids localStorage race)
          cartSnapshot,
          snapshotSubtotal,
          snapshotDeliveryFee,
          snapshotTotal,
        }));

        // Fallback confirm* identity keys (no orderId on DB failure)
        sessionStorage.setItem('confirmOrderId', '');
        sessionStorage.setItem('confirmOrderNumber', pendingOrder.orderNumber ?? '');
        sessionStorage.setItem('confirmPin', '');
      }

      router.push(`/store/${slug}/confirmation`);
    } catch {
      setError(true);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setError(false);
    setErrorMessage('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {isProcessing && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-stone-700 text-sm font-medium">Confirmation de votre commande...</p>
            <p className="text-stone-500 text-xs mt-1">Veuillez patienter quelques instants</p>
          </div>
        </div>
      )}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2"
          data-testid="customer-verification-back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-[18px] ml-2">Vérification</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto px-4 py-12"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--color-primary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="font-bold text-[24px] mb-2">Vérifiez votre numéro</h2>
          <p className="text-[14px] text-[#78716C]">
            Nous avons envoyé un code à 6 chiffres au
          </p>
          <p className="text-[15px] font-medium text-[#1C1917] mt-1">{phone}</p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex gap-2 justify-center mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-14 text-center text-[20px] font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors ${
                    error
                      ? 'border-[#DC2626] bg-red-50'
                      : digit
                        ? ''
                        : 'border-[#E2E8F0] bg-white'
                  }`}
                  style={!error && digit ? { borderColor: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' } : {}}
                  data-testid="customer-verification-otp-input"
                  data-index={index}
                />
              ))}
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] text-[#DC2626] text-center"
              >
                {errorMessage}
              </motion.p>
            )}
            {stockError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mt-4">
                <p className="font-medium">Rupture de stock</p>
                <p className="mt-1">{stockError}</p>
                <a
                  href={`/store/${slug}`}
                  className="underline mt-2 block text-red-600"
                >
                  Retour à la boutique
                </a>
              </div>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full h-14 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
            data-testid="customer-verification-verify-btn"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier le code'
            )}
          </button>

          <div className="text-center">
            <p className="text-[14px] text-[#78716C] mb-2">
              Vous n&apos;avez pas reçu le code ?
            </p>
            <button
              onClick={handleResend}
              className="text-[14px] font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
              data-testid="customer-verification-resend-btn"
            >
              Renvoyer le code
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-lg border" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
          <p className="text-[13px] text-[#78716C] text-center">
            Pour ce MVP, tout code à 6 chiffres est accepté.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
