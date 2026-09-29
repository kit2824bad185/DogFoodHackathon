import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { optionalAuth } from '../../middleware/optionalAuth';
import { validate } from '../../middleware/validate';
import {
  createTeamSchema,
  inviteMemberSchema,
  joinTeamSchema,
} from './teams.schemas';
import {
  createTeamHandler,
  inviteMemberHandler,
  joinTeamHandler,
  removeMemberHandler,
  lockTeamHandler,
  getTeamByIdHandler,
} from './teams.controller';

const router = Router();

// POST /api/teams - Create team
router.post('/', requireAuth, validate(createTeamSchema), createTeamHandler);

// POST /api/teams/join - Join team via code or token
router.post('/join', requireAuth, validate(joinTeamSchema), joinTeamHandler);

// POST /api/teams/invite/accept - Accept invite
router.post('/invite/accept', requireAuth, validate(joinTeamSchema), joinTeamHandler);

// POST /api/teams/:id/invite - Captain invites member
router.post('/:id/invite', requireAuth, validate(inviteMemberSchema), inviteMemberHandler);

// DELETE /api/teams/:id/member/:userId - Remove or leave member
router.delete('/:id/member/:userId', requireAuth, removeMemberHandler);
router.delete('/:id/members/:userId', requireAuth, removeMemberHandler);

// POST /api/teams/:id/lock - Lock team roster
router.post('/:id/lock', requireAuth, lockTeamHandler);

// GET /api/teams/:id - Get team details
router.get('/:id', optionalAuth, getTeamByIdHandler);

export { router as teamsRouter };
