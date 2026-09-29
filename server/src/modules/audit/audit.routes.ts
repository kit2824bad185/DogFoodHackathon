import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { getAuditLogsHandler } from './audit.controller';

const router = Router();

// Protected by requireAuth and requireRole('ORGANIZER', 'ADMIN')
router.use(requireAuth, requireRole('ORGANIZER', 'ADMIN'));

// GET /api/organizer/audit-logs & /api/audit
router.get('/', getAuditLogsHandler);

export { router as auditRouter };
