import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-none h-[45vh] flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #16A34A 0%, #15803D 100%)' }}>
        <CheckCircle2 className="w-20 h-20 text-white" strokeWidth={2.5} />
        <h1 className="text-[26px] font-bold text-white mt-3">Livraison effectuée !</h1>
        <span className="mt-2 text-white text-[13px] font-semibold bg-white/20 px-3 py-1 rounded-full">
          ✓ À l&apos;heure
        </span>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl -mt-8 relative px-4 pt-6 pb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <p className="text-[15px] font-bold text-[#1C1917] mb-4">Récapitulatif</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[#78716C] text-sm">Distance parcourue:</span>
              <span className="text-sm text-[#1C1917] ml-auto">N/A</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#78716C] text-sm">Durée:</span>
              <span className="text-sm text-[#1C1917] ml-auto">N/A</span>
            </div>
            <div className="border-t border-gray-100 my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Gains:</span>
              <span className="text-base font-bold text-green-600">Calculé lundi</span>
            </div>
          </div>
        </div>

        <Link
          href="/driver/livraisons"
          className="block w-full h-[52px] rounded-xl text-base font-bold text-white flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Retour aux livraisons
        </Link>
      </div>
    </main>
  );
}
