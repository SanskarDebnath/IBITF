import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import * as cartService from "../../services/cartService";

const CartContext = createContext(null);

const mapCartItems = (items = []) =>
  items.map((item) => ({
    id: item.item_id,
    productId: item.product_id,
    name: item.title,
    price: Number(item.price || 0),
    qty: Number(item.qty || 0),
    image: item.image || null
  }));

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setItems(mapCartItems(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const addToCart = async (product) => {
    if (!isAuthenticated) return;
    const payload = {
      productId: product.productId || product.id,
      qty: Number(product.qty ?? product.quantity ?? 1)
    };
    const data = await cartService.addCartItem(payload);
    setItems(mapCartItems(data));
  };

  const updateCartItem = async (itemId, qty) => {
    if (!isAuthenticated) return;
    const data = await cartService.updateCartItem(itemId, { qty });
    setItems(mapCartItems(data));
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return;
    const data = await cartService.deleteCartItem(itemId);
    setItems(mapCartItems(data));
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    await Promise.all(items.map((item) => cartService.deleteCartItem(item.id)));
    const data = await cartService.getCart();
    setItems(mapCartItems(data));
  };

  const total = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.price || 0) * Number(x.qty || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      reloadCart: loadCart,
      total
    }),
    [items, loading, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
