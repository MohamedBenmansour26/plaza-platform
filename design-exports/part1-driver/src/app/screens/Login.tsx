import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bike } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = () => {
    navigate('/livraisons');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-[#2563EB] flex items-center justify-center mb-6">
          <Bike size={40} className="text-white" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-[28px] font-bold text-[#1C1917] mb-2">Plaza Driver</h1>
        <p className="text-[15px] text-[#78716C] mb-12">Connectez-vous pour commencer</p>

        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1C1917] mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+212 6 12 34 56 78"
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#2563EB] focus:outline-none text-[15px]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1C1917] mb-2">
              Code PIN
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••"
              maxLength={4}
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#2563EB] focus:outline-none text-[15px] tracking-widest"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full h-12 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors mt-8"
          >
            Se connecter
          </button>

          <button className="w-full text-[13px] text-[#2563EB] font-medium mt-4">
            Code oublié ?
          </button>
        </div>
      </div>

      <div className="text-center pb-8 px-6">
        <p className="text-[12px] text-[#78716C]">
          Besoin d'aide ? Contactez le support Plaza
        </p>
      </div>
    </div>
  );
};
