import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { optionalAuth } from '../../middleware/optionalAuth';
import { validate } from '../../middleware/validate';
import {
  draftSubmissionSchema,
  finalizeSubmissionSchema,
} from './submissions.schemas';
import {
  saveDraftHandler,
  finalizeSubmissionHandler,
  getSubmissionByProjectHandler,
} from './submissions.controller';

const router = Router();

// POST /api/submissions/draft - Save work in progress
router.post('/draft', requireAuth, validate(draftSubmissionSchema), saveDraftHandler);

// POST /api/submissions/finalize - Finalize and lock submission
router.post('/finalize', requireAuth, validate(finalizeSubmissionSchema), finalizeSubmissionHandler);

// GET /api/submissions/:projectId - Get submission status and history
router.get('/:projectId', optionalAuth, getSubmissionByProjectHandler);

export { router as submissionsRouter };
