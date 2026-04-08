import { ArrowLeft, Camera, X, Plus, Info, ShoppingCart, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export function Store() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState("#2563EB");
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("500");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const colors = [
    "#2563EB",
    "#E8632A",
    "#16A34A",
    "#7C3AED",
    "#D97706",
    "#EC4899",
  ];

  const handleSave = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
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
            Ma boutique
          </h1>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Preview Banner */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-[12px] text-[#78716C] uppercase mb-2">
              Votre boutique
            </div>
            <a
              href="#"
              className="text-[14px] text-[#2563EB] underline block mb-3"
            >
              plaza.ma/fatima-store
            </a>
            <button className="w-full h-8 bg-white border border-[#E2E8F0] text-[#1C1917] text-[13px] rounded-lg hover:bg-[#F5F5F4] transition-colors">
              Voir la boutique
            </button>
          </div>

          {/* Identity Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917]">
              Identité
            </h3>
            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Nom de la boutique
              </label>
              <input
                type="text"
                defaultValue="Boutique Fatima"
                className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                defaultValue="fatima-store"
                className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
              <div className="text-[12px] text-[#78716C] mt-1">
                plaza.ma/fatima-store
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Description
              </label>
              <textarea
                rows={3}
                defaultValue="Boutique de mode féminine à Casablanca..."
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB] resize-none"
              />
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917]">
              Apparence
            </h3>
            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Logo
              </label>
              <div className="w-20 h-20 border-2 border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#2563EB] transition-colors">
                <Camera size={24} className="text-[#A8A29E]" />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-3">
                Couleur principale
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-[#1C1917]"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button className="w-10 h-10 border-2 border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center text-[#A8A29E] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h3 className="text-[16px] font-semibold text-[#1C1917] pb-3 border-b border-[#E2E8F0]">
              Paramètres de livraison
            </h3>

            {/* How Delivery Works */}
            <div className="bg-[#EFF6FF] rounded-lg p-3 flex gap-3 mb-5">
              <Info size={16} className="text-[#2563EB] flex-shrink-0 mt-1" />
              <div>
                <p className="text-[13px] font-semibold text-[#1C1917] mb-1.5">
                  Comment fonctionne la livraison Plaza
                </p>
                <div className="space-y-1 text-[12px] text-[#78716C]" style={{ lineHeight: 1.6 }}>
                  <p>• Le client paie 30 MAD de frais de livraison à chaque commande</p>
                  <p>• Ces 30 MAD sont collectés par Plaza et couvrent la livraison</p>
                  <p>• Vous pouvez choisir d'offrir la livraison à partir d'un certain montant de panier — dans ce cas, les 30 MAD sont déduits de votre revenu</p>
                </div>
              </div>
            </div>

            {/* Free Delivery Threshold Toggle */}
            <div className="border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center justify-between h-12">
                <div>
                  <p className="text-[14px] font-medium text-[#1C1917]">
                    Offrir la livraison gratuite
                  </p>
                  <p className="text-[12px] text-[#78716C] mt-0.5">
                    À partir d'un montant de panier que vous définissez
                  </p>
                </div>
                <button
                  onClick={() => setFreeDeliveryEnabled(!freeDeliveryEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    freeDeliveryEnabled ? "bg-[#16A34A]" : "bg-[#E2E8F0]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      freeDeliveryEnabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Conditional Threshold Block */}
              {freeDeliveryEnabled && (
                <div className="mt-4 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[13px] font-medium text-[#1C1917]">
                    Offrir la livraison gratuite à partir de
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={freeDeliveryThreshold}
                      onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                      placeholder="500"
                      className="w-[120px] h-12 px-3 text-center text-[20px] font-semibold border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                    />
                    <span className="text-[16px] text-[#78716C]">MAD</span>
                    <span className="text-[14px] text-[#78716C]">de panier</span>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3">
                    {/* Row 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart size={16} className="text-[#78716C]" />
                        <span className="text-[13px] text-[#1C1917]">
                          Panier en dessous de {freeDeliveryThreshold} MAD
                        </span>
                      </div>
                      <span className="text-[13px] text-[#78716C]">
                        Client paie 30 MAD
                      </span>
                    </div>

                    <div className="h-px bg-[#D1FAE5] my-2"></div>

                    {/* Row 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-[#16A34A]" />
                        <span className="text-[13px] text-[#1C1917]">
                          Panier au-dessus de {freeDeliveryThreshold} MAD
                        </span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#16A34A]">
                        Livraison gratuite
                      </span>
                    </div>

                    {/* Note */}
                    <div className="mt-2 pt-2 border-t border-[#D1FAE5]">
                      <p className="text-[12px] text-[#78716C] italic">
                        Les 30 MAD de livraison seront déduits de votre revenu sur ces commandes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Impact on Your Payout */}
            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-3">
                Impact sur votre revenu
              </label>

              <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg p-4 space-y-3">
                <p className="text-[12px] text-[#78716C] uppercase mb-2.5">
                  Exemple — commande de 350 MAD
                </p>

                <div className="flex justify-between text-[14px]">
                  <span className="text-[#1C1917]">Prix produit(s)</span>
                  <span className="text-[#1C1917]">350 MAD</span>
                </div>

                <div className="flex justify-between text-[14px]">
                  <span className="text-[#DC2626]">Commission Plaza (5%)</span>
                  <span className="text-[#DC2626]">- 17,50 MAD</span>
                </div>

                <div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#78716C]">Frais livraison client</span>
                    <span className="text-[#78716C]">+ 30 MAD</span>
                  </div>
                  <p className="text-[11px] text-[#A8A29E] italic mt-1 ml-4">
                    (payés par le client, non déduits de vous)
                  </p>
                </div>

                <div className="h-px bg-[#E2E8F0]"></div>

                <div className="flex justify-between text-[14px] font-semibold">
                  <span className="text-[#1C1917]">Votre revenu net</span>
                  <span className="text-[#16A34A]">332,50 MAD</span>
                </div>

                {/* Show second example when free delivery is ON */}
                {freeDeliveryEnabled && (
                  <>
                    <div className="text-center my-3">
                      <p className="text-[12px] text-[#78716C]">
                        Si panier &gt; {freeDeliveryThreshold} MAD (livraison gratuite activée):
                      </p>
                    </div>

                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#1C1917]">Prix produit(s)</span>
                      <span className="text-[#1C1917]">600 MAD</span>
                    </div>

                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#DC2626]">Commission Plaza (5%)</span>
                      <span className="text-[#DC2626]">- 30 MAD</span>
                    </div>

                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#DC2626]">
                        Frais livraison (pris en charge par vous)
                      </span>
                      <span className="text-[#DC2626]">- 30 MAD</span>
                    </div>

                    <div className="h-px bg-[#E2E8F0]"></div>

                    <div className="flex justify-between text-[14px] font-semibold">
                      <span className="text-[#1C1917]">Votre revenu net</span>
                      <span className="text-[#16A34A]">540 MAD</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 max-w-[375px] mx-auto">
          <button
            onClick={handleSave}
            className="w-full h-12 bg-[#2563EB] text-white text-[16px] font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors"
          >
            Enregistrer
          </button>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-4 left-0 right-0 bg-[#D1FAE5] border border-[#16A34A] text-[#16A34A] text-[14px] font-semibold rounded-lg p-3 max-w-[343px] mx-auto flex items-center gap-2 shadow-lg z-50">
            <Check size={16} />
            <span>Paramètres de livraison mis à jour !</span>
          </div>
        )}
      </div>
    </div>
  );
}