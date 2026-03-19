import { apiRequest } from "./apiClient";

export function register(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function verifyOtp(payload) {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function refresh(payload) {
  return apiRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function forgotPassword(payload) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function resetPassword(payload) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
