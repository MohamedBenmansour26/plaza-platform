import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Banknote, Smartphone, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { useCart } from "../contexts/CartContext";
import DateTimePicker from "../components/DateTimePicker";
import { getDeliveryFee, generateOrderNumber } from "../utils/deliveryUtils";

export default function Checkout() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryDateTime, setDeliveryDateTime] = useState<{ date?: Date; time?: string }>({});

  // FIX-01: Controlled inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressNotes, setAddressNotes] = useState("");

  // FIX-02: COD confirmation
  const [codConfirmed, setCodConfirmed] = useState(false);
  useEffect(() => setCodConfirmed(false), [paymentMethod]);

  // FIX-16: Use utility function for delivery fee
  const deliveryFee = getDeliveryFee(total);
  const finalTotal = total + deliveryFee;

  // FIX-01: Form validation
  const isFormValid = (): boolean => {
    if (!name.trim()) return false;
    if (!/^0[5-7]\d{8}$/.test(phone.trim())) return false;
    if (!deliveryDateTime.date) return false;
    if (!deliveryDateTime.time) return false;
    if (paymentMethod === "cash" || paymentMethod === "card-delivery") {
      if (!codConfirmed) return false;
    }
    return true;
  };

  // FIX-09: Navigate to OTP with full order state
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);

    navigate(`/store/${slug}/verification`, {
      state: {
        name,
        phone,
        address: addressNotes,
        deliveryDate: deliveryDateTime.date?.toISOString(),
        deliveryTime: deliveryDateTime.time,
        paymentMethod,
        orderNumber: generateOrderNumber(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2">
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
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet"
              className="w-full h-12 px-4 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">Téléphone</label>
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
          <h2 className="font-bold text-[17px]">Adresse de livraison</h2>

          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l-marker+2563eb(-7.6145,33.5892)/-7.6145,33.5892,14,0/600x300@2x?access_token=REMOVED_DEMO_TOKEN"
              alt="Map"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute top-3 right-3 bg-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-[13px] font-medium"
            >
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              Modifier
            </button>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
              Informations supplémentaires
            </label>
            <textarea
              placeholder="Appartement, étage, code du bâtiment, point de repère, instructions spéciales..."
              rows={3}
              value={addressNotes}
              onChange={(e) => setAddressNotes(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg text-[15px] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
            />
          </div>
        </div>

        {/* Delivery Time */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Horaire de livraison préféré</h2>
          <div>
            <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
              Date et heure
            </label>
            <DateTimePicker
              value={deliveryDateTime}
              onChange={(value) => setDeliveryDateTime(value)}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Mode de paiement</h2>

          <button
            type="button"
            onClick={() => setPaymentMethod("cash")}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
              paymentMethod === "cash"
                ? "border-[#2563EB] bg-[#EFF6FF]"
                : "border-[#E2E8F0] bg-white hover:border-[#2563EB]/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "cash" ? "border-[#2563EB]" : "border-[#E2E8F0]"
              }`}
            >
              {paymentMethod === "cash" && (
                <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
              )}
            </div>
            <Banknote className="w-5 h-5 text-[#78716C]" />
            <div className="flex-1 text-left">
              <div className="font-medium text-[15px]">Espèces à la livraison</div>
              <div className="text-[13px] text-[#78716C]">Payez en espèces au livreur</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("card-delivery")}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
              paymentMethod === "card-delivery"
                ? "border-[#2563EB] bg-[#EFF6FF]"
                : "border-[#E2E8F0] bg-white hover:border-[#2563EB]/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "card-delivery" ? "border-[#2563EB]" : "border-[#E2E8F0]"
              }`}
            >
              {paymentMethod === "card-delivery" && <div className="w-3 h-3 rounded-full bg-[#2563EB]" />}
            </div>
            <CreditCard className="w-5 h-5 text-[#78716C]" />
            <div className="flex-1 text-left">
              <div className="font-medium text-[15px]">Carte bancaire à la livraison</div>
              <div className="text-[13px] text-[#78716C]">Payez par carte au livreur</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("online")}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
              paymentMethod === "online"
                ? "border-[#2563EB] bg-[#EFF6FF]"
                : "border-[#E2E8F0] bg-white hover:border-[#2563EB]/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "online" ? "border-[#2563EB]" : "border-[#E2E8F0]"
              }`}
            >
              {paymentMethod === "online" && <div className="w-3 h-3 rounded-full bg-[#2563EB]" />}
            </div>
            <Smartphone className="w-5 h-5 text-[#78716C]" />
            <div className="flex-1 text-left">
              <div className="font-medium text-[15px]">Paiement en ligne</div>
              <div className="text-[13px] text-[#78716C]">Carte bancaire ou mobile money</div>
            </div>
          </button>

          {/* FIX-02: COD confirmation checkbox */}
          {(paymentMethod === "cash" || paymentMethod === "card-delivery") && (
            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-[#E2E8F0]">
              <input
                type="checkbox"
                checked={codConfirmed}
                onChange={(e) => setCodConfirmed(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-[#2563EB] flex-shrink-0 cursor-pointer"
              />
              <span className="text-[14px] text-[#78716C] leading-snug">
                Je comprends que je paierai en {paymentMethod === "cash" ? "espèces" : "carte bancaire"} au moment de la livraison. Aucun prépaiement n'est requis.
              </span>
            </label>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
          <h2 className="font-bold text-[17px]">Résumé de commande</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{item.name}</p>
                  <p className="text-[13px] text-[#78716C]">Qté {item.quantity}</p>
                </div>
                <span className="text-[15px] font-medium">{item.price * item.quantity} MAD</span>
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
              <span className={deliveryFee === 0 ? "text-[#16A34A] font-medium" : "font-medium"}>
                {deliveryFee === 0 ? "Gratuit" : `${deliveryFee} MAD`}
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
              <span className="font-bold text-[19px] text-[#2563EB]">{finalTotal} MAD</span>
            </div>
          </div>
        </div>
      </motion.form>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto">
          <motion.button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 bg-[#2563EB] text-white rounded-lg font-medium text-[16px] hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement...
              </>
            ) : (
              `Confirmer la commande • ${finalTotal} MAD`
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
