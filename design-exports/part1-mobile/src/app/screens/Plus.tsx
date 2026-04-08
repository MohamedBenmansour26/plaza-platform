import {
  User,
  Store,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { useState } from "react";

export function Plus() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      icon: User,
      label: "Mon compte",
      path: "/dashboard/compte",
      color: "#78716C",
    },
    {
      icon: Store,
      label: "Ma boutique",
      path: "/dashboard/boutique",
      color: "#78716C",
    },
    {
      icon: Settings,
      label: "Paramètres",
      path: "/dashboard/parametres",
      color: "#78716C",
    },
    {
      icon: HelpCircle,
      label: "Aide & Support",
      path: "/dashboard/support",
      color: "#78716C",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="max-w-[375px] mx-auto">
        {/* Top Bar */}
        <div className="bg-white px-4 py-4">
          <h1 className="text-[18px] font-semibold text-[#1C1917]">Plus</h1>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path}>
              <div className="bg-white rounded-lg h-14 px-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <item.icon size={24} style={{ color: item.color }} />
                  <span className="text-[14px] font-medium text-[#1C1917]">
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={20} className="text-[#A8A29E]" />
              </div>
            </Link>
          ))}

          {/* Logout */}
          <div
            onClick={() => setShowLogoutModal(true)}
            className="bg-white rounded-lg h-14 px-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <LogOut size={24} className="text-[#DC2626]" />
              <span className="text-[14px] font-medium text-[#DC2626]">
                Déconnexion
              </span>
            </div>
            <ChevronRight size={20} className="text-[#A8A29E]" />
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-[18px] font-semibold text-[#1C1917] mb-4">
              Déconnexion
            </h3>
            <p className="text-[14px] text-[#78716C] mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-10 border border-[#E2E8F0] text-[#1C1917] text-[14px] font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors"
              >
                Annuler
              </button>
              <button className="flex-1 h-10 bg-[#DC2626] text-white text-[14px] font-medium rounded-lg hover:bg-[#b91c1c] transition-colors">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
