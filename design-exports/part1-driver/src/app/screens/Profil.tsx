import React from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { Phone, Bike, Star, TrendingUp, ChevronRight, LogOut, Settings, HelpCircle, FileText } from 'lucide-react';

export const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { driverName, driverPhone, driverPhoto } = useApp();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-[20px] font-bold text-[#1C1917]">Profil</h1>
        <p className="text-[13px] text-[#78716C]">Gérez votre compte</p>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img
                src={driverPhoto}
                alt={driverName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-[#1C1917] mb-1">
                {driverName}
              </h2>
              <div className="flex items-center gap-1 text-[13px] text-[#78716C]">
                <Phone size={12} />
                {driverPhone}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-[#E8632A] fill-[#E8632A]" />
                <span className="text-[13px] font-semibold text-[#1C1917]">4.8</span>
                <span className="text-[12px] text-[#78716C]">(156 avis)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#1C1917]">247</p>
              <p className="text-[11px] text-[#78716C]">Livraisons</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#16A34A]">8,645</p>
              <p className="text-[11px] text-[#78716C]">MAD gagnés</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#2563EB]">94%</p>
              <p className="text-[11px] text-[#78716C]">Taux réussite</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#16A34A] to-[#15803d] rounded-xl p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} />
            <h3 className="text-[16px] font-semibold">Performance ce mois</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] opacity-90 mb-1">Livraisons</p>
              <p className="text-[28px] font-bold">52</p>
              <p className="text-[11px] opacity-75">+12% vs mois dernier</p>
            </div>
            <div>
              <p className="text-[12px] opacity-90 mb-1">Revenus</p>
              <p className="text-[28px] font-bold">1,820</p>
              <p className="text-[11px] opacity-75">MAD ce mois</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-[#78716C]" />
              <span className="text-[14px] text-[#1C1917]">Paramètres</span>
            </div>
            <ChevronRight size={20} className="text-[#78716C]" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <Bike size={20} className="text-[#78716C]" />
              <span className="text-[14px] text-[#1C1917]">Informations véhicule</span>
            </div>
            <ChevronRight size={20} className="text-[#78716C]" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[#78716C]" />
              <span className="text-[14px] text-[#1C1917]">Documents</span>
            </div>
            <ChevronRight size={20} className="text-[#78716C]" />
          </button>

          <button className="w-full flex items-center justify-between p-4 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-[#78716C]" />
              <span className="text-[14px] text-[#1C1917]">Aide & Support</span>
            </div>
            <ChevronRight size={20} className="text-[#78716C]" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm text-[#DC2626] font-medium active:bg-gray-50"
        >
          <LogOut size={20} />
          Se déconnecter
        </button>

        <p className="text-center text-[12px] text-[#78716C] mt-6">
          Plaza Driver v1.0.2
        </p>
      </div>

      <BottomNav />
    </div>
  );
};
