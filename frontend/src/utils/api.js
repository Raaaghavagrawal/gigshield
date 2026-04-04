import axios from "axios";

/** Empty string = same-origin relative URLs (Vite dev proxy). */
const ENV_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim();

/** When proxy fails (ECONNREFUSED / network), retry once against the backend directly (requires CORS on server). */
const DEV_DIRECT_BACKEND = "http://localhost:5001";

export const api = axios.create({
  baseURL: ENV_BASE,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error.config;
    if (!cfg || cfg.__directFallback) return Promise.reject(error);
    if (error.response) return Promise.reject(error);
    const noBase = !(cfg.baseURL || "").trim();
    if (import.meta.env.DEV && noBase) {
      cfg.__directFallback = true;
      cfg.baseURL = DEV_DIRECT_BACKEND;
      return api.request(cfg);
    }
    return Promise.reject(error);
  }
);

export function getAuthHeaders() {
  const token = localStorage.getItem("gigshield_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
