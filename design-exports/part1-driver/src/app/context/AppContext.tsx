import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Delivery {
  id: string;
  orderNumber: string;
  status: 'to_collect' | 'in_delivery' | 'completed';
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  pickupShop: string;
  deliveryAddress: string;
  deliveryNeighborhood: string;
  amount: number;
  earnings: number;
  paymentMethod: 'COD' | 'PAID';
  timeSlotStart: string;
  timeSlotEnd: string;
  timeRemaining: number;
  distance: string;
  estimatedTime: string;
  packagePhoto?: string;
  proofPhoto?: string;
  merchantCode?: string;
  customerCode?: string;
  deliveredAt?: string;
  onTime?: boolean;
  lateBy?: number;
}

interface AppContextType {
  isAvailable: boolean;
  setIsAvailable: (available: boolean) => void;
  deliveries: Delivery[];
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  completeDelivery: (id: string, onTime: boolean, lateBy?: number) => void;
  todayEarnings: number;
  driverName: string;
  driverPhone: string;
  driverPhoto: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const initialDeliveries: Delivery[] = [
  {
    id: '1',
    orderNumber: 'PZ-2847',
    status: 'to_collect',
    customerName: 'Fatima Zahra Benali',
    customerPhone: '+212 6 12 34 56 78',
    pickupAddress: '45 Bd Zerktouni, Casablanca',
    pickupShop: 'Boutique Fatima',
    deliveryAddress: '12 Rue Ahmed El Mokri, Appartement 3, Casablanca 20250',
    deliveryNeighborhood: 'Maarif',
    amount: 450,
    earnings: 35,
    paymentMethod: 'COD',
    timeSlotStart: '14h00',
    timeSlotEnd: '15h00',
    timeRemaining: 80,
    distance: '2.3 km',
    estimatedTime: '18 min',
    merchantCode: '427891',
    customerCode: '831905'
  },
  {
    id: '2',
    orderNumber: 'PZ-2851',
    status: 'to_collect',
    customerName: 'Mohammed Alami',
    customerPhone: '+212 6 23 45 67 89',
    pickupAddress: '23 Rue Colbert, Casablanca',
    pickupShop: 'Electroshop Casa',
    deliveryAddress: '78 Bd Massira Khadra, Villa 12, Casablanca 20100',
    deliveryNeighborhood: 'Ain Diab',
    amount: 0,
    earnings: 35,
    paymentMethod: 'PAID',
    timeSlotStart: '15h30',
    timeSlotEnd: '16h30',
    timeRemaining: 18,
    distance: '4.7 km',
    estimatedTime: '25 min',
    merchantCode: '563421',
    customerCode: '194728'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [todayEarnings] = useState(175);
  const [driverName] = useState('Hassan Benjelloun');
  const [driverPhone] = useState('+212 6 12 34 56 78');
  const [driverPhoto] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop');

  const updateDelivery = (id: string, updates: Partial<Delivery>) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const completeDelivery = (id: string, onTime: boolean, lateBy?: number) => {
    setDeliveries(prev => prev.map(d => 
      d.id === id 
        ? { 
            ...d, 
            status: 'completed' as const, 
            deliveredAt: new Date().toISOString(),
            onTime,
            lateBy 
          } 
        : d
    ));
  };

  return (
    <AppContext.Provider
      value={{
        isAvailable,
        setIsAvailable,
        deliveries,
        updateDelivery,
        completeDelivery,
        todayEarnings,
        driverName,
        driverPhone,
        driverPhoto
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
