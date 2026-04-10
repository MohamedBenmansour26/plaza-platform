import { useState } from "react";
import { ArrowLeft, Phone, Check, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useCart } from "../contexts/CartContext";

const statusSteps = [
  {
    id: 1,
    label: "Commande reçue",
    time: "09h14",
    completed: true,
    current: false,
  },
  {
    id: 2,
    label: "En cours de confirmation",
    time: "09h15",
    completed: false,
    current: true,
  },
  {
    id: 3,
    label: "En livraison",
    time: null,
    completed: false,
    current: false,
  },
  {
    id: 4,
    label: "Livrée",
    time: null,
    completed: false,
    current: false,
  },
];

export default function OrderStatus() {
  const navigate = useNavigate();
  const { id } = useParams(); // order number from URL
  const { state } = useLocation() as { state: {
    name?: string; phone?: string; address?: string;
  } | null };
  const { items, total } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const deliveryFee = total >= 500 ? 0 : 30;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-2">
          <h1 className="font-bold text-[16px]">Commande #{id}</h1>
          <p className="text-[12px] text-[#78716C]">Zara Maroc</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6 space-y-6"
      >
        <div className="bg-white rounded-xl p-5">
          {/* FIX-18: Actualiser button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[16px]">État de la commande</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[13px] text-[#2563EB] font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>
          <div className="space-y-0">
            {statusSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed
                        ? "bg-[#16A34A]"
                        : step.current
                          ? "bg-[#2563EB] animate-pulse"
                          : "bg-gray-200"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    ) : step.current ? (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    ) : null}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-16 ${step.completed ? "bg-[#16A34A]" : "bg-gray-200"}`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-16">
                  <div className="flex items-baseline justify-between">
                    <h3
                      className={`font-medium text-[15px] ${
                        step.completed || step.current ? "text-[#1C1917]" : "text-[#A8A29E]"
                      }`}
                    >
                      {step.label}
                    </h3>
                    {step.time && (
                      <span
                        className={`text-[13px] ${
                          step.completed || step.current ? "text-[#78716C]" : "text-[#A8A29E]"
                        }`}
                      >
                        {step.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-[15px]">Informations client</h2>
          <div className="text-[14px] space-y-1">
            <p className="font-medium">{state?.name ?? "—"} · {state?.phone ?? "—"}</p>
            <p className="text-[#78716C]">{state?.address ?? "Adresse non renseignée"}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-[15px]">Articles commandés</h2>
          <div className="space-y-2">
            {/* FIX-19: removed .slice(0,3) */}
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{item.name}</p>
                  <p className="text-[12px] text-[#78716C]">Qté {item.quantity}</p>
                </div>
                <span className="text-[13px] font-medium">{item.price * item.quantity} MAD</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E2E8F0] pt-3 space-y-1.5">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#78716C]">Total</span>
              <span className="font-bold">{total} MAD</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#78716C]">Livraison</span>
              <span className="text-[#16A34A] font-medium">
                {deliveryFee === 0 ? "Gratuite" : `${deliveryFee} MAD`}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-6">
          {/* FIX-14: "Contacter la boutique" → WhatsApp link */}
          {/* TODO: dynamic store WhatsApp */}
          <a
            href="https://wa.me/212661234567"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 border-2 border-[#2563EB] text-[#2563EB] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#EFF6FF] transition-colors"
          >
            <Phone className="w-4 h-4" />
            Contacter la boutique
          </a>
          {/* FIX-14: "Besoin d'aide ? Contacter Plaza" → mailto */}
          <a
            href="mailto:support@plaza.ma"
            className="w-full text-[13px] text-[#78716C] py-2 underline text-center block"
          >
            Besoin d'aide ? Contacter Plaza
          </a>
        </div>
      </motion.div>
    </div>
  );
}
