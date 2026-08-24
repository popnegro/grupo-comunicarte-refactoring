function useNeonPooler(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (!url.hostname.endsWith('.neon.tech')) return connectionString;
    if (url.hostname.includes('-pooler.')) return connectionString;

    const endpoint = url.hostname.split('.')[0];
    if (!endpoint.startsWith('ep-')) return connectionString;

    url.hostname = `${endpoint}-pooler.${url.hostname.split('.').slice(1).join('.')}`;
    return url.toString();
  } catch {
    return connectionString;
  }
}

const configuredDatabaseUrl = process.env.DATABASE_URL;
if (configuredDatabaseUrl) {
  process.env.DATABASE_URL = useNeonPooler(configuredDatabaseUrl);
}

function databaseHost(): string | null {
  try {
    return process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : null;
  } catch {
    return null;
  }
}

const appPromise = import('../dist/server.cjs').then(({ createApp }) => createApp());

export default async function handler(req: any, res: any) {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel API bootstrap failed:', error);
    return res.status(500).json({
      status: 'error',
      code: 'API_BOOTSTRAP_FAILED',
      message: error instanceof Error ? error.message : 'Unknown API bootstrap error',
      databaseHost: databaseHost(),
    });
  }
}
