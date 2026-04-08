import { ArrowLeft, User, Phone, MapPin, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export function OrderDetail() {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[375px] mx-auto pb-24">
        {/* Top Bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 p-2 -ml-2"
          >
            <ArrowLeft size={20} className="text-[#1C1917]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1C1917]">
            Commande #PLZ-042
          </h1>
        </div>

        {/* Status Banner */}
        <div className="bg-[#FFF7ED] h-11 flex items-center justify-center">
          <span className="text-[14px] font-medium text-[#E8632A]">
            En attente de confirmation
          </span>
        </div>

        {/* Client Section */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              Client
            </h3>
            <div className="flex items-center gap-3">
              <User size={18} className="text-[#78716C]" />
              <span className="text-[14px] font-semibold text-[#1C1917]">
                Fatima Zahra Benali
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-[#78716C]" />
              <a
                href="tel:0612345678"
                className="text-[14px] text-[#2563EB] hover:underline"
              >
                06 12 34 56 78
              </a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-[#78716C] mt-0.5" />
              <span className="text-[14px] text-[#78716C]">
                12 Rue Hassan II, Casablanca
              </span>
            </div>
          </div>

          {/* Articles Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-3">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              Articles commandés
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#F5F5F4]" />
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-[#1C1917]">
                    Robe d'été
                  </div>
                  <div className="text-[12px] text-[#78716C]">x1</div>
                </div>
                <div className="text-[14px] font-semibold text-[#1C1917]">
                  250 MAD
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#F5F5F4]" />
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-[#1C1917]">
                    Sac cuir
                  </div>
                  <div className="text-[12px] text-[#78716C]">x2</div>
                </div>
                <div className="text-[14px] font-semibold text-[#1C1917]">
                  600 MAD
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#78716C]">Sous-total</span>
                  <span className="text-[#1C1917]">850 MAD</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#78716C]">Livraison</span>
                  <span className="text-[#E8632A]">29 MAD</span>
                </div>
                <div className="border-t-2 border-[#E2E8F0] pt-2 flex justify-between">
                  <span className="text-[16px] font-semibold text-[#1C1917]">
                    Total
                  </span>
                  <span className="text-[20px] font-semibold text-[#1C1917]">
                    879 MAD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-3 flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-[12px] bg-[#F3F4F6] text-[#6B7280]">
              COD
            </div>
            <span className="text-[14px] text-[#1C1917]">
              Paiement à la livraison
            </span>
          </div>

          {/* Delivery Status */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-3">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-4">
              Statut de livraison
            </h3>
            <div className="space-y-6">
              {/* Step 1 - Done */}
              <div className="flex gap-3">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                  <div className="absolute top-6 left-3 w-0.5 h-8 bg-[#E2E8F0]" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-[#1C1917]">
                    Commande reçue
                  </div>
                  <div className="text-[12px] text-[#78716C] mt-0.5">
                    Il y a 2h
                  </div>
                </div>
              </div>

              {/* Step 2 - Current */}
              <div className="flex gap-3">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-[#2563EB] relative">
                    <div className="absolute inset-0 rounded-full bg-[#2563EB] animate-ping opacity-75" />
                  </div>
                  <div className="absolute top-6 left-3 w-0.5 h-8 bg-[#E2E8F0]" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#2563EB]">
                    En attente de confirmation
                  </div>
                </div>
              </div>

              {/* Step 3 - Future */}
              <div className="flex gap-3">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full border-2 border-[#E2E8F0] bg-white" />
                  <div className="absolute top-6 left-3 w-0.5 h-8 bg-[#E2E8F0]" />
                </div>
                <div>
                  <div className="text-[14px] text-[#A8A29E]">Expédiée</div>
                </div>
              </div>

              {/* Step 4 - Future */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#E2E8F0] bg-white" />
                <div>
                  <div className="text-[14px] text-[#A8A29E]">Livrée</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 max-w-[375px] mx-auto">
          <div className="flex gap-2">
            <button className="flex-1 h-12 bg-[#2563EB] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors">
              Confirmer
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 h-12 bg-white border-[1.5px] border-[#DC2626] text-[#DC2626] text-[14px] font-semibold rounded-lg hover:bg-[#FEF2F2] transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-[18px] font-semibold text-[#1C1917] mb-4">
              Annuler cette commande ?
            </h3>
            <p className="text-[14px] text-[#78716C] mb-6">
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-10 border border-[#E2E8F0] text-[#1C1917] text-[14px] font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors"
              >
                Non
              </button>
              <button className="flex-1 h-10 bg-[#DC2626] text-white text-[14px] font-medium rounded-lg hover:bg-[#b91c1c] transition-colors">
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
