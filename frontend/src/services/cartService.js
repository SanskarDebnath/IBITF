import { apiRequest } from "./apiClient";

export function getCart() {
  return apiRequest("/cart");
}

export function addCartItem(payload) {
  return apiRequest("/cart/items", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCartItem(itemId, payload) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteCartItem(itemId) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: "DELETE"
  });
}
