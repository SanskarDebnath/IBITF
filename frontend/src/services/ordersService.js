import { apiRequest } from "./apiClient";

export function checkout(payload) {
  return apiRequest("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function listOrders() {
  return apiRequest("/orders");
}

export function getOrder(orderId) {
  return apiRequest(`/orders/${orderId}`);
}
