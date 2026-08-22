import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './src/db';
import { getAllSupportsFromDB, getSupportByIdFromDB } from './src/server/supportsService';
import { handleMediakitRequest, getAllMediakitRequestsFromDB } from './src/server/mediakitService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Database & Idempotent Seed
  try {
    await initDatabase();
  } catch (err) {
    console.error('Failed to initialize database during startup:', err);
  }

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Supports API routes (Phase 3)
  app.get('/api/supports', async (_req, res) => {
    try {
      const supports = await getAllSupportsFromDB();
      res.status(200).json({ status: 'success', data: supports });
    } catch (err: any) {
      console.error('Error fetching supports:', err);
      res.status(500).json({ status: 'error', message: 'Error interno al obtener el inventario de soportes.' });
    }
  });

  app.get('/api/supports/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const support = await getSupportByIdFromDB(id);
      if (!support) {
        return res.status(404).json({ status: 'error', message: `Soporte con ID '${id}' no encontrado.` });
      }
      res.status(200).json({ status: 'success', data: support });
    } catch (err: any) {
      console.error(`Error fetching support ${req.params.id}:`, err);
      res.status(500).json({ status: 'error', message: 'Error interno al obtener el soporte.' });
    }
  });

  // MediaKit API routes (Phase 8, 10)
  app.post('/api/mediakit/request', async (req, res) => {
    try {
      const result = await handleMediakitRequest(req.body);
      res.status(result.statusCode).json(result.response);
    } catch (err: any) {
      console.error('Error in /api/mediakit/request:', err);
      res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
  });

  app.get('/api/mediakit/requests', async (_req, res) => {
    try {
      const records = await getAllMediakitRequestsFromDB();
      res.status(200).json({ status: 'success', data: records });
    } catch (err: any) {
      console.error('Error fetching mediakit requests:', err);
      res.status(500).json({ status: 'error', message: 'Error interno al obtener solicitudes.' });
    }
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
} );
