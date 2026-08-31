const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_URL = /^https?:\/\//i.test(configuredApiUrl)
  ? configuredApiUrl.replace(/\/$/, '')
  : '';

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`API path inválido: ${path}`);
  }

  // Production is served by the same Vercel deployment as the API. Keep API
  // calls same-origin so login/admin requests do not depend on cross-origin
  // CORS configuration or stale Render URLs from VITE_API_URL.
  if (import.meta.env.PROD) {
    return path;
  }

  return `${API_URL}${path}`;
}

export function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(apiUrl(path), init);
}
