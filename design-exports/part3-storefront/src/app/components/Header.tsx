import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";

interface HeaderProps {
  storeName?: string;
  storeCategory?: string;
  storeSubtitle?: string;
  storeLogo?: string;
  showBack?: boolean;
  showCart?: boolean;
  onCartClick?: () => void;
}

export default function Header({
  storeName = "Zara Maroc",
  storeCategory = "Mode",
  storeSubtitle = "Livraison 30 MAD · Casablanca",
  storeLogo,
  showBack = false,
  showCart = true,
  onCartClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <>
              {storeLogo && (
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-[18px] leading-tight max-w-[160px] truncate">{storeName}</span>
                  <span className="px-2 py-0.5 bg-[#E2E8F0] rounded text-[11px] flex-shrink-0">
                    {storeCategory}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        {showCart && (
          <button
            onClick={onCartClick}
            className="relative w-10 h-10 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
