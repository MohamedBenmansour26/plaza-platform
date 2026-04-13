'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';
import { ArrowLeft, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../_components/CartProvider';
import type { CartItem } from '../_components/CartProvider';
import { createClient } from '@/lib/supabase/client';
import DateTimePicker from '../_components/DateTimePicker';
import { MapLocationPicker } from '../_components/MapLocationPicker';
import { getDeliveryFee, generateOrderNumber } from '../_lib/deliveryUtils';
import { getMerchantBySlug } from '../actions';
import type { Merchant } from '@/types/supabase';
import type { PaymentMethod } from '@/types/supabase';


const DELIVERY_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Agadir', 'Fès', 'Tanger']

type UIPaymentMethod = 'cash' | 'card-delivery' | 'online';

function uiPaymentToDb(method: UIPaymentMethod): PaymentMethod {
  if (method === 'cash') return 'cod';
  if (method === 'online') return 'card';
  return 'terminal';
}

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items: contextItems, total: contextTotal, removeItem, updateQuantity } = useCart();

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
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);
  const [outOfZone, setOutOfZone] = useState(false);

  // Read cart directly from localStorage to avoid CSR hydration timing issues
  // (cart context items/total may still be [] / 0 at first render).
  // Lazy initializer runs synchronously before the first render so the page
  // never shows "0 MAD" while waiting for a useEffect to fire.
  // Also checks sessionStorage for "Acheter maintenant" direct-buy flow
  // (written by ProductCard/ProductDetailClient before navigating here).
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      // "Acheter maintenant" direct-buy: sessionStorage takes priority
      const ssItems = sessionStorage.getItem('cartItems');
      const ssSlug = sessionStorage.getItem('cartSlug');
      if (ssItems && ssSlug === slug) {
        return JSON.parse(ssItems) as CartItem[];
      }
      const raw = localStorage.getItem(`plaza_cart_${slug}`);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [cartTotal, setCartTotal] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      // "Acheter maintenant" direct-buy: sessionStorage takes priority
      const ssSlug = sessionStorage.getItem('cartSlug');
      if (ssSlug === slug) {
        const ssSubtotal = sessionStorage.getItem('subtotal');
        if (ssSubtotal) return parseFloat(ssSubtotal);
      }
      const raw = localStorage.getItem(`plaza_cart_${slug}`);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as CartItem[];
      return parsed.reduce((sum, item) => sum + item.price * item.quantity, 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    getMerchantBySlug(slug).then(setMerchant);
  }, [slug]);

  // Redirect to store if cart is empty — prevents zero-item orders
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace(`/store/${slug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stock re-validation on mount — single bulk query to detect stale stock
  useEffect(() => {
    type ProductStockRow = { id: string; name_fr: string; stock: number | null };

    const validateStock = async () => {
      const supabase = createClient();
      const productIds = cartItems.map((i) => i.id);

      const { data: products } = await supabase
        .from('products')
        .select('id, name_fr, stock')
        .in('id', productIds)
        .returns<ProductStockRow[]>();

      const productMap = new Map((products ?? []).map((p) => [p.id, p]));
      const warnings: string[] = [];
      const adjustedItems: CartItem[] = [];

      for (const item of cartItems) {
        const product = productMap.get(item.id);
        if (!product) {
          removeItem(item.id);
          warnings.push(`${item.name} n'est plus disponible`);
          continue;
        }
        if (item.quantity > (product.stock ?? Infinity)) {
          if ((product.stock ?? 0) === 0) {
            removeItem(item.id);
            warnings.push(`${product.name_fr} n'est plus disponible`);
          } else {
            updateQuantity(item.id, product.stock!, product.stock!);
            warnings.push(`La quantité de ${product.name_fr} a été ajustée car le stock disponible a changé.`);
            adjustedItems.push({ ...item, quantity: product.stock! });
          }
        } else {
          adjustedItems.push(item);
        }
      }

      if (warnings.length > 0) {
        setStockWarnings(warnings);
        setCartItems(adjustedItems);
        setCartTotal(adjustedItems.reduce((sum, i) => sum + i.price * i.quantity, 0));
      }
    };

    if (cartItems.length > 0) { void validateStock(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // "Acheter maintenant" direct-buy: sessionStorage takes priority
    const ssItems = sessionStorage.getItem('cartItems');
    const ssSlug = sessionStorage.getItem('cartSlug');
    if (ssItems && ssSlug === slug) {
      try {
        const parsed = JSON.parse(ssItems) as CartItem[];
        const ssSubtotal = sessionStorage.getItem('subtotal');
        const computedTotal = ssSubtotal
          ? parseFloat(ssSubtotal)
          : parsed.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setCartItems(parsed);
        setCartTotal(computedTotal);
        return;
      } catch {
        // fall through to localStorage
      }
    }

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
        {/* Stock warnings — shown when cart was adjusted on mount */}
        {stockWarnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
            <p className="text-sm font-semibold text-amber-800">Votre panier a été mis à jour</p>
            {stockWarnings.map((msg) => (
              <p key={msg} className="text-sm text-amber-700">• {msg}</p>
            ))}
          </div>
        )}

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
              if (cityGuess) {
                setCity(cityGuess);
                // Soft zone check — case-insensitive, partial match
                const inZone = DELIVERY_CITIES.some(c =>
                  cityGuess.toLowerCase().includes(c.toLowerCase()) ||
                  c.toLowerCase().includes(cityGuess.toLowerCase())
                )
                setOutOfZone(!inZone)
              }
            }}
          />

          {/* Delivery zone info chip */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-blue-700">
              Plaza livre actuellement à : <span className="font-medium">{DELIVERY_CITIES.join(', ')}</span>
            </p>
          </div>

          {/* Soft out-of-zone warning — only shown when pin is outside known cities */}
          {outOfZone && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-amber-700">
                Votre adresse semble être hors de nos zones de livraison actuelles. Nous vous contacterons pour confirmer la disponibilité.
              </p>
            </div>
          )}

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
            workingHours={merchant?.working_hours ?? null}
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

          {merchant?.terminal_enabled === true && (
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
          )}

          {merchant?.cmi_enabled === true && (
            <label
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'online'
                  ? ''
                  : 'border-[#E2E8F0] hover:border-[var(--color-primary)]'
              }`}
              style={paymentMethod === 'online' ? { borderColor: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' } : {}}
            >
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
                className="w-4 h-4"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <Smartphone className="w-5 h-5 text-[#78716C]" />
              <span className="font-medium text-[#1C1917]">Paiement en ligne (via CMI)</span>
            </label>
          )}

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
                  {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
                  {(item.price * item.quantity).toFixed(0)} MAD
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Sous-total</span>
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
              <span className="font-medium">{total.toFixed(0)} MAD</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Livraison</span>
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
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
              {/* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */}
              <span className="font-bold text-[19px]" style={{ color: 'var(--color-primary)' }}>{finalTotal.toFixed(0)} MAD</span>
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
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Traitement en cours...
              </span>
            ) : (
              /* price in centimes from DB, divide by 100 for MAD display — division already done in ProductCard/ProductDetailClient before addItem */
              `Confirmer la commande • ${finalTotal.toFixed(0)} MAD`
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
