import { Home, Grid3x3, List, TrendingUp, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router";

export function BottomNav() {
  const location = useLocation();

  const tabs = [
    { path: "/dashboard", icon: Home, label: "Accueil" },
    { path: "/dashboard/produits", icon: Grid3x3, label: "Produits" },
    { path: "/dashboard/commandes", icon: List, label: "Commandes" },
    { path: "/dashboard/finances", icon: TrendingUp, label: "Finances" },
    { path: "/dashboard/plus", icon: MoreHorizontal, label: "Plus" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] h-16 flex items-center justify-around max-w-[375px] mx-auto z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1"
          >
            <Icon
              size={20}
              className={active ? "text-[#2563EB]" : "text-[#78716C]"}
              strokeWidth={2}
            />
            <span
              className={`text-[10px] ${
                active ? "text-[#2563EB] font-semibold" : "text-[#78716C]"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
