const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_URL = /^https?:\/\//i.test(configuredApiUrl)
  ? configuredApiUrl.replace(/\/$/, '')
  : '';

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`API path inválido: ${path}`);
  }

  // Production is served by the same deployment as the API. Keep admin/public
  // API calls same-origin in production; VITE_API_URL remains available for
  // local development and external API environments.
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
