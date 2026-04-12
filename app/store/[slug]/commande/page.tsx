'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';
import { ArrowLeft, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../_components/CartProvider';
import type { CartItem } from '../_components/CartProvider';
import DateTimePicker from '../_components/DateTimePicker';
import { MapLocationPicker } from '../_components/MapLocationPicker';
import { getDeliveryFee, generateOrderNumber } from '../_lib/deliveryUtils';
import { getMerchantBySlug } from '../actions';
import type { Merchant } from '@/types/supabase';
import type { PaymentMethod } from '@/types/supabase';


type UIPaymentMethod = 'cash' | 'card-delivery';

function uiPaymentToDb(method: UIPaymentMethod): PaymentMethod {
  if (method === 'cash') return 'cod';
  return 'terminal';
}

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items: contextItems, total: contextTotal } = useCart();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<UIPaymentMethod>('cash');
  const [deliveryDateTime, setDeliveryDateTime] = useState<{ date?: Date; time?: string }>({});

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [city, setCity] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);

  // Read cart directly from localStorage to avoid CSR hydration timing issues
  // (cart context items/total may still be [] / 0 at first render)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    getMerchantBySlug(slug).then(setMerchant);
  }, [slug]);

  useEffect(() => {
    const cartKey = `plaza_cart_${slug}`;
    try {
      const rawCart = localStorage.getItem(cartKey);
      if (rawCart) {
        const parsed = JSON.parse(rawCart) as CartItem[];
        const computedTotal = parsed.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        setCartItems(parsed);
        setCartTotal(computedTotal);
      } else {
        // Fallback to context if localStorage has nothing
        setCartItems([...contextItems]);
        setCartTotal(contextTotal);
      }
    } catch {
      setCartItems([...contextItems]);
      setCartTotal(contextTotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Use snapshot values for display; context values are still used by CartProvider for writes
  const items = cartItems.length > 0 ? cartItems : contextItems;
  const total = cartTotal > 0 ? cartTotal : contextTotal;

  const threshold = merchant?.delivery_free_threshold ?? undefined;
  const deliveryFee = getDeliveryFee(total, threshold);
  const finalTotal = total + deliveryFee;

  const isFormValid = (): boolean => {
    if (!fullName.trim()) return false;
    if (!/^0[5-7]\d{8}$/.test(phone.trim())) return false;
    if (!deliveryDateTime.date) return false;
    if (!deliveryDateTime.time) return false;
    if (locationLat === null || locationLng === null) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !merchant) return;
    setLoading(true);

    const orderNumber = generateOrderNumber();

    // Build slot range "HH:MM-HH:MM" (start + 1 hour) so confirmation can split('-')
    const startTime = deliveryDateTime.time ?? '';
    const slotRange = (() => {
      if (!startTime) return '';
      const [hStr, mStr] = startTime.split(':');
      const endHour = (parseInt(hStr, 10) + 1) % 24;
      const endTime = `${String(endHour).padStart(2, '0')}:${mStr}`;
      return `${startTime}-${endTime}`;
    })();

    sessionStorage.setItem(
      'plaza_pending_order',
      JSON.stringify({
        name: fullName.trim(),
        phone,
        address: addressNotes,
        city,
        locationLat,
        locationLng,
        deliveryDate: deliveryDateTime.date?.toISOString().split('T')[0] ?? null,
        deliverySlot: slotRange,
        deliveryDisplayDate: deliveryDateTime.date
          ? format(deliveryDateTime.date, "d MMMM yyyy", { locale: fr })
          : null,
        deliveryDisplaySlot: startTime,
        paymentMethod,
        paymentMethodDb: uiPaymentToDb(paymentMethod),
        orderNumber,
        merchantId: merchant.id,
        merchantSlug: slug,
        deliveryFeeThreshold: threshold ?? null,
      }),
    );

    router.push(`/store/${slug}/verification`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-[18px] ml-2">Passer la commande</h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-4 py-6 space-y-6"
      >
        {/* Contact Information */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Informations de contact</h2>
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
              Nom complet <span className="text-[#DC2626] ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Entrez votre nom complet"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[15px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
              Téléphone <span className="text-[#DC2626] ml-0.5">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06XXXXXXXX"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[15px]"
              required
            />
          </div>
        </div>

        {/* Delivery Location */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Adresse de livraison <span className="text-[#DC2626] ml-0.5">*</span></h2>

          <MapLocationPicker
            onLocationSelect={(lat, lng, cityGuess) => {
              setLocationLat(lat);
              setLocationLng(lng);
              if (cityGuess) setCity(cityGuess);
            }}
          />

          <div>
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
              Indications supplémentaires <span className="text-[#A8A29E] font-normal">(optionnel)</span>
            </label>
            <textarea
              placeholder="Étage, code porte, point de repère..."
              rows={3}
              value={addressNotes}
              onChange={(e) => setAddressNotes(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[15px] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
            />
          </div>
        </div>

        {/* Delivery Time */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Date de livraison souhaitée <span className="text-[#DC2626] ml-0.5">*</span></h2>
          <DateTimePicker
            value={deliveryDateTime}
            onChange={setDeliveryDateTime}
          />
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Mode de paiement</h2>

          <label
            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'cash'
                ? ''
                : 'border-[#E2E8F0] hover:border-[var(--color-primary)]'
            }`}
            style={paymentMethod === 'cash' ? { borderColor: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' } : {}}
          >
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
              className="w-4 h-4"
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <Banknote className="w-5 h-5 text-[#78716C]" />
            <span className="font-medium text-[#1C1917]">Paiement à la livraison</span>
          </label>

          <label
            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'card-delivery'
                ? ''
                : 'border-[#E2E8F0] hover:border-[var(--color-primary)]'
            }`}
            style={paymentMethod === 'card-delivery' ? { borderColor: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' } : {}}
          >
            <input
              type="radio"
              name="payment"
              value="card-delivery"
              checked={paymentMethod === 'card-delivery'}
              onChange={() => setPaymentMethod('card-delivery')}
              className="w-4 h-4"
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <CreditCard className="w-5 h-5 text-[#78716C]" />
            <span className="font-medium text-[#1C1917]">Carte à la livraison</span>
          </label>

          {/* Online payment — coming soon */}
          <div className="flex items-center gap-3 p-3 border-2 border-[#E2E8F0] rounded-lg cursor-not-allowed opacity-60">
            <input
              type="radio"
              name="payment"
              value="online"
              disabled
              className="w-4 h-4"
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <Smartphone className="w-5 h-5 text-[#78716C]" />
            <span className="font-medium text-[#1C1917] flex-1">Paiement en ligne (via CMI)</span>
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
              Bientôt disponible
            </span>
          </div>

        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Résumé de commande</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{item.name}</p>
                  <p className="text-[13px] text-[#78716C]">Qté {item.quantity}</p>
                </div>
                <span className="text-[15px] font-medium">
                  {item.price * item.quantity} MAD
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Sous-total</span>
              {/* Price from deliveryUtils — do not recalculate */}
              <span className="font-medium">{total} MAD</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Livraison</span>
              {/* Price from deliveryUtils — do not recalculate */}
              <span
                className={deliveryFee === 0 ? 'text-[#16A34A] font-medium' : 'font-medium'}
              >
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} MAD`}
              </span>
            </div>
            {deliveryFee === 0 && (
              <div className="flex items-center gap-1.5 text-[#16A34A] text-[13px] bg-[#F0FDF4] px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Livraison gratuite appliquée !</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#E2E8F0]">
              <span className="font-bold text-[19px]">Total</span>
              {/* Price from deliveryUtils — do not recalculate */}
              <span className="font-bold text-[19px]" style={{ color: 'var(--color-primary)' }}>{finalTotal} MAD</span>
            </div>
          </div>
        </div>
      </motion.form>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4">
        <div className="max-w-2xl mx-auto">
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isFormValid() || !merchant}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 text-white rounded-lg font-medium text-[16px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement...
              </>
            ) : (
              /* Price from deliveryUtils — do not recalculate */
              `Confirmer la commande • ${finalTotal} MAD`
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
