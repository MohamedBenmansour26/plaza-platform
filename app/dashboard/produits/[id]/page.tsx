import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

// Shell — PLZ-022 will implement the full edit-product form + price calculator.
export default async function EditProduitPage({ params }: Props) {
  const { id } = await params;

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
          <h1 className="text-2xl font-semibold text-[#1C1917]">Modifier le produit</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-[#78716C] text-sm">
            Formulaire de modification — disponible dans PLZ-022.
            <br />
            <span className="text-xs opacity-60">ID: {id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
