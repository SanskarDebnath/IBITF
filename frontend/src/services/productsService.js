import { apiRequest } from "./apiClient";

export function listProducts(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const qs = params.toString();
  return apiRequest(`/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(id) {
  return apiRequest(`/products/${id}`);
}
