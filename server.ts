import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleMediakitRequest, getAllMediakitRequests } from './src/server/mediakitService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.post('/api/mediakit/request', (req, res) => {
    const result = handleMediakitRequest(req.body);
    res.status(result.statusCode).json(result.response);
  });

  app.get('/api/mediakit/requests', (_req, res) => {
    const records = getAllMediakitRequests();
    res.status(200).json({ status: 'success', data: records });
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
