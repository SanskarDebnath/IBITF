import { apiRequest } from "./apiClient";

export function onboardSeller(payload) {
  return apiRequest("/seller/onboard", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getSellerSettings() {
  return apiRequest("/seller/settings");
}

export function updateSellerSettings(payload) {
  return apiRequest("/seller/settings", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getSellerDashboard() {
  return apiRequest("/seller/dashboard");
}

export function getSellerKpis() {
  return apiRequest("/seller/kpis");
}

export function listSellerProducts() {
  return apiRequest("/seller/products");
}

export function addSellerProduct(payload) {
  return apiRequest("/seller/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function addSellerCategory(payload) {
  return apiRequest("/seller/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSellerProduct(productId, payload) {
  return apiRequest(`/seller/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function listSellerOrders() {
  return apiRequest("/seller/orders");
}

export function listSellerPayouts() {
  return apiRequest("/seller/payouts");
}
