import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pizzazz-cart') || '[]');
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pizzazz-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (lineItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.cartId === lineItem.cartId);
      if (existing) {
        return prev.map(i => i.cartId === lineItem.cartId
          ? { ...i, quantity: i.quantity + (lineItem.quantity || 1) }
          : i);
      }
      return [...prev, { ...lineItem, quantity: lineItem.quantity || 1 }];
    });
  };

  const removeItem = (cartId) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity < 1) { removeItem(cartId); return; }
    setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, deliveryFee, total, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
