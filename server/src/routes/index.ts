import { Router } from 'express';
import { healthRouter } from './health';

const router = Router();

router.use('/v1', healthRouter);

export { router as apiRouter };
