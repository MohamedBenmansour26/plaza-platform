import { Search, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { useState } from "react";

export function Products() {
  const [filter, setFilter] = useState("Tous");

  const products = [
    {
      id: "1",
      name: "Robe d'été fleurie",
      price: "350 MAD",
      stock: "12 en stock",
      visible: true,
      outOfStock: false,
    },
    {
      id: "2",
      name: "Sac à main cuir",
      price: "580 MAD",
      stock: "3 en stock",
      visible: true,
      outOfStock: false,
    },
    {
      id: "3",
      name: "Sandales dorées",
      price: "220 MAD",
      stock: "0 en stock",
      visible: true,
      outOfStock: true,
    },
    {
      id: "4",
      name: "Foulard soie",
      price: "180 MAD",
      stock: "8 en stock",
      visible: false,
      outOfStock: false,
    },
    {
      id: "5",
      name: "Ceinture brodée",
      price: "120 MAD",
      stock: "15 en stock",
      visible: true,
      outOfStock: false,
    },
  ];

  const filters = ["Tous", "En stock", "Rupture", "Masqués"];

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="max-w-[375px] mx-auto">
        {/* Top Bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-between shadow-sm">
          <h1 className="text-[18px] font-semibold text-[#1C1917]">
            Mes produits
          </h1>
          <Link to="/dashboard/produits/nouveau">
            <button className="h-9 px-4 bg-[#2563EB] text-white text-[14px] rounded-lg hover:bg-[#1d4ed8] transition-colors">
              Ajouter
            </button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]"
            />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full h-10 pl-10 pr-4 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 h-8 rounded-full text-[13px] whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#78716C] border border-[#E2E8F0] hover:bg-[#F5F5F4]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="px-4 space-y-2">
          {products.map((product) => (
            <Link key={product.id} to={`/dashboard/produits/${product.id}`}>
              <div className="bg-white rounded-xl p-3 shadow-sm flex gap-3 cursor-pointer hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg bg-[#F5F5F4] flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#1C1917]">
                    {product.name}
                  </div>
                  <div className="text-[14px] font-semibold text-[#1C1917] mt-1">
                    {product.price}
                  </div>
                  {product.outOfStock ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[12px] bg-[#FEE2E2] text-[#DC2626] mt-1">
                      Rupture
                    </span>
                  ) : (
                    <div className="text-[12px] text-[#78716C] mt-1">
                      {product.stock}
                    </div>
                  )}
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end justify-between">
                  {!product.outOfStock && (
                    <>
                      {product.visible ? (
                        <Eye size={18} className="text-[#2563EB]" />
                      ) : (
                        <EyeOff size={18} className="text-[#78716C]" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
