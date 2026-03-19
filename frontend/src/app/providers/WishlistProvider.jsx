import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import * as wishlistService from "../../services/wishlistService";

const WishlistContext = createContext(null);

const mapWishlistItems = (items = []) =>
  items.map((item) => ({
    id: item.item_id,
    productId: item.product_id,
    name: item.title,
    description: item.description || "",
    price: Number(item.price || 0),
    image: item.image || null,
    inStock: Number(item.stock || 0) > 0,
    category: item.category_name || "Uncategorized"
  }));

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setItems(mapWishlistItems(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) return;
    const data = await wishlistService.addWishlistItem(productId);
    setItems(mapWishlistItems(data));
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    const data = await wishlistService.deleteWishlistItem(productId);
    setItems(mapWishlistItems(data));
  };

  const value = useMemo(
    () => ({
      items,
      loading,
      addToWishlist,
      removeFromWishlist,
      reloadWishlist: loadWishlist
    }),
    [items, loading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
