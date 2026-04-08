import { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface PriceCalculatorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PriceCalculator({ value, onChange }: PriceCalculatorProps) {
  const [price, setPrice] = useState(value || '350');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPrice(value || '350');
  }, [value]);

  const handlePriceChange = (newPrice: string) => {
    setPrice(newPrice);
    
    // Validation
    const priceNum = parseFloat(newPrice);
    if (newPrice && priceNum < 1) {
      setError('Le prix minimum est 1 MAD');
    } else {
      setError('');
    }

    // Simulate calculation delay
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 200);

    onChange(newPrice);
  };

  // Calculate revenue
  const priceNum = parseFloat(price) || 0;
  const commission = priceNum * 0.05;
  const revenue = priceNum - commission;

  const showPlaceholder = !price || priceNum === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#2563EB]">
      <h2 className="text-base font-semibold text-[#1C1917] mb-1">Prix du produit</h2>
      <p className="text-[13px] text-[#78716C] mb-4">
        Definissez le prix que le client verra sur votre boutique
      </p>

      {/* PRICE INPUT */}
      <div className="mb-3">
        <label className="block text-[13px] font-medium text-[#1C1917] mb-1.5">
          Prix pour le client
        </label>
        <div className="relative">
          <input
            type="number"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className={`w-full h-14 px-4 pr-16 border rounded-lg text-2xl font-semibold text-[#1C1917] focus:outline-none transition-all ${
              error 
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
                : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-[#78716C]">MAD</span>
        </div>
        {error && (
          <p className="text-xs text-[#DC2626] mt-1.5">{error}</p>
        )}
      </div>

      {/* YOUR REVENUE BREAKDOWN */}
      <div className={`bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg p-3 transition-opacity ${
        isCalculating ? 'opacity-50' : 'opacity-100'
      }`}>
        <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-2.5">
          Votre revenu sur ce produit
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#1C1917]">Prix client</span>
            <span className="text-[#1C1917]">
              {showPlaceholder ? '—' : `${priceNum.toFixed(2)} MAD`}
            </span>
          </div>
          <div className="flex justify-between text-sm text-[#DC2626]">
            <span>Commission Plaza (5%)</span>
            <span>
              {showPlaceholder ? '—' : `- ${commission.toFixed(2)} MAD`}
            </span>
          </div>
          
          <div className="border-t border-[#E2E8F0] my-2"></div>
          
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-[#1C1917]">Votre revenu net</span>
            <span className="text-[#16A34A]">
              {showPlaceholder ? '—' : `${revenue.toFixed(2)} MAD`}
            </span>
          </div>
        </div>

        <div className="my-2.5 border-t border-dashed border-[#E2E8F0]"></div>

        <div className="flex gap-1.5 items-start">
          <Info className="w-4 h-4 text-[#78716C] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#78716C]" style={{ lineHeight: '1.5' }}>
            Les 30 MAD de livraison sont factures par commande et non par produit. 
            Ils sont visibles dans le recapitulatif de vos revenus.
          </p>
        </div>
      </div>
    </div>
  );
}
