import { apiRequest } from "./apiClient";

export function listCategories() {
  return apiRequest("/catalog/categories");
}
