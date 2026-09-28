import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { optionalAuth } from '../../middleware/optionalAuth';
import { validate } from '../../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
} from './projects.schemas';
import {
  createProjectHandler,
  updateProjectHandler,
  getProjectByIdHandler,
  getProjectEligibilityHandler,
} from './projects.controller';

const router = Router();

// POST /api/projects - Captain creates project
router.post('/', requireAuth, validate(createProjectSchema), createProjectHandler);

// PUT /api/projects/:id - Team members update project
router.put('/:id', requireAuth, validate(updateProjectSchema), updateProjectHandler);

// PATCH /api/projects/:id - Team members update project
router.patch('/:id', requireAuth, validate(updateProjectSchema), updateProjectHandler);

// GET /api/projects/:id - Get project details
router.get('/:id', optionalAuth, getProjectByIdHandler);

// GET /api/projects/:id/eligibility - Evaluate and return project eligibility
router.get('/:id/eligibility', optionalAuth, getProjectEligibilityHandler);

export { router as projectsRouter };
