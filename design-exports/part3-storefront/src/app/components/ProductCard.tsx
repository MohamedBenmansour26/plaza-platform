import { motion } from "motion/react";
import { Link } from "react-router";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  outOfStock?: boolean;
  stock?: number;
  slug: string;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discount,
  image,
  outOfStock = false,
  stock = 0,
  slug,
}: ProductCardProps) {
  const getStockDisplay = () => {
    if (outOfStock || stock === 0) return null;
    if (stock <= 5) {
      return (
        <div className="flex items-center gap-0.5 text-[10px] text-[#D97706] mb-1">
          <div className="w-1 h-1 rounded-full bg-[#D97706]" />
          <span>+{stock}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-0.5 text-[10px] text-[#16A34A] mb-1">
        <div className="w-1 h-1 rounded-full bg-[#16A34A]" />
        <span>Stock</span>
      </div>
    );
  };

  const content = (
    <motion.div
      whileHover={!outOfStock ? { y: -2 } : {}}
      className={`bg-white rounded-lg overflow-hidden border border-[#E2E8F0] flex flex-col ${outOfStock ? "opacity-60" : ""}`}
      style={{ aspectRatio: '0.75' }}
    >
      <div className="relative w-full flex-1">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {discount && !outOfStock && (
          <div className="absolute top-1.5 right-1.5 bg-[#E8632A] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
            -{discount}%
          </div>
        )}
        {outOfStock && (
          <div className="absolute top-1.5 right-1.5 bg-[#DC2626] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
            Rupture
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col justify-between">
        <h3 className="font-medium text-[12px] line-clamp-2 leading-tight mb-1">{name}</h3>
        <div>
          {getStockDisplay()}
        </div>
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="font-bold text-[13px]">{price}</span>
          {originalPrice && (
            <span className="text-[10px] text-[#A8A29E] line-through">{originalPrice}</span>
          )}
        </div>
        {/* FIX-04: h-7 → h-11 (44px tap target) */}
        <button
          disabled={outOfStock}
          className={`w-full h-11 rounded text-[11px] font-medium transition-colors ${
            outOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
          }`}
        >
          Ajouter
        </button>
      </div>
    </motion.div>
  );

  if (outOfStock) {
    return content;
  }

  return (
    <Link to={`/store/${slug}/produit/${id}`} className="block">
      {content}
    </Link>
  );
}
