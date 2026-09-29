import { Router } from 'express';
import { healthRouter } from './health';
import { authRouter } from '../modules/auth';
import { usersRouter, organizerUsersRouter } from '../modules/users';
import { eventsRouter, getEventEligibilityReportHandler } from '../modules/events';
import { teamsRouter } from '../modules/teams';
import { projectsRouter } from '../modules/projects';
import { submissionsRouter } from '../modules/submissions';
import { auditRouter } from '../modules/audit';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
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

// Auth
router.use('/auth', authRouter);
router.use('/v1/auth', authRouter);

// Users
router.use('/users', usersRouter);
router.use('/v1/users', usersRouter);

// Organizer Administration
router.use('/organizer/users', organizerUsersRouter);
router.use('/v1/organizer/users', organizerUsersRouter);

// Organizer Event Eligibility Reports
router.get(
  '/organizer/events/:id/eligibility-report',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  getEventEligibilityReportHandler
);
router.get(
  '/v1/organizer/events/:id/eligibility-report',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  getEventEligibilityReportHandler
);

// Organizer Audit Logs & Audit Route
router.use('/organizer/audit-logs', auditRouter);
router.use('/v1/organizer/audit-logs', auditRouter);
router.use('/audit', auditRouter);
router.use('/v1/audit', auditRouter);

// Events & Tracks
router.use('/events', eventsRouter);
router.use('/v1/events', eventsRouter);

// Teams
router.use('/teams', teamsRouter);
router.use('/v1/teams', teamsRouter);

// Projects
router.use('/projects', projectsRouter);
router.use('/v1/projects', projectsRouter);

// Submissions
router.use('/submissions', submissionsRouter);
router.use('/v1/submissions', submissionsRouter);

export { router as apiRouter };

