import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
});

// sessionStorage is used (not localStorage) so each browser TAB has its own
// isolated auth state. localStorage is shared across all tabs of the same
// origin, which was causing "Tab 2 logs in as a different account, then
// Tab 1 also becomes that account" — both tabs were reading/writing the
// same shared token.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[api] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    hasToken: !!token,
  });
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      console.warn("[api] 401 received — clearing stale token and redirecting to /login");
      sessionStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else {
      console.error("[api] Request failed:", err.response?.status, err.response?.data || err.message);
    }
    return Promise.reject(err);
  }
);

export default api;