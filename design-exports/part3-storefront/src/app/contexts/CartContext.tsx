import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Robe Caftan Brodée",
      price: 450,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1649109670360-32498fda05b2?w=400",
    },
    {
      id: "5",
      name: "Ceinture Tissée",
      price: 120,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1630084305900-b297cff3a608?w=400",
    },
    {
      id: "6",
      name: "Foulard Soie",
      price: 180,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1600166931532-604e927c794b?w=400",
    },
  ]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === newItem.id);
      if (existing) {
        return current.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
