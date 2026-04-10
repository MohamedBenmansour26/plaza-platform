import { useEffect, useState } from "react";
import { Check, Copy, CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useCart } from "../contexts/CartContext";

export default function Confirmation() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { state } = useLocation() as { state: {
    name?: string; phone?: string; address?: string;
    deliveryDate?: string; deliveryTime?: string;
    paymentMethod?: string; orderNumber?: string;
  } | null };
  const { items, total } = useCart();
  const [animate, setAnimate] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderNumber = state?.orderNumber ?? "PLZ-???";

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const deliveryFee = total >= 500 ? 0 : 30;

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(orderNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or restricted contexts
        const textArea = document.createElement("textarea");
        textArea.value = orderNumber;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        textArea.remove();
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Still show copied state for UX even if copy failed
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="bg-[#16A34A] h-28 -mx-4 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: animate ? 1 : 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: animate ? 1 : 0 }}
              transition={{ delay: 0.4 }}
            >
              <Check className="w-10 h-10 text-[#16A34A]" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>

        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bold text-[26px]"
          >
            Commande confirmée !
          </motion.h1>

          {state?.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-[15px] text-[#78716C]"
            >
              Merci, <span className="font-medium text-[#1C1917]">{state.name}</span> !
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-5 border-2 border-[#2563EB] shadow-sm"
          >
            <div className="text-[13px] text-[#78716C] mb-2 font-medium">
              📋 Votre numéro de commande
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-bold text-[28px] text-[#2563EB] tracking-wide">
                {orderNumber}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCheck className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <Copy className="w-5 h-5 text-[#78716C]" />
                )}
              </button>
            </div>
            <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg px-4 py-3">
              <p className="text-[13px] text-[#92400E] font-medium">
                ⚠️ Conservez ce numéro pour suivre votre commande
              </p>
            </div>
          </motion.div>

          {/* FIX-17: COD reassurance block */}
          {(state?.paymentMethod === "cash" || state?.paymentMethod === "card-delivery") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-start gap-3 p-4 bg-[#F0FDF4] border border-[#16A34A]/30 rounded-xl"
            >
              <svg className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-[13px] text-[#166534] leading-snug">
                Paiement à la livraison — vous ne payez qu'au moment de recevoir votre colis. Aucun montant n'est débité maintenant.
              </p>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[15px] text-[#78716C] px-4"
          >
            Nous vous contacterons dans les <span className="font-medium text-[#1C1917]">30 minutes</span> pour confirmer la livraison.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-[14px] font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Livraison estimée : {state?.deliveryTime ?? "à confirmer"}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-5 border border-[#E2E8F0]"
        >
          <h2 className="font-bold text-[16px] mb-4">Résumé de commande</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{item.name}</p>
                  <p className="text-[13px] text-[#78716C]">Qté {item.quantity}</p>
                </div>
                <span className="text-[14px] font-medium">{item.price * item.quantity} MAD</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Total</span>
              <span className="font-bold">{total} MAD</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Livraison</span>
              <span className="text-[#16A34A] font-medium">
                {deliveryFee === 0 ? "Gratuite" : `${deliveryFee} MAD`}
              </span>
            </div>
            <div className="flex items-start gap-2 text-[13px] text-[#78716C] pt-2 mt-2 border-t border-[#E2E8F0]">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{state?.address ?? "Adresse non renseignée"}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate(`/track`)}
            className="w-full h-14 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            Suivre ma commande
          </button>

          {/* FIX-07: WhatsApp share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Ma commande ${state?.orderNumber ?? ''} a été confirmée sur Plaza ! Je peux la suivre avec ce numéro.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-14 border-2 border-[#25D366] text-[#25D366] rounded-xl font-medium text-[16px] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Partager sur WhatsApp
          </a>

          <button
            onClick={() => navigate(`/store/${slug}`)}
            className="w-full h-14 border-2 border-[#E2E8F0] text-[#1C1917] rounded-lg font-medium hover:bg-white hover:border-[#2563EB] transition-colors"
          >
            Retour à la boutique
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
