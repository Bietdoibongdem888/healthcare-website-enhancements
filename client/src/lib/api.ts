import { getTokens, saveTokens, clearTokens } from './auth';

const DEFAULT_API = 'http://localhost:3000/api/v1';
export const API_URL = (import.meta as any).env?.VITE_API_URL || DEFAULT_API;
const API_BASE = API_URL.replace(/\/$/, '');

function toUrl(path: string) {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export async function api(path: string, init: RequestInit = {}) {
  const tokens = getTokens();
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (tokens?.access) {
    headers.set('Authorization', `Bearer ${tokens.access}`);
  }
  const url = toUrl(path);
  let res = await fetch(url, { ...init, headers });
  if (res.status === 401 && tokens) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      if (data?.access && data?.refresh) {
        saveTokens({ access: data.access, refresh: data.refresh });
        headers.set('Authorization', `Bearer ${data.access}`);
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

export async function apiJson<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await api(path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function safeApi<T = any>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    return await apiJson<T>(path, init);
  } catch (err) {
    console.warn('[healthcare-client] API error', err);
    return null;
  }
}
