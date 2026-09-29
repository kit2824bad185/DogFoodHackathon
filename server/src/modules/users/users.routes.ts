import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from './users.schemas';
import { updateProfileHandler } from './users.controller';

const router = Router();

// PUT /api/users/profile
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfileHandler);

export { router as usersRouter };
