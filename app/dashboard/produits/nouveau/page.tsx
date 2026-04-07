import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Shell — PLZ-022 will implement the full add-product form.
export default function NouveauProduitPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[1040px] mx-auto px-4 py-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard/produits"
            className="p-2 rounded-lg text-[#78716C] hover:bg-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-[#1C1917]">Nouveau produit</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-[#78716C] text-sm">
            Formulaire d&apos;ajout de produit — disponible dans PLZ-022.
          </p>
        </div>
      </div>
    </div>
  );
}
