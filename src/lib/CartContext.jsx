import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "varahi_cart";
export const MAX_ITEM_QUANTITY = 10;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => p.id === product.id ? { ...p, quantity: Math.min(MAX_ITEM_QUANTITY, (p.quantity || 1) + 1) } : p);
      }
      const price =
        product.discount_price && product.discount_price < product.price
          ? product.discount_price
          : product.price;
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price,
          image: product.cover_image || product.images?.[0],
          collection: product.collection,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) => prev
      .map((item) => item.id === id ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, Math.max(0, quantity)) } : item)
      .filter((item) => item.quantity > 0));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}