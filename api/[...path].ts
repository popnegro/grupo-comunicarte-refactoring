import { createApp } from '../dist/server.cjs';

const appPromise = createApp();

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
    });
  }
}
