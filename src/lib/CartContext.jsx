import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "varahi_cart";

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
      if (prev.some((p) => p.id === product.id)) return prev;
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
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}