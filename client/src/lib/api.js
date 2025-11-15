import { getTokens, saveTokens, clearTokens } from "./auth";
const DEFAULT_API = "http://localhost:3000/api/v1";
const API_URL = import.meta.env?.VITE_API_URL || DEFAULT_API;
const API_BASE = API_URL.replace(/\/$/, "");
function toUrl(path) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}
async function api(path, init = {}) {
  const tokens = getTokens();
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (tokens?.access) {
    headers.set("Authorization", `Bearer ${tokens.access}`);
  }
  const url = toUrl(path);
  let res = await fetch(url, { ...init, headers });
  if (res.status === 401 && tokens) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens)
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      if (data?.access && data?.refresh) {
        saveTokens({ access: data.access, refresh: data.refresh });
        headers.set("Authorization", `Bearer ${data.access}`);
        res = await fetch(url, { ...init, headers });
      } else {
        clearTokens();
      }
    } else {
      clearTokens();
    }
  }
  return res;
}
async function apiJson(path, init = {}) {
  const res = await api(path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return void 0;
  return await res.json();
}
async function safeApi(path, init) {
  try {
    return await apiJson(path, init);
  } catch (err) {
    console.warn("[healthcare-client] API error", err);
    return null;
  }
}
export {
  API_URL,
  api,
  apiJson,
  safeApi
};
