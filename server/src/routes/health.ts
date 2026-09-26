import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from '../config/logger';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Check DB connection
    await db.run(sql`SELECT 1`);
    
    sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');
    sendError(res, 'HEALTH_CHECK_FAILED', 'Service is unhealthy', null, 503);
  }
});

export { router as healthRouter };
