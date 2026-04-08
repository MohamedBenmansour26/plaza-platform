import { useState } from "react";
import { ExternalLink, Camera, X, Image as ImageIcon, Copy, Share2, Check, Info, ShoppingCart, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const colorOptions = [
  { color: '#2563EB', name: 'Bleu' },
  { color: '#E8632A', name: 'Orange' },
  { color: '#16A34A', name: 'Vert' },
  { color: '#7C3AED', name: 'Violet' },
  { color: '#D97706', name: 'Ambre' },
  { color: '#EC4899', name: 'Rose' },
];

export function Store() {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#2563EB');
  const [storeOnline, setStoreOnline] = useState(true);
  const [copied, setCopied] = useState(false);
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('500');

  const [formData, setFormData] = useState({
    name: 'Boutique Fatima',
    slug: 'fatima-store',
    description: 'Boutique de mode feminine a Casablanca. Decouvrez notre collection exclusive de vetements et accessoires.',
    category: 'Mode & Vetements',
    deliveryTime: '24 - 48 heures',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Parametres de livraison mis a jour !');
    }, 1000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`plaza.ma/${formData.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Lien copie !');
  };

  const handleShare = () => {
    toast.info('Options de partage : WhatsApp, Instagram, Copier');
  };

  // Calculate example revenues
  const examplePrice1 = 350;
  const commission1 = examplePrice1 * 0.05;
  const revenue1 = examplePrice1 - commission1;

  const examplePrice2 = 600;
  const commission2 = examplePrice2 * 0.05;
  const deliveryDeduction = 30;
  const revenue2 = examplePrice2 - commission2 - deliveryDeduction;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1280px] mx-auto p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 h-16">
          <h1 className="text-2xl font-semibold text-[#1C1917]">Ma Boutique</h1>
          <button
            onClick={() => window.open(`https://plaza.ma/${formData.slug}`, '_blank')}
            className="h-10 px-4 border border-[#2563EB] text-[#2563EB] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Voir la boutique
          </button>
        </div>

        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex-1 max-w-[640px] space-y-3">
            {/* Identity Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
                Identite de la boutique
              </h2>

              <div className="space-y-4">
                {/* Store Name */}
                <div>
                  <label className="block text-[13px] text-[#1C1917] font-medium mb-1.5">
                    Nom de la boutique
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-[13px] text-[#1C1917] font-medium mb-1.5">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                  <p className="text-xs text-[#78716C] mt-1.5">plaza.ma/{formData.slug}</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[13px] text-[#1C1917] font-medium mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[13px] text-[#1C1917] font-medium mb-1.5">
                    Categorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option>Mode & Vetements</option>
                    <option>Accessoires</option>
                    <option>Maison & Decoration</option>
                    <option>Beaute & Cosmetiques</option>
                    <option>Electronique</option>
                    <option>Alimentation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
                Apparence
              </h2>

              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <label className="block text-[13px] text-[#1C1917] font-medium mb-1.5">
                    Logo de la boutique
                  </label>
                  <div className="w-[120px] h-[120px] border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#2563EB] transition-colors">
                    <Camera className="w-8 h-8 text-[#78716C] mb-1" />
                    <span className="text-[13px] text-[#78716C]">Ajouter un logo</span>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-[13px] text-[#1C1917] font-medium mb-2">
                    Couleur principale
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.color}
                        onClick={() => setSelectedColor(option.color)}
                        className="w-10 h-10 rounded-lg transition-all hover:scale-110"
                        style={{
                          backgroundColor: option.color,
                          border: selectedColor === option.color ? '2px solid #1C1917' : '2px solid transparent',
                        }}
                        title={option.name}
                      />
                    ))}
                    <button className="w-10 h-10 rounded-lg border-2 border-dashed border-[#E2E8F0] flex items-center justify-center text-[#78716C] text-lg hover:border-[#2563EB] transition-colors">
                      +
                    </button>
                  </div>
                </div>

                {/* Banner */}
                <div>
                  <label className="block text-[13px] text-[#1C1917] font-medium mb-1.5">
                    Banniere de la boutique
                  </label>
                  <div className="w-full h-[160px] border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#2563EB] transition-colors">
                    <ImageIcon className="w-8 h-8 text-[#78716C] mb-1" />
                    <span className="text-[13px] text-[#78716C]">Ajouter une banniere</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW SIMPLIFIED Delivery Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
                Parametres de livraison
              </h2>

              {/* HOW DELIVERY WORKS */}
              <div className="bg-[#EFF6FF] rounded-lg p-3 mb-5 flex gap-3">
                <Info className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1C1917] mb-1.5">
                    Comment fonctionne la livraison Plaza
                  </p>
                  <div className="space-y-1 text-xs text-[#78716C]" style={{ lineHeight: '1.6' }}>
                    <p>• Le client paie 30 MAD de frais de livraison a chaque commande</p>
                    <p>• Ces 30 MAD sont collectes par Plaza et couvrent la livraison</p>
                    <p>• Vous pouvez choisir d'offrir la livraison a partir d'un certain montant de panier — dans ce cas, les 30 MAD sont deduits de votre revenu</p>
                  </div>
                </div>
              </div>

              {/* FREE DELIVERY THRESHOLD */}
              <div className="border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center justify-between h-12">
                  <div>
                    <div className="text-sm font-medium text-[#1C1917]">
                      Offrir la livraison gratuite
                    </div>
                    <div className="text-xs text-[#78716C] mt-0.5">
                      A partir d'un montant de panier que vous definissez
                    </div>
                  </div>
                  <button
                    onClick={() => setFreeDeliveryEnabled(!freeDeliveryEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      freeDeliveryEnabled ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        freeDeliveryEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Conditional Block */}
                {freeDeliveryEnabled && (
                  <div className="animate-in slide-in-from-top-2 duration-200 pt-4 mt-4">
                    <label className="block text-[13px] font-medium text-[#1C1917] mb-2">
                      Offrir la livraison gratuite a partir de
                    </label>

                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="number"
                        value={freeDeliveryThreshold}
                        onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                        placeholder="500"
                        className="w-[120px] h-12 px-3 text-center text-xl font-semibold border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                      <span className="text-base text-[#78716C]">MAD</span>
                      <span className="text-sm text-[#78716C]">de panier</span>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-[#78716C]" />
                          <span className="text-[13px] text-[#1C1917]">
                            Panier en dessous de {freeDeliveryThreshold} MAD
                          </span>
                        </div>
                        <span className="text-[13px] text-[#78716C]">Client paie 30 MAD</span>
                      </div>

                      <div className="my-2 border-t border-[#D1FAE5]"></div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                          <span className="text-[13px] text-[#1C1917]">
                            Panier au-dessus de {freeDeliveryThreshold} MAD
                          </span>
                        </div>
                        <span className="text-[13px] font-semibold text-[#16A34A]">
                          Livraison gratuite
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#D1FAE5]">
                        <p className="text-xs text-[#78716C] italic">
                          Les 30 MAD de livraison seront deduits de votre revenu sur ces commandes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* IMPACT ON YOUR PAYOUT */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-[#1C1917] mb-3">
                  Impact sur votre revenu
                </label>

                <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg p-4">
                  <p className="text-xs text-[#78716C] uppercase tracking-wide mb-2.5">
                    Exemple — commande de {examplePrice1} MAD
                  </p>

                  <div className="space-y-2 mb-2">
                    <div className="flex justify-between text-sm">
                      <span>Prix produit(s)</span>
                      <span>{examplePrice1} MAD</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#DC2626]">
                      <span>Commission Plaza (5%)</span>
                      <span>- {commission1.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-sm text-[#78716C]">
                        <span>Frais livraison client</span>
                        <span>+ 30 MAD</span>
                      </div>
                      <p className="text-[11px] text-[#A8A29E] italic text-right">
                        (payes par le client, non deduits de vous)
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#E2E8F0] my-2"></div>

                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-[#1C1917]">Votre revenu net</span>
                    <span className="text-[#16A34A]">{revenue1.toFixed(2)} MAD</span>
                  </div>

                  {/* Show second example when free delivery is ON */}
                  {freeDeliveryEnabled && (
                    <>
                      <div className="my-3 text-center">
                        <p className="text-xs text-[#78716C]">
                          Si panier &gt; {freeDeliveryThreshold} MAD (livraison gratuite activee):
                        </p>
                      </div>

                      <div className="space-y-2 mb-2">
                        <div className="flex justify-between text-sm">
                          <span>Prix produit(s)</span>
                          <span>{examplePrice2} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#DC2626]">
                          <span>Commission Plaza (5%)</span>
                          <span>- {commission2.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#DC2626]">
                          <span>Frais livraison (pris en charge par vous)</span>
                          <span>- {deliveryDeduction} MAD</span>
                        </div>
                      </div>

                      <div className="border-t border-[#E2E8F0] my-2"></div>

                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-[#1C1917]">Votre revenu net</span>
                        <span className="text-[#16A34A]">{revenue2.toFixed(2)} MAD</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Delivery Time */}
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <label className="block text-[13px] text-[#1C1917] font-medium mb-1.5">
                  Delai de livraison estime
                </label>
                <select
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option>24 - 48 heures</option>
                  <option>2 - 3 jours</option>
                  <option>3 - 5 jours</option>
                  <option>5 - 7 jours</option>
                </select>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] pb-3 mb-4 border-b border-[#E2E8F0]">
                Statut
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#1C1917]">Boutique en ligne</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      storeOnline 
                        ? 'bg-[#F0FDF4] text-[#16A34A]' 
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                    }`}>
                      {storeOnline ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                  <button
                    onClick={() => setStoreOnline(!storeOnline)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      storeOnline ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        storeOnline ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {!storeOnline && (
                  <p className="text-xs text-[#78716C]">Votre boutique sera invisible aux clients</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-start pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-[200px] h-12 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="w-[320px]">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
              <h3 className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-4">
                Apercu de la boutique
              </h3>
              
              {/* Phone Mockup */}
              <div className="w-[240px] mx-auto border-2 border-[#E2E8F0] rounded-3xl overflow-hidden mb-3">
                <div className="bg-white h-[420px] overflow-hidden">
                  {/* Header */}
                  <div 
                    className="h-16 flex items-center px-4 gap-3"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                    <span className="text-white text-sm font-medium">{formData.name}</span>
                  </div>
                  
                  {/* Product Grid */}
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-1">
                        <div className="aspect-square bg-[#F5F5F4] rounded-lg" />
                        <div className="h-2 bg-[#F5F5F4] rounded w-3/4" />
                        <div className="h-2 bg-[#F5F5F4] rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.open(`https://plaza.ma/${formData.slug}`, '_blank')}
                className="text-[13px] text-[#2563EB] font-medium mx-auto block hover:underline"
              >
                Voir la boutique
              </button>

              {/* Share Section */}
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-2">
                  Lien de votre boutique
                </h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-[#1C1917] flex-1 truncate">
                    plaza.ma/{formData.slug}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex-shrink-0 p-1.5 hover:bg-[#F8FAFC] rounded transition-colors"
                    title="Copier"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#16A34A]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#78716C]" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full h-10 border border-[#E2E8F0] text-[#1C1917] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
