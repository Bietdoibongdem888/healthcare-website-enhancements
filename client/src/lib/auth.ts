export type Tokens = { access: string; refresh: string };

const ACCESS_KEY = 'hc_client_access';
const REFRESH_KEY = 'hc_client_refresh';

export const saveTokens = (tokens: Tokens) => {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
};

export const getTokens = (): Tokens | null => {
  const access = localStorage.getItem(ACCESS_KEY) || '';
  const refresh = localStorage.getItem(REFRESH_KEY) || '';
  return access && refresh ? { access, refresh } : null;
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
