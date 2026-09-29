import { Router } from 'express';
import { healthRouter } from './health';
import { judgingRouter } from './judging';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    service: 'Dogfood 2026 Hackathon REST API',
    status: 'online',
    version: '1.0.0',
    documentation: '/docs/member2-judging-integration.md',
    webInterface: 'http://localhost:5173',
    endpoints: {
      health: '/api/v1/health',
      judgingResults: '/api/v1/judging/results',
      judgingAssignments: '/api/v1/judging/assignments',
      normalization: '/api/v1/judging/normalize',
    },
  });
});

router.use('/v1', healthRouter);
router.use('/v1/judging', judgingRouter);
router.use('/judging', judgingRouter);

export { router as apiRouter };

