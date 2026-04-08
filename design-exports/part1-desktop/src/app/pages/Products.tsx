import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { Badge } from "../components/Badge";
import { toast } from "sonner";

const mockProducts = [
  { id: '1', name: "Robe d'ete fleurie", price: '350 MAD', stock: 12, status: true, image: null },
  { id: '2', name: "Sac a main cuir", price: '580 MAD', stock: 3, status: true, image: null },
  { id: '3', name: "Sandales dorees", price: '220 MAD', stock: 0, status: false, image: null },
  { id: '4', name: "Foulard soie", price: '180 MAD', stock: 8, status: false, image: null },
  { id: '5', name: "Ceinture brodee", price: '120 MAD', stock: 15, status: true, image: null },
];

export function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'tous' | 'en-stock' | 'rupture' | 'masques'>('tous');

  const handleToggleStatus = (productId: string) => {
    setProducts(products.map(p => p.id === productId ? { ...p, status: !p.status } : p));
    toast.success('Statut mis a jour');
  };

  const handleDelete = (productId: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Produit supprime');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'en-stock') return matchesSearch && p.stock > 0;
    if (filterStatus === 'rupture') return matchesSearch && p.stock === 0;
    if (filterStatus === 'masques') return matchesSearch && !p.status;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1040px] mx-auto p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1C1917]">Mes produits</h1>
          <button
            onClick={() => navigate('/dashboard/produits/nouveau')}
            className="h-10 px-4 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'tous', label: 'Tous' },
              { id: 'en-stock', label: 'En stock' },
              { id: 'rupture', label: 'Rupture' },
              { id: 'masques', label: 'Masques' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id as any)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === filter.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white text-[#78716C] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 flex items-center">
            <div className="w-16 text-[13px] font-medium text-[#78716C] uppercase">Image</div>
            <div className="flex-1 text-[13px] font-medium text-[#78716C] uppercase">Produit</div>
            <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Prix</div>
            <div className="w-[140px] text-[13px] font-medium text-[#78716C] uppercase">Stock</div>
            <div className="w-[100px] text-[13px] font-medium text-[#78716C] uppercase">Statut</div>
            <div className="w-20 text-[13px] font-medium text-[#78716C] uppercase">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="h-16 px-4 flex items-center border-b border-[#F3F4F6] hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="w-16">
                <div className="w-12 h-12 rounded-lg bg-[#F5F5F4]"></div>
              </div>
              <div className="flex-1 text-sm font-semibold text-[#1C1917]">{product.name}</div>
              <div className="w-[120px] text-sm font-semibold text-[#1C1917]">{product.price}</div>
              <div className="w-[140px]">
                {product.stock > 0 ? (
                  <span className="text-[13px] text-[#78716C]">{product.stock} en stock</span>
                ) : (
                  <Badge variant="red">Rupture</Badge>
                )}
              </div>
              <div className="w-[100px]">
                <Switch
                  checked={product.status}
                  onCheckedChange={() => handleToggleStatus(product.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    product.status ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      product.status ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>
              <div className="w-20 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/dashboard/produits/${product.id}`)}
                  className="p-1 text-[#78716C] hover:text-[#2563EB] transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-1 text-[#78716C] hover:text-[#DC2626] transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-[#E2E8F0]">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-2">Aucun produit trouve</h3>
              <p className="text-sm text-[#78716C]">Essayez de modifier vos filtres</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
