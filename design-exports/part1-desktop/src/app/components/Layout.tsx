import { Outlet, NavLink, useNavigate } from "react-router";
import { Home, Grid3x3, ListOrdered, BarChart3, Store, MessageCircle, ChevronDown } from "lucide-react";

export function Layout() {
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: "Accueil", icon: Home },
    { to: "/dashboard/produits", label: "Produits", icon: Grid3x3 },
    { to: "/dashboard/commandes", label: "Commandes", icon: ListOrdered },
    { to: "/dashboard/finances", label: "Finances", icon: BarChart3 },
    { to: "/dashboard/boutique", label: "Ma Boutique", icon: Store },
    { to: "/dashboard/support", label: "Support", icon: MessageCircle },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-[#E2E8F0] flex flex-col">
        {/* Logo */}
        <div className="pt-6 px-6 pb-6">
          <div className="text-[22px] font-bold text-[#2563EB]">Plaza</div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 h-11 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#78716C] hover:bg-[#F8FAFC]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Merchant Info */}
        <div className="p-4 space-y-3">
          {/* Merchant Row */}
          <button
            onClick={() => navigate("/dashboard/compte")}
            className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-sm font-semibold">
              FA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#1C1917] truncate">Fatima Amrani</div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#78716C] flex-shrink-0" />
          </button>

          {/* Bottom Links */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <button
              onClick={() => navigate("/dashboard/parametres")}
              className="text-[#78716C] hover:underline"
            >
              Parametres
            </button>
            <span className="text-[#78716C]">/</span>
            <button
              onClick={() => {
                // Logout logic here
                alert("Deconnexion");
              }}
              className="text-[#DC2626] hover:underline"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1">
        <Outlet />
      </main>
    </div>
  );
}