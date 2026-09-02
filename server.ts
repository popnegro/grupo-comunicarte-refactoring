import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase, pool, isDatabaseConfigured } from './src/db/index.ts';
import { getAllSupportsFromDB, getSupportByIdFromDB } from './src/server/supportsService.ts';
import { handleMediakitRequest, getAllMediakitRequestsFromDB } from './src/server/mediakitService.ts';
import { handleMediaUpload } from './src/server/multimediaUpload.ts';
import {
  authenticateAdmin, verifyAdminToken, getAdminStats, updateRequestStatusByAdmin,
  listAdminSupports, getAdminSupportById, createAdminSupport, updateSupportByAdmin,
  deactivateSupportByAdmin, getSupportMediaByAdmin, addSupportMediaByAdmin,
  updateSupportMediaByAdmin, removeSupportMediaByAdmin, getSupportPricingByAdmin,
  patchSupportPricingByAdmin, getSupportRouteByAdmin, patchSupportRouteByAdmin,
} from './src/server/adminService.ts';

export async function createApp() {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS || 'https://grupocomunicarte.vercel.app,http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') return (!origin || allowedOrigins.includes(origin)) ? res.sendStatus(204) : res.sendStatus(403);
    next();
  });
  app.use(express.json());
  try { await initDatabase(); } catch (err) { console.warn('Database initialization warning on startup:', err); }

  app.get('/api/health', async (_req, res) => {
    if (!isDatabaseConfigured) return res.status(200).json({ status: 'ok', database: 'static-fallback' });
    try { await pool.query('SELECT 1'); res.status(200).json({ status: 'ok', database: 'connected' }); }
    catch (err: any) { res.status(200).json({ status: 'ok', database: 'disconnected', error: err.message }); }
  });

  app.get('/api/supports', async (_req, res) => { try { res.status(200).json({ status: 'success', data: await getAllSupportsFromDB() }); } catch (err) { console.error('Error fetching supports:', err); res.status(500).json({ status: 'error', message: 'Error interno al obtener el inventario de soportes.' }); } });
  app.get('/api/supports/:id', async (req, res) => { try { const support = await getSupportByIdFromDB(req.params.id); if (!support) return res.status(404).json({ status: 'error', message: `Soporte con ID '${req.params.id}' no encontrado.` }); res.status(200).json({ status: 'success', data: support }); } catch (err) { console.error(`Error fetching support ${req.params.id}:`, err); res.status(500).json({ status: 'error', message: 'Error interno al obtener el soporte.' }); } });

  app.post('/api/mediakit/request', async (req, res) => { try { const result = await handleMediakitRequest(req.body); res.status(result.statusCode).json(result.response); } catch (err) { console.error('Error in /api/mediakit/request:', err); res.status(500).json({ status: 'error', message: 'Error interno del servidor.' }); } });

  app.post('/api/admin/login', (req, res) => { const { username, password } = req.body || {}; const result = authenticateAdmin(username, password); if (!result.success) return res.status(401).json({ status: 'error', message: result.message }); res.status(200).json({ status: 'success', token: result.token, message: 'Autenticación exitosa' }); });
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => { if (!verifyAdminToken(req.headers.authorization)) return res.status(401).json({ status: 'error', message: 'No autorizado. Se requiere token de administrador válido.' }); next(); };

  app.post('/api/admin/supports/:id/media/upload', requireAdmin, express.raw({ type: 'multipart/form-data', limit: '10mb' }), handleMediaUpload);
  app.get('/api/admin/stats', requireAdmin, async (_req, res) => { try { res.status(200).json({ status: 'success', data: await getAdminStats() }); } catch (err) { console.error('Error fetching admin stats:', err); res.status(500).json({ status: 'error', message: 'Error interno al obtener estadísticas.' }); } });
  app.get('/api/admin/supports', requireAdmin, async (_req, res) => { try { res.status(200).json({ status: 'success', data: await listAdminSupports() }); } catch (err) { console.error('Error fetching admin supports:', err); res.status(500).json({ status: 'error', message: 'Error interno al obtener inventario.' }); } });
  app.get('/api/admin/supports/:id', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await getAdminSupportById(req.params.id) }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('no encontrado') ? 404 : 500).json({ status: 'error', message: msg || 'Error al obtener el soporte.' }); } });
  app.post('/api/admin/supports', requireAdmin, async (req, res) => { try { res.status(201).json({ status: 'success', data: await createAdminSupport(req.body || {}), message: 'Soporte creado exitosamente.' }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('vacío') || msg.includes('inválida') || msg.includes('desconocida') ? 400 : 500).json({ status: 'error', message: msg || 'Error al crear el soporte.' }); } });
  app.patch('/api/admin/supports/:id', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await updateSupportByAdmin(req.params.id, req.body), message: 'Soporte actualizado exitosamente.' }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('no encontrado') ? 404 : msg.includes('inválido') ? 400 : 500).json({ status: 'error', message: msg || 'Error al actualizar el soporte.' }); } });
  app.delete('/api/admin/supports/:id', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await deactivateSupportByAdmin(req.params.id), message: 'Soporte desactivado exitosamente.' }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('no encontrado') ? 404 : 500).json({ status: 'error', message: msg || 'Error al desactivar el soporte.' }); } });
  app.get('/api/admin/supports/:id/media', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await getSupportMediaByAdmin(req.params.id) }); } catch (err) { console.error(err); res.status(500).json({ status: 'error', message: 'Error al obtener media.' }); } });
  app.post('/api/admin/supports/:id/media', requireAdmin, async (req, res) => { try { res.status(201).json({ status: 'success', data: await addSupportMediaByAdmin(req.params.id, req.body || {}) }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('inválido') ? 400 : 500).json({ status: 'error', message: msg || 'Error al crear media.' }); } });
  app.patch('/api/admin/supports/:id/media/:mediaId', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await updateSupportMediaByAdmin(req.params.id, Number(req.params.mediaId), req.body || {}) }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('no encontrada') ? 404 : msg.includes('inválido') ? 400 : 500).json({ status: 'error', message: msg || 'Error al actualizar media.' }); } });
  app.delete('/api/admin/supports/:id/media/:mediaId', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await removeSupportMediaByAdmin(req.params.id, Number(req.params.mediaId)) }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('no encontrada') ? 404 : 500).json({ status: 'error', message: msg || 'Error al eliminar media.' }); } });
  app.get('/api/admin/supports/:id/pricing', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await getSupportPricingByAdmin(req.params.id) }); } catch (err) { res.status(500).json({ status: 'error', message: 'Error al obtener pricing.' }); } });
  app.patch('/api/admin/supports/:id/pricing', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await patchSupportPricingByAdmin(req.params.id, req.body || {}) }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('negativo') || msg.includes('inválido') ? 400 : 500).json({ status: 'error', message: msg || 'Error al actualizar el pricing.' }); } });
  app.get('/api/admin/supports/:id/route', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await getSupportRouteByAdmin(req.params.id) }); } catch (err) { res.status(500).json({ status: 'error', message: 'Error al obtener la ruta.' }); } });
  app.patch('/api/admin/supports/:id/route', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await patchSupportRouteByAdmin(req.params.id, req.body || {}) }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('inválido') ? 400 : 500).json({ status: 'error', message: msg || 'Error al actualizar la ruta.' }); } });
  app.get('/api/admin/requests', requireAdmin, async (_req, res) => { try { res.status(200).json({ status: 'success', data: await getAllMediakitRequestsFromDB() }); } catch (err) { res.status(500).json({ status: 'error', message: 'Error interno al obtener solicitudes.' }); } });
  app.patch('/api/admin/requests/:id', requireAdmin, async (req, res) => { try { res.status(200).json({ status: 'success', data: await updateRequestStatusByAdmin(req.params.id, req.body?.status), message: 'Estado de solicitud actualizado.' }); } catch (err: any) { const msg = err.message || ''; res.status(msg.includes('no encontrada') ? 404 : msg.includes('inválido') ? 400 : 500).json({ status: 'error', message: msg || 'Error al actualizar la solicitud.' }); } });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  return app;
}

if (!process.env.VERCEL) {
  createApp().then((app) => app.listen(3000, '0.0.0.0', () => console.log('Server running on http://0.0.0.0:3000'))).catch((err) => { console.error('Failed to start server:', err); process.exit(1); });
}
