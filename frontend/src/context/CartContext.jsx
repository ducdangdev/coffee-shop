import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'coffee_shop_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(item => item && Number.isSafeInteger(item.id) && item.id > 0 &&
        typeof item.name === 'string' && Number.isFinite(item.price) && item.price > 0 &&
        Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Storage may be unavailable. */ }
  }, [items]);

  // Thêm sản phẩm vào giỏ. Nếu đã có -> cộng dồn số lượng.
  function addToCart(product, quantity = 1) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          quantity: Math.min(99, quantity),
        },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    if (!Number.isSafeInteger(quantity) || quantity > 99) return;
    if (quantity < 1) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được dùng bên trong <CartProvider>');
  return ctx;
}
