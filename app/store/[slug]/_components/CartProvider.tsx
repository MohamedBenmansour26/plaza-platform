'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number; // MAD (already divided by 100)
  quantity: number;
  image: string;
  stock: number | null; // null = unlimited; activates client-side cap in CartDrawer
}

export type AddItemResult = { blocked: true; reason: 'stock' } | { blocked: false };

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { stock?: number | null }, quantity?: number) => AddItemResult;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number, maxQty?: number | null) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  slug,
}: {
  children: ReactNode;
  slug: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`plaza_cart_${slug}`);
    if (stored) {
      try {
        setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        // ignore malformed data
      }
    }
  }, [slug]);

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(`plaza_cart_${slug}`, JSON.stringify(items));
  }, [items, slug]);

  const addItem = (
    newItem: Omit<CartItem, 'quantity'> & { stock?: number | null },
    quantity: number = 1,
  ): AddItemResult => {
    // Destructure stock so it is stored on the CartItem for client-side cap (PLZ-045).
    const { stock: stockRaw, ...itemData } = newItem;
    const stock = stockRaw ?? null; // normalise undefined → null
    const maxQty = stock ?? Infinity; // null = unlimited

    let result: AddItemResult = { blocked: false };

    setItems((current) => {
      const existing = current.find((item) => item.id === newItem.id);
      const currentQty = existing?.quantity ?? 0;
      const allowedQty = Math.min(quantity, maxQty - currentQty);

      if (allowedQty <= 0) {
        result = { blocked: true, reason: 'stock' };
        return current; // no change
      }

      if (existing) {
        return current.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + allowedQty }
            : item,
        );
      }
      return [...current, { ...itemData, stock, quantity: allowedQty }];
    });

    return result;
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number, maxQty?: number | null) => {
    if (quantity <= 0) { removeItem(id); return; }
    const capped = maxQty != null ? Math.min(quantity, maxQty) : quantity;
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity: capped } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
