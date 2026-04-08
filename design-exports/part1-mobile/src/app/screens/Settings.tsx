import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Switch } from "../components/ui/switch";

export function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    newOrders: true,
    delivered: true,
    support: true,
    promotions: false,
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[375px] mx-auto pb-6">
        {/* Top Bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 p-2 -ml-2"
          >
            <ArrowLeft size={20} className="text-[#1C1917]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1C1917]">
            Paramètres
          </h1>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between h-12">
                <span className="text-[14px] text-[#1C1917]">
                  Nouvelles commandes
                </span>
                <Switch
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newOrders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between h-12">
                <span className="text-[14px] text-[#1C1917]">
                  Commandes livrées
                </span>
                <Switch
                  checked={notifications.delivered}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, delivered: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between h-12">
                <span className="text-[14px] text-[#1C1917]">
                  Messages support
                </span>
                <Switch
                  checked={notifications.support}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, support: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between h-12">
                <span className="text-[14px] text-[#1C1917]">
                  Promotions Plaza
                </span>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, promotions: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              Langue
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setLanguage("fr")}
                className="flex items-center justify-between w-full h-12 hover:bg-[#F5F5F4] rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">🇫🇷</span>
                  <span className="text-[14px] text-[#1C1917]">Français</span>
                </div>
                {language === "fr" && (
                  <Check size={20} className="text-[#2563EB]" />
                )}
              </button>
              <button
                onClick={() => setLanguage("ar")}
                className="flex items-center justify-between w-full h-12 hover:bg-[#F5F5F4] rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">🇲🇦</span>
                  <span className="text-[14px] text-[#1C1917]">
                    Arabe (العربية)
                  </span>
                </div>
                {language === "ar" && (
                  <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0]" />
                )}
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              Sécurité
            </h3>
            <div className="space-y-2">
              <button className="flex items-center justify-between w-full h-12 hover:bg-[#F5F5F4] rounded-lg px-2 transition-colors">
                <span className="text-[14px] text-[#1C1917]">
                  Changer le mot de passe
                </span>
                <ChevronRight size={20} className="text-[#A8A29E]" />
              </button>
              <div className="flex items-center justify-between h-12 px-2">
                <span className="text-[14px] text-[#1C1917]">
                  Authentification à 2 facteurs
                </span>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
            </div>
          </div>

          {/* Danger Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-[#FEE2E2]">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              Danger
            </h3>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-between w-full h-12 hover:bg-[#FEF2F2] rounded-lg px-2 transition-colors"
            >
              <span className="text-[14px] text-[#DC2626]">
                Supprimer mon compte
              </span>
              <ChevronRight size={20} className="text-[#DC2626]" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-[18px] font-semibold text-[#1C1917] mb-4">
              Supprimer mon compte
            </h3>
            <p className="text-[14px] text-[#78716C] mb-4">
              Cette action est irréversible. Tapez{" "}
              <strong>SUPPRIMER</strong> pour confirmer.
            </p>
            <input
              type="text"
              placeholder="SUPPRIMER"
              className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#DC2626] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-10 border border-[#E2E8F0] text-[#1C1917] text-[14px] font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors"
              >
                Annuler
              </button>
              <button className="flex-1 h-10 bg-[#DC2626] text-white text-[14px] font-medium rounded-lg hover:bg-[#b91c1c] transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
