import React from 'react';
import { Link, useLocation } from 'react-router';
import { Package, Clock, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { path: '/livraisons', icon: Package, label: 'Livraisons' },
    { path: '/historique', icon: Clock, label: 'Historique' },
    { path: '/profil', icon: User, label: 'Profil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-[375px] mx-auto flex justify-around items-center h-16">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon 
                size={24} 
                className={isActive ? 'text-[#2563EB]' : 'text-[#78716C]'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`text-[11px] mt-1 ${
                  isActive 
                    ? 'text-[#2563EB] font-semibold' 
                    : 'text-[#78716C] font-medium'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
