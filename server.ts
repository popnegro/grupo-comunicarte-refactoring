import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './src/db';
import { getAllSupportsFromDB, getSupportByIdFromDB } from './src/server/supportsService';
import { handleMediakitRequest, getAllMediakitRequestsFromDB } from './src/server/mediakitService';
import { authenticateAdmin, verifyAdminToken, getAdminStats, updateSupportByAdmin, updateRequestStatusByAdmin } from './src/server/adminService';

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

  // ==================== ADMIN API ROUTES (FASE 2) ====================
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body || {};
    const result = authenticateAdmin(username, password);
    if (!result.success) {
      return res.status(401).json({ status: 'error', message: result.message });
    }
    res.status(200).json({ status: 'success', token: result.token, message: 'Autenticación exitosa' });
  });

  // Admin Auth Middleware for /api/admin/* (except login)
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!verifyAdminToken(authHeader)) {
      return res.status(401).json({ status: 'error', message: 'No autorizado. Se requiere token de administrador válido.' });
    }
    next();
  };

  app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
    try {
      const stats = await getAdminStats();
      res.status(200).json({ status: 'success', data: stats });
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      res.status(500).json({ status: 'error', message: 'Error interno al obtener estadísticas.' });
    }
  });

  app.get('/api/admin/supports', requireAdmin, async (_req, res) => {
    try {
      const supports = await getAllSupportsFromDB();
      res.status(200).json({ status: 'success', data: supports });
    } catch (err: any) {
      console.error('Error fetching admin supports:', err);
      res.status(500).json({ status: 'error', message: 'Error interno al obtener inventario.' });
    }
  });

  app.patch('/api/admin/supports/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateSupportByAdmin(id, req.body);
      res.status(200).json({ status: 'success', data: updated, message: 'Soporte actualizado exitosamente.' });
    } catch (err: any) {
      console.error(`Error updating support ${req.params.id}:`, err);
      res.status(500).json({ status: 'error', message: err.message || 'Error al actualizar el soporte.' });
    }
  });

  app.get('/api/admin/requests', requireAdmin, async (_req, res) => {
    try {
      const requests = await getAllMediakitRequestsFromDB();
      res.status(200).json({ status: 'success', data: requests });
    } catch (err: any) {
      console.error('Error fetching admin requests:', err);
      res.status(500).json({ status: 'error', message: 'Error interno al obtener solicitudes.' });
    }
  });

  app.patch('/api/admin/requests/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body || {};
      const updated = await updateRequestStatusByAdmin(id, status);
      res.status(200).json({ status: 'success', data: updated, message: 'Estado de solicitud actualizado.' });
    } catch (err: any) {
      console.error(`Error updating request ${req.params.id}:`, err);
      res.status(500).json({ status: 'error', message: err.message || 'Error al actualizar la solicitud.' });
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
