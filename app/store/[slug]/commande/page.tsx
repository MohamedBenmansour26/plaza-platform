'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';
import { ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../_components/CartProvider';
import { DeliverySlotPicker } from '../_components/DeliverySlotPicker';
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
  const { items, total } = useCart();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<UIPaymentMethod>('cash');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [deliverySlot, setDeliverySlot] = useState<string>('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [city, setCity] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);

  const [codConfirmed, setCodConfirmed] = useState(false);
  useEffect(() => setCodConfirmed(false), [paymentMethod]);

  useEffect(() => {
    const today = new Date();
    setDeliveryDate(today);
    const nowHour = today.getHours();
    const firstSlot = ['09:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00',
      '13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00',
      '17:00-18:00','18:00-19:00','19:00-20:00']
      .find(s => parseInt(s.split(':')[0], 10) > nowHour) ?? '09:00-10:00';
    setDeliverySlot(firstSlot);
  }, []);

  useEffect(() => {
    getMerchantBySlug(slug).then(setMerchant);
  }, [slug]);

  const threshold = merchant?.delivery_free_threshold ?? undefined;
  const deliveryFee = getDeliveryFee(total, threshold);
  const finalTotal = total + deliveryFee;

  const isFormValid = (): boolean => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!/^0[5-7]\d{8}$/.test(phone.trim())) return false;
    if (!deliveryDate) return false;
    if (!deliverySlot) return false;
    if (locationLat === null || locationLng === null) return false;
    if (!codConfirmed) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !merchant) return;
    setLoading(true);

    const orderNumber = generateOrderNumber();

    const formattedDate = deliveryDate
      ? format(deliveryDate, "d MMMM yyyy", { locale: fr })
      : null;

    sessionStorage.setItem(
      'plaza_pending_order',
      JSON.stringify({
        name: `${firstName.trim()} ${lastName.trim()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        address: addressNotes,
        city,
        locationLat,
        locationLng,
        deliveryDate: deliveryDate?.toISOString().split('T')[0] ?? null,
        deliverySlot,
        deliveryDisplayDate: formattedDate,
        deliveryDisplaySlot: deliverySlot,
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
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
              Pr\u00e9nom <span className="text-[#DC2626] ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Votre pr\u00e9nom"
              className="w-full h-12 px-4 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
              Nom <span className="text-[#DC2626] ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Votre nom"
              className="w-full h-12 px-4 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
              T\u00e9l\u00e9phone <span className="text-[#DC2626] ml-0.5">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06XXXXXXXX"
              className="w-full h-12 px-4 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
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
              Indications suppl\u00e9mentaires <span className="text-[#A8A29E] font-normal">(optionnel)</span>
            </label>
            <textarea
              placeholder="\u00c9tage, code d'entr\u00e9e, point de rep\u00e8re..."
              rows={2}
              value={addressNotes}
              onChange={(e) => setAddressNotes(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
            />
          </div>
        </div>

        {/* Delivery Time */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Date de livraison souhait\u00e9e <span className="text-[#DC2626] ml-0.5">*</span></h2>
          <DeliverySlotPicker
            selectedDate={deliveryDate}
            selectedSlot={deliverySlot}
            onDateChange={setDeliveryDate}
            onSlotChange={setDeliverySlot}
            workingHours={null}
          />
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Mode de paiement</h2>

          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
              paymentMethod === 'cash'
                ? 'border-[#2563EB] bg-[#EFF6FF]'
                : 'border-[#E2E8F0] bg-white hover:border-[#2563EB]/30'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'cash' ? 'border-[#2563EB]' : 'border-[#E2E8F0]'
              }`}
            >
              {paymentMethod === 'cash' && (
                <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
              )}
            </div>
            <Banknote className="w-5 h-5 text-[#78716C]" />
            <div className="flex-1 text-left">
              <div className="font-medium text-[15px]">Paiement \u00e0 la livraison</div>
              <div className="text-[13px] text-[#78716C]">Payez en esp\u00e8ces au livreur</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('card-delivery')}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
              paymentMethod === 'card-delivery'
                ? 'border-[#2563EB] bg-[#EFF6FF]'
                : 'border-[#E2E8F0] bg-white hover:border-[#2563EB]/30'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'card-delivery' ? 'border-[#2563EB]' : 'border-[#E2E8F0]'
              }`}
            >
              {paymentMethod === 'card-delivery' && (
                <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
              )}
            </div>
            <CreditCard className="w-5 h-5 text-[#78716C]" />
            <div className="flex-1 text-left">
              <div className="font-medium text-[15px]">Carte \u00e0 la livraison</div>
              <div className="text-[13px] text-[#78716C]">Payez par carte au livreur</div>
            </div>
          </button>

          {(paymentMethod === 'cash' || paymentMethod === 'card-delivery') && (
            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-[#E2E8F0]">
              <input
                type="checkbox"
                checked={codConfirmed}
                onChange={(e) => setCodConfirmed(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-[#2563EB] flex-shrink-0 cursor-pointer"
              />
              <span className="text-[14px] text-[#78716C] leading-snug">
                Je comprends que je paierai en{' '}
                {paymentMethod === 'cash' ? 'esp\u00e8ces' : 'carte bancaire'} au moment de la
                livraison. Aucun pr\u00e9paiement n&apos;est requis.
              </span>
            </label>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">R\u00e9sum\u00e9 de commande</h2>
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
                  <p className="text-[13px] text-[#78716C]">Qt\u00e9 {item.quantity}</p>
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
              <span className="font-medium">{total} MAD</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Livraison</span>
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
                <span className="font-medium">Livraison gratuite appliqu\u00e9e !</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#E2E8F0]">
              <span className="font-bold text-[19px]">Total</span>
              <span className="font-bold text-[19px] text-[#2563EB]">{finalTotal} MAD</span>
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
            className="w-full h-14 bg-[#2563EB] text-white rounded-lg font-medium text-[16px] hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement...
              </>
            ) : (
              `Confirmer la commande \u2022 ${finalTotal} MAD`
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
