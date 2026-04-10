import { useState } from "react";
import { Info, Package } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import StoreInfoSheet from "../components/StoreInfoSheet";
import { useParams } from "react-router";

const categories = ["Tous", "Robes", "Hauts", "Pantalons", "Accessoires"];

const products = [
  {
    id: "1",
    name: "Robe Caftan Brodée",
    price: 450,
    originalPrice: 600,
    discount: 25,
    image: "https://images.unsplash.com/photo-1649109670360-32498fda05b2?w=600",
    stock: 3,
  },
  {
    id: "2",
    name: "Djellaba Femme Soie",
    price: 380,
    image: "https://images.unsplash.com/photo-1629936059739-3b6d27375837?w=600",
    stock: 12,
  },
  {
    id: "3",
    name: "Sac Cuir Artisanal",
    price: 290,
    originalPrice: 350,
    discount: 17,
    image: "https://images.unsplash.com/photo-1758959791346-66e1e8ab21ea?w=600",
    stock: 7,
  },
  {
    id: "4",
    name: "Sandales Traditionnelles",
    price: 0,
    image: "https://images.unsplash.com/photo-1645944235766-54aade0e09bf?w=600",
    outOfStock: true,
    stock: 0,
  },
  {
    id: "5",
    name: "Ceinture Tissée",
    price: 120,
    image: "https://images.unsplash.com/photo-1630084305900-b297cff3a608?w=600",
    stock: 15,
  },
  {
    id: "6",
    name: "Foulard Soie",
    price: 180,
    image: "https://images.unsplash.com/photo-1600166931532-604e927c794b?w=600",
    stock: 8,
  },
  {
    id: "7",
    name: "Babouches Cuir",
    price: 250,
    image: "https://images.unsplash.com/photo-1603204706569-b807e6abb4ea?w=600",
    stock: 5,
  },
  {
    id: "8",
    name: "Collier Traditionnel",
    price: 320,
    image: "https://images.unsplash.com/photo-1635311621764-90a80c7a8e1e?w=600",
    stock: 10,
  },
  {
    id: "9",
    name: "Tunique Brodée",
    price: 280,
    image: "https://images.unsplash.com/photo-1647780114723-9141344174c9?w=600",
    stock: 6,
  },
  {
    id: "10",
    name: "Écharpe Laine",
    price: 150,
    originalPrice: 200,
    discount: 25,
    image: "https://images.unsplash.com/photo-1600166931602-3b261ecec326?w=600",
    stock: 4,
  },
  {
    id: "11",
    name: "Sac à Main Tissé",
    price: 195,
    image: "https://images.unsplash.com/photo-1681302183941-9e4520a960fb?w=600",
    stock: 9,
  },
  {
    id: "12",
    name: "Pantalon Sarouel",
    price: 340,
    image: "https://images.unsplash.com/photo-1629932426024-4578d687ada3?w=600",
    stock: 11,
  },
];

export default function StoreHome() {
  const { slug } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [cartOpen, setCartOpen] = useState(false);
  const [storeInfoOpen, setStoreInfoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header onCartClick={() => setCartOpen(true)} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[200px] w-full overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1753740022847-ef5eed14e085?w=1200&h=400&fit=crop"
          alt="Store banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-bold text-[24px]">Zara Maroc</h1>
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-[12px]">
              Mode
            </span>
          </div>
          <button
            onClick={() => setStoreInfoOpen(true)}
            className="flex items-center gap-1 text-[13px] text-white/90 hover:text-white"
          >
            <Info className="w-4 h-4" />
            Voir les infos
          </button>
        </div>
      </motion.div>

      <div className="px-4 py-4 space-y-4">
        <Link
          to="/track"
          className="flex items-center gap-3 p-3 bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl hover:bg-[#DBEAFE] transition-colors"
        >
          <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-[15px] text-[#1C1917]">Suivre ma commande</div>
            <div className="text-[13px] text-[#78716C]">Entrez votre numéro de suivi</div>
          </div>
        </Link>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 h-9 rounded-full text-[14px] font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                selectedCategory === category
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#1C1917] border border-[#E2E8F0]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <ProductCard {...product} slug={slug || "zara-maroc"} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <StoreInfoSheet open={storeInfoOpen} onClose={() => setStoreInfoOpen(false)} />
    </div>
  );
}
