export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

let refreshPromise = null;

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

function clearStoredSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:logout"));
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    clearStoredSession();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken })
    })
      .then(async (response) => {
        const data = await parseResponse(response);
        if (!response.ok || !data?.accessToken) {
          throw new Error(data?.message || "Failed to refresh token");
        }

        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        clearStoredSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = localStorage.getItem("accessToken");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await parseResponse(res);
  const canRefresh =
    !options._skipRefresh &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/refresh");

  if (res.status === 401 && canRefresh) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      return apiRequest(path, {
        ...options,
        _skipRefresh: true,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccessToken}`
        }
      });
    }
  }

  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
