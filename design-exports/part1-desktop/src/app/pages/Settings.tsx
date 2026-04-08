import { useState } from "react";
import { ChevronRight, Check, Circle } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { toast } from "sonner";

export function Settings() {
  const [notifications, setNotifications] = useState({
    newOrders: true,
    delivered: true,
    support: true,
    promotions: false,
  });

  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [twoFactor, setTwoFactor] = useState(false);

  const handleDeleteAccount = () => {
    const confirmation = prompt('Tapez SUPPRIMER pour confirmer:');
    if (confirmation === 'SUPPRIMER') {
      toast.error('Compte supprime');
    } else if (confirmation) {
      toast.error('Texte incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1040px] mx-auto p-8">
        {/* Breadcrumb */}
        <div className="text-xs text-[#78716C] mb-6">
          <span>Parametres</span>
        </div>

        {/* Page Header */}
        <h1 className="text-2xl font-semibold text-[#1C1917] mb-6">Parametres</h1>

        <div className="max-w-[1040px] space-y-4">
          {/* Notifications Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-[#1C1917] mb-4">Notifications</h2>
            
            <div className="space-y-0">
              {[
                { id: 'newOrders', label: 'Nouvelles commandes', value: notifications.newOrders },
                { id: 'delivered', label: 'Commandes livrees', value: notifications.delivered },
                { id: 'support', label: 'Messages support', value: notifications.support },
                { id: 'promotions', label: 'Promotions Plaza', value: notifications.promotions },
              ].map((item, idx, arr) => (
                <div
                  key={item.id}
                  className={`h-12 flex items-center justify-between ${
                    idx < arr.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                  }`}
                >
                  <span className="text-sm text-[#1C1917]">{item.label}</span>
                  <Switch
                    checked={item.value}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.id]: checked })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      item.value ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        item.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </Switch>
                </div>
              ))}
            </div>
          </div>

          {/* Language Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-[#1C1917] mb-3">Langue</h2>
            
            <div className="space-y-0">
              {[
                { id: 'fr', label: 'Francais' },
                { id: 'ar', label: 'Arabe (العربية)' },
              ].map((lang, idx, arr) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`h-12 w-full flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors ${
                    idx < arr.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                  }`}
                >
                  <span className="text-sm text-[#1C1917]">{lang.label}</span>
                  {selectedLanguage === lang.id ? (
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-[#E2E8F0]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-[#1C1917] mb-3">Securite</h2>
            
            <div className="space-y-0">
              <button
                onClick={() => alert('Changer le mot de passe')}
                className="h-12 w-full flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors border-b border-[#F3F4F6]"
              >
                <span className="text-sm text-[#1C1917]">Changer le mot de passe</span>
                <ChevronRight className="w-4 h-4 text-[#78716C]" />
              </button>

              <div className="h-12 flex items-center justify-between">
                <span className="text-sm text-[#1C1917]">Authentification a 2 facteurs</span>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactor ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactor ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white rounded-xl border border-[#FEE2E2] shadow-sm p-6">
            <h2 className="text-base font-semibold text-[#DC2626] mb-2">Zone de danger</h2>
            <button
              onClick={handleDeleteAccount}
              className="w-full h-11 bg-white border-[1.5px] border-[#DC2626] text-[#DC2626] rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors"
            >
              Supprimer mon compte
            </button>
            <p className="text-xs text-[#78716C] mt-2">
              Cette action supprimera toutes vos donnees de facon definitive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
