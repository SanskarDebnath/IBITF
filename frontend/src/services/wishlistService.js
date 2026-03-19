import { apiRequest } from "./apiClient";

export function getWishlist() {
  return apiRequest("/wishlist");
}

export function addWishlistItem(productId) {
  return apiRequest(`/wishlist/${productId}`, {
    method: "POST"
  });
}

export function deleteWishlistItem(productId) {
  return apiRequest(`/wishlist/${productId}`, {
    method: "DELETE"
  });
}
