import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import * as cartService from "../../services/cartService";
import { API_BASE_URL } from "../../services/apiClient";

const CartContext = createContext(null);

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveCartImage(imagePath) {
  if (!imagePath) return null;
  if (
    imagePath.startsWith("http") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  const normalized = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_ORIGIN}${normalized}`;
}

const mapCartItems = (items = []) =>
  items.map((item) => ({
    id: item.item_id || item.id,
    productId: item.product_id || item.productId || item.product?.id,
    name: item.title || item.name || item.product?.title || item.product?.name || "Untitled product",
    price: Number(item.price ?? item.product?.price ?? 0),
    qty: Number(item.qty ?? item.quantity ?? 0),
    image: resolveCartImage(item.image || item.product?.image || null),
    status: item.status || item.product?.status || "",
    stock: Number(item.stock ?? item.product?.stock ?? 0)
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
