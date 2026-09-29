import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { optionalAuth } from '../../middleware/optionalAuth';
import { validate } from '../../middleware/validate';
import {
  createEventSchema,
  addTrackSchema,
  updatePhaseSchema,
} from './events.schemas';
import {
  createEventHandler,
  getEventsHandler,
  getEventByIdHandler,
  addTrackHandler,
  transitionPhaseHandler,
  getEventEligibilityReportHandler,
} from './events.controller';

const router = Router();

// POST /api/events - Create event (ORGANIZER/ADMIN)
router.post(
  '/',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(createEventSchema),
  createEventHandler
);

// GET /api/events - List events (public, organizers see drafts)
router.get('/', optionalAuth, getEventsHandler);

// GET /api/events/:id - Get single event details
router.get('/:id', optionalAuth, getEventByIdHandler);

// POST /api/events/:id/tracks - Add track (ORGANIZER/ADMIN)
router.post(
  '/:id/tracks',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(addTrackSchema),
  addTrackHandler
);

// PATCH /api/events/:id/phase - Phase transition (ORGANIZER/ADMIN)
router.patch(
  '/:id/phase',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(updatePhaseSchema),
  transitionPhaseHandler
);

// GET /api/events/:id/eligibility-report - Eligibility report (ORGANIZER/ADMIN)
router.get(
  '/:id/eligibility-report',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  getEventEligibilityReportHandler
);

export { router as eventsRouter };
