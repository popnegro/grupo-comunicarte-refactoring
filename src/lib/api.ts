const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_URL = /^https?:\/\//i.test(configuredApiUrl)
  ? configuredApiUrl.replace(/\/$/, '')
  : '';

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`API path inválido: ${path}`);
  }

  return `${API_URL}${path}`;
}

export function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(apiUrl(path), init);
}
