import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase, pool } from './src/db';
import { getAllSupportsFromDB, getSupportByIdFromDB } from './src/server/supportsService';
import { handleMediakitRequest, getAllMediakitRequestsFromDB } from './src/server/mediakitService';
import { handleMediaUpload } from './src/server/multimediaUpload';
import {
  authenticateAdmin,
  verifyAdminToken,
  getAdminStats,
  updateRequestStatusByAdmin,
  listAdminSupports,
  getAdminSupportById,
  createAdminSupport,
  updateSupportByAdmin,
  deactivateSupportByAdmin,
  getSupportMediaByAdmin,
  addSupportMediaByAdmin,
  updateSupportMediaByAdmin,
  removeSupportMediaByAdmin,
  getSupportPricingByAdmin,
  patchSupportPricingByAdmin,
  getSupportRouteByAdmin,
  patchSupportRouteByAdmin,
} from './src/server/adminService';

export async function createApp() {
  const app = express();

  // CORS for the production frontend and local development. Keep the API
  // explicit rather than using a wildcard so credentialed/authenticated
  // requests cannot be opened to arbitrary origins.
  const allowedOrigins = (process.env.CORS_ORIGINS || 'https://grupocomunicarte.vercel.app,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (req.method === 'OPTIONS') {
      if (!origin || allowedOrigins.includes(origin)) {
        return res.sendStatus(204);
      }
      return res.sendStatus(403);
    }

    next();
  });

  app.use(express.json());

  // Initialize Database & Idempotent Seed
  try {
    await initDatabase();
  } catch (err) {
    console.error('Failed to initialize database during startup:', err);
    throw err;
  }

  // API health check with DB connectivity check (P1-5)
  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (err: any) {
      res.status(503).json({ status: 'degraded', database: 'disconnected', error: err.message });
    }
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

  // NOTE: GET /api/mediakit/requests is strictly removed from public exposure (P0-2).
  // Only accessible via protected admin endpoint /api/admin/requests.

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

  // Physical media upload: multipart/form-data -> R2 -> support_media.
  // Keep this route ahead of the JSON media CRUD route and use a route-scoped
  // raw parser so the existing JSON API remains unchanged.
  app.post(
    '/api/admin/supports/:id/media/upload',
    requireAdmin,
    express.raw({ type: 'multipart/form-data', limit: '10mb' }),
    handleMediaUpload,
  );

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
      const supports = await listAdminSupports();
      res.status(200).json({ status: 'success', data: supports });
    } catch (err: any) {
      console.error('Error fetching admin supports:', err);
      res.status(500).json({ status: 'error', message: 'Error interno al obtener inventario.' });
    }
  });

  app.get('/api/admin/supports/:id', requireAdmin, async (req, res) => {
    try {
      const support = await getAdminSupportById(req.params.id);
      res.status(200).json({ status: 'success', data: support });
    } catch (err: any) {
      console.error(`Error fetching admin support ${req.params.id}:`, err);
      const msg = err.message || '';
      const status = msg.includes('no encontrado') ? 404 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al obtener el soporte.' });
    }
  });

  app.post('/api/admin/supports', requireAdmin, async (req, res) => {
    try {
      const created = await createAdminSupport(req.body || {});
      res.status(201).json({ status: 'success', data: created, message: 'Soporte creado exitosamente.' });
    } catch (err: any) {
      console.error('Error creating admin support:', err);
      const msg = err.message || '';
      const status = msg.includes('vacío') || msg.includes('inválida') || msg.includes('desconocida') ? 400 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al crear el soporte.' });
    }
  });

  app.patch('/api/admin/supports/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateSupportByAdmin(id, req.body);
      res.status(200).json({ status: 'success', data: updated, message: 'Soporte actualizado exitosamente.' });
    } catch (err: any) {
      console.error(`Error updating support ${req.params.id}:`, err);
      const msg = err.message || '';
      const status = msg.includes('no encontrado') ? 404 : msg.includes('inválido') ? 400 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al actualizar el soporte.' });
    }
  });

  app.delete('/api/admin/supports/:id', requireAdmin, async (req, res) => {
    try {
      const result = await deactivateSupportByAdmin(req.params.id);
      res.status(200).json({ status: 'success', data: result, message: 'Soporte desactivado exitosamente.' });
    } catch (err: any) {
      console.error(`Error deleting support ${req.params.id}:`, err);
      const msg = err.message || '';
      const status = msg.includes('no encontrado') ? 404 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al desactivar el soporte.' });
    }
  });

  app.get('/api/admin/supports/:id/media', requireAdmin, async (req, res) => {
    try {
      const media = await getSupportMediaByAdmin(req.params.id);
      res.status(200).json({ status: 'success', data: media });
    } catch (err: any) {
      console.error(`Error fetching admin support media ${req.params.id}:`, err);
      res.status(500).json({ status: 'error', message: 'Error al obtener media.' });
    }
  });

  app.post('/api/admin/supports/:id/media', requireAdmin, async (req, res) => {
    try {
      const created = await addSupportMediaByAdmin(req.params.id, req.body || {});
      res.status(201).json({ status: 'success', data: created });
    } catch (err: any) {
      console.error(`Error creating support media ${req.params.id}:`, err);
      const msg = err.message || '';
      const status = msg.includes('inválido') ? 400 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al crear media.' });
    }
  });

  app.patch('/api/admin/supports/:id/media/:mediaId', requireAdmin, async (req, res) => {
    try {
      const mediaId = Number(req.params.mediaId);
      const updated = await updateSupportMediaByAdmin(req.params.id, mediaId, req.body || {});
      res.status(200).json({ status: 'success', data: updated });
    } catch (err: any) {
      console.error(`Error updating support media ${req.params.id}/${req.params.mediaId}:`, err);
      const msg = err.message || '';
      const status = msg.includes('no encontrada') ? 404 : msg.includes('inválido') ? 400 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al actualizar media.' });
    }
  });

  app.delete('/api/admin/supports/:id/media/:mediaId', requireAdmin, async (req, res) => {
    try {
      const mediaId = Number(req.params.mediaId);
      const deleted = await removeSupportMediaByAdmin(req.params.id, mediaId);
      res.status(200).json({ status: 'success', data: deleted });
    } catch (err: any) {
      console.error(`Error deleting support media ${req.params.id}/${req.params.mediaId}:`, err);
      const msg = err.message || '';
      const status = msg.includes('no encontrada') ? 404 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al eliminar media.' });
    }
  });

  app.get('/api/admin/supports/:id/pricing', requireAdmin, async (req, res) => {
    try {
      const pricing = await getSupportPricingByAdmin(req.params.id);
      res.status(200).json({ status: 'success', data: pricing });
    } catch (err: any) {
      console.error(`Error fetching admin support pricing ${req.params.id}:`, err);
      res.status(500).json({ status: 'error', message: 'Error al obtener pricing.' });
    }
  });

  app.patch('/api/admin/supports/:id/pricing', requireAdmin, async (req, res) => {
    try {
      const pricing = await patchSupportPricingByAdmin(req.params.id, req.body || {});
      res.status(200).json({ status: 'success', data: pricing });
    } catch (err: any) {
      console.error(`Error updating support pricing ${req.params.id}:`, err);
      const msg = err.message || '';
      const status = msg.includes('negativo') || msg.includes('inválido') ? 400 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al actualizar el pricing.' });
    }
  });

  app.get('/api/admin/supports/:id/route', requireAdmin, async (req, res) => {
    try {
      const route = await getSupportRouteByAdmin(req.params.id);
      res.status(200).json({ status: 'success', data: route });
    } catch (err: any) {
      console.error(`Error fetching admin support route ${req.params.id}:`, err);
      res.status(500).json({ status: 'error', message: 'Error al obtener la ruta.' });
    }
  });

  app.patch('/api/admin/supports/:id/route', requireAdmin, async (req, res) => {
    try {
      const route = await patchSupportRouteByAdmin(req.params.id, req.body || {});
      res.status(200).json({ status: 'success', data: route });
    } catch (err: any) {
      console.error(`Error updating admin support route ${req.params.id}:`, err);
      const msg = err.message || '';
      const status = msg.includes('inválido') ? 400 : 500;
      res.status(status).json({ status: 'error', message: msg || 'Error al actualizar la ruta.' });
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
      const msg = err.message || '';
      const statusCode = msg.includes('no encontrada') ? 404 : msg.includes('inválido') ? 400 : 500;
      res.status(statusCode).json({ status: 'error', message: msg || 'Error al actualizar la solicitud.' });
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

  return app;
}

if (!process.env.VERCEL) {
  createApp()
    .then((app) => {
      const PORT = Number(process.env.PORT) || 3000;
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}
