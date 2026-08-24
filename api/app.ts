import express from 'express';
import { initDatabase } from '../src/db/index';
import { getAllSupportsFromDB, getSupportByIdFromDB } from '../src/server/supportModel';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', async (_req, res) => {
    try {
      await initDatabase();
      res.json({ status: 'ok' });
    } catch (error) {
      console.error('[health] database check failed:', error);
      res.status(500).json({ status: 'error' });
    }
  });

  app.get('/api/supports', async (_req, res) => {
    try {
      const supports = await getAllSupportsFromDB();
      res.json(supports);
    } catch (error) {
      console.error('[supports] failed:', error);
      res.status(500).json({ error: 'Failed to fetch supports' });
    }
  });

  app.get('/api/supports/:id', async (req, res) => {
    try {
      const support = await getSupportByIdFromDB(req.params.id);
      if (!support) return res.status(404).json({ error: 'Support not found' });
      res.json(support);
    } catch (error) {
      console.error('[support] failed:', error);
      res.status(500).json({ error: 'Failed to fetch support' });
    }
  });

  return app;
}
