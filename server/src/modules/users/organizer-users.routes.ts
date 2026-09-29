import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import {
  getUsersQuerySchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
} from './users.schemas';
import {
  getUsersHandler,
  updateUserStatusHandler,
  updateUserRoleHandler,
} from './users.controller';

const router = Router();

// Protect all organizer user management routes with ORGANIZER or ADMIN role
router.use(requireAuth, requireRole('ORGANIZER', 'ADMIN'));

// GET /api/organizer/users
router.get('/', validate(getUsersQuerySchema), getUsersHandler);

// PATCH /api/organizer/users/:id/status
router.patch('/:id/status', validate(updateUserStatusSchema), updateUserStatusHandler);

// POST /api/organizer/users/:id/role
router.post('/:id/role', validate(updateUserRoleSchema), updateUserRoleHandler);

export { router as organizerUsersRouter };
