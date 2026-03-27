import { apiRequest } from "./apiClient";

export function getMyProfile() {
  return apiRequest("/users/me");
}

export function updateMyProfile(payload) {
  return apiRequest("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
