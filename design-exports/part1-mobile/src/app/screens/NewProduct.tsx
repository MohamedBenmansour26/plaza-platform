import { ArrowLeft, Camera, Info } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Switch } from "../components/ui/switch";

export function NewProduct() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [showError, setShowError] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("350");
  const [showPriceError, setShowPriceError] = useState(false);

  const calculateRevenue = () => {
    const priceNum = parseFloat(price) || 0;
    if (priceNum < 1) {
      return { price: 0, commission: "—", revenue: "—" };
    }
    const commission = priceNum * 0.05;
    const revenue = priceNum - commission;
    return {
      price: priceNum,
      commission: commission.toFixed(2),
      revenue: revenue.toFixed(2),
    };
  };

  const calc = calculateRevenue();

  const handlePriceChange = (value: string) => {
    setPrice(value);
    const priceNum = parseFloat(value);
    setShowPriceError(priceNum > 0 && priceNum < 1);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setShowError(true);
    } else {
      setShowError(false);
      // Handle submit
    }
  };

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
            Nouveau produit
          </h1>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Product Photo */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-[200px] bg-[#F5F5F4] flex items-center justify-center">
              <Camera size={48} className="text-[#A8A29E]" />
            </div>
            <div className="text-center py-2">
              <button className="text-[14px] text-[#2563EB] hover:underline">
                Changer la photo
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Nom du produit (FR)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full h-11 px-3 border rounded-lg text-[14px] focus:outline-none ${
                  showError && !name.trim()
                    ? "border-[#DC2626] focus:border-[#DC2626]"
                    : "border-[#E2E8F0] focus:border-[#2563EB]"
                }`}
              />
              {showError && !name.trim() && (
                <p className="text-[12px] text-[#DC2626] mt-1">
                  Ce champ est obligatoire
                </p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Nom du produit (AR)
              </label>
              <input
                type="text"
                placeholder="اسم المنتج"
                dir="rtl"
                className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB] resize-none"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Stock disponible
              </label>
              <input
                type="number"
                className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-[14px] font-medium text-[#1C1917]">
                Visible sur la boutique
              </label>
              <Switch checked={isVisible} onCheckedChange={setIsVisible} />
            </div>
          </div>

          {/* Pricing Calculator Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#2563EB]">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-1">
              Prix du produit
            </h3>
            <p className="text-[13px] text-[#78716C] mb-4">
              Définissez le prix que le client verra sur votre boutique
            </p>

            {/* Price Input */}
            <div>
              <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">
                Prix pour le client
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={`w-full h-14 pl-4 pr-20 border rounded-lg text-[24px] font-semibold text-[#1C1917] focus:outline-none ${
                    showPriceError
                      ? "border-[#DC2626] focus:border-[#DC2626]"
                      : "border-[#E2E8F0] focus:border-2 focus:border-[#2563EB]"
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#78716C]">
                  MAD
                </span>
              </div>
              {showPriceError && (
                <p className="text-[12px] text-[#DC2626] mt-1">
                  Le prix minimum est 1 MAD
                </p>
              )}
            </div>

            {/* Revenue Breakdown */}
            <div className="mt-3 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg p-3 space-y-2.5">
              <p className="text-[12px] text-[#78716C] uppercase mb-2.5">
                Votre revenu sur ce produit
              </p>

              <div className="flex justify-between text-[14px]">
                <span className="text-[#1C1917]">Prix client</span>
                <span className="text-[#1C1917]">{calc.price} MAD</span>
              </div>

              <div className="flex justify-between text-[14px] text-[#DC2626]">
                <span>Commission Plaza (5%)</span>
                <span>- {calc.commission} MAD</span>
              </div>

              <div className="h-px bg-[#E2E8F0]"></div>

              <div className="flex justify-between text-[14px] font-semibold">
                <span className="text-[#1C1917]">Votre revenu net</span>
                <span className="text-[#16A34A]">{calc.revenue} MAD</span>
              </div>

              <div className="h-px border-t border-dashed border-[#E2E8F0] my-2.5"></div>

              <div className="flex gap-1.5 items-start">
                <Info size={16} className="text-[#78716C] flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#78716C]" style={{ lineHeight: 1.5 }}>
                  Les 30 MAD de livraison sont facturés par commande et non par produit. Ils sont visibles dans le récapitulatif de vos revenus.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 max-w-[375px] mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full h-12 bg-[#2563EB] text-white text-[16px] font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors"
          >
            Publier le produit
          </button>
        </div>
      </div>
    </div>
  );
}