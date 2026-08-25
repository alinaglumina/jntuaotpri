import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_BASE || ''}/api`;

// Single axios instance. httpOnly cookies (access + refresh) travel via
// withCredentials. Every response envelope is { success, data, error }.
const api = axios.create({ baseURL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });

// A bare client used ONLY to hit /auth/refresh (avoids interceptor recursion).
const bare = axios.create({ baseURL, withCredentials: true });

// Read a cookie value by name (the CSRF cookie is intentionally non-httpOnly).
function readCookie(name) {
  return document.cookie.split('; ').find((c) => c.startsWith(name + '='))?.split('=')[1];
}

// Attach the double-submit CSRF token on state-changing requests.
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
    const token = readCookie('jntua_csrf');
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

let refreshing = null; // dedupe concurrent refreshes into one request
function refreshSession() {
  refreshing ||= bare.post('/auth/refresh').finally(() => { refreshing = null; });
  return refreshing;
}

const AUTH_EXEMPT = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/forgot-password', '/auth/reset-password'];

api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body.success === 'boolean') {
      if (body.success) return body.data;
    const errMsg = typeof body.error === 'string' ? body.error
      : (body.error?.message || 'Request failed');
    return Promise.reject(new Error(errMsg));
    }
    return body;
  },
  async (err) => {
    const { response, config } = err;
    // Session-expiry handling: on a 401, transparently refresh once and retry.
    if (response?.status === 401 && config && !config._retried && !AUTH_EXEMPT.some((p) => config.url?.includes(p))) {
      config._retried = true;
      try {
        await refreshSession();
        return api(config);                       // retry original request
      } catch {
        // Refresh failed → session truly expired. Tell the app to log out.
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(new Error('Your session has expired. Please sign in again.'));
      }
    }
    const rawErr = response?.data?.error;
    const msg = typeof rawErr === 'string' ? rawErr
      : (rawErr?.message || err.message || 'Network error');
    return Promise.reject(new Error(msg));
  }
);
export default api;
