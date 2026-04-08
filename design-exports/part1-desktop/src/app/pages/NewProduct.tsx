import { useState } from "react";
import { useNavigate } from "react-router";
import { Camera } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { toast } from "sonner";
import { PriceCalculator } from "../components/PriceCalculator";

export function NewProduct() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    nameFr: "",
    nameAr: "",
    description: "",
    price: "",
    stock: "0",
  });

  const handlePublish = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nameFr.trim()) {
      newErrors.nameFr = "Ce champ est obligatoire";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Le prix doit etre superieur a 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      toast.success('Produit publie !');
      navigate('/dashboard/produits');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1040px] mx-auto p-8">
        {/* Breadcrumb */}
        <div className="text-xs text-[#78716C] mb-6">
          <button onClick={() => navigate('/dashboard/produits')} className="hover:underline">
            Produits
          </button>
          {' > '}
          <span>Nouveau produit</span>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="h-10 px-4 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
          >
            {isPublishing ? 'Publication...' : 'Publier le produit'}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] mb-4">Informations</h2>

              <div className="space-y-4">
                {/* Name FR */}
                <div>
                  <label className="block text-[13px] text-[#78716C] mb-1.5">
                    Nom du produit (FR)
                  </label>
                  <input
                    type="text"
                    value={formData.nameFr}
                    onChange={(e) => {
                      setFormData({ ...formData, nameFr: e.target.value });
                      setErrors({ ...errors, nameFr: "" });
                    }}
                    className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] ${
                      errors.nameFr ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    }`}
                  />
                  {errors.nameFr && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.nameFr}</p>
                  )}
                </div>

                {/* Name AR */}
                <div>
                  <label className="block text-[13px] text-[#78716C] mb-1.5">
                    Nom du produit (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="اسم المنتج"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                  <p className="text-xs text-[#78716C] mt-1">(ecriture de droite a gauche)</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[13px] text-[#78716C] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[13px] text-[#78716C] mb-1.5">
                    Stock disponible
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, stock: String(Math.max(0, parseInt(formData.stock || "0") - 1)) })}
                      className="w-8 h-8 border border-[#E2E8F0] rounded text-[#78716C] hover:bg-[#F8FAFC]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-24 h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm text-center focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, stock: String(parseInt(formData.stock || "0") + 1) })}
                      className="w-8 h-8 border border-[#E2E8F0] rounded text-[#78716C] hover:bg-[#F8FAFC]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[320px] space-y-4">
            {/* Price Calculator */}
            <PriceCalculator
              value={formData.price || "350"}
              onChange={(price) => {
                setFormData({ ...formData, price });
                setErrors({ ...errors, price: "" });
              }}
            />

            {/* Photo Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1C1917] mb-3">Photo du produit</h3>
              <div className="w-full h-[200px] bg-[#F5F5F4] rounded-lg flex flex-col items-center justify-center gap-2 mb-2 cursor-pointer hover:bg-[#EEEEEE] transition-colors">
                <Camera className="w-8 h-8 text-[#A8A29E]" />
                <span className="text-[13px] text-[#2563EB]">Ajouter une photo</span>
              </div>
              <p className="text-xs text-[#A8A29E]">Formats: JPG, PNG — Max 5 Mo</p>
            </div>

            {/* Visibility Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1C1917]">Visible sur la boutique</span>
                <Switch
                  checked={isVisible}
                  onCheckedChange={setIsVisible}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isVisible ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>
              <p className="text-xs text-[#78716C] mt-1">Ce produit sera visible par vos clients.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}