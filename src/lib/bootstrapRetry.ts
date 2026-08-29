export const BOOTSTRAP_MAX_ATTEMPTS = 3;
export const BOOTSTRAP_RETRY_DELAY_MS = 500;

export function isRetryableBootstrapError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; message?: string };
  const code = String(candidate.code ?? '');
  const message = String(candidate.message ?? '').toLowerCase();
  return code === '40P01'
    || code === 'ECONNRESET'
    || code === 'ETIMEDOUT'
    || code === 'ECONNREFUSED'
    || code === 'ENOTFOUND'
    || /deadlock detected|connection|timeout|econnreset|econnrefused|enotfound/.test(message);
}

export function sleepBootstrapRetry(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
