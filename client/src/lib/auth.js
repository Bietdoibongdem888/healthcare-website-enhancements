const ACCESS_KEY = "hc_client_access";
const REFRESH_KEY = "hc_client_refresh";
const saveTokens = (tokens) => {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
};
const getTokens = () => {
  const access = localStorage.getItem(ACCESS_KEY) || "";
  const refresh = localStorage.getItem(REFRESH_KEY) || "";
  return access && refresh ? { access, refresh } : null;
};
const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
export {
  clearTokens,
  getTokens,
  saveTokens
};
