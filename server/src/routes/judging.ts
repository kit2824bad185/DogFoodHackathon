import { Router } from 'express';
import { judgingController } from '../modules/judging/judging.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ==========================================
// 1. Judge Evaluation Endpoints
// ==========================================

// GET /api/v1/judging/assignments (Judge retrieves own assigned submissions)
router.get(
  '/assignments',
  authenticate,
  requireRole(['judge', 'admin']),
  (req, res) => judgingController.getAssignments(req, res)
);

// GET /api/v1/judging/assignments/:assignmentId (Judge gets assignment & rubric details)
router.get(
  '/assignments/:assignmentId',
  authenticate,
  requireRole(['judge', 'admin']),
  (req, res) => judgingController.getAssignmentDetails(req, res)
);

// POST /api/v1/judging/assignments/:assignmentId/conflict (Judge declares conflict)
router.post(
  '/assignments/:assignmentId/conflict',
  authenticate,
  requireRole(['judge', 'admin']),
  (req, res) => judgingController.reportConflict(req, res)
);

// PUT & POST /api/v1/judging/assignments/:assignmentId/score (Save draft or submit final score)
router.put(
  '/assignments/:assignmentId/score',
  authenticate,
  requireRole(['judge', 'admin']),
  (req, res) => judgingController.submitScore(req, res)
);

router.post(
  '/assignments/:assignmentId/score',
  authenticate,
  requireRole(['judge', 'admin']),
  (req, res) => judgingController.submitScore(req, res)
);

// ==========================================
// 2. Results Endpoints
// ==========================================

// GET /api/v1/judging/results (Anonymized final rankings without private judge scores)
router.get(
  '/results',
  authenticate,
  (req, res) => judgingController.getResults(req, res)
);

// ==========================================
// 3. Organizer / Admin Normalization Endpoints
// ==========================================

// POST /api/v1/judging/normalize (Trigger statistical Z-score normalization)
router.post(
  '/normalize',
  authenticate,
  requireRole(['organizer', 'admin']),
  (req, res) => judgingController.runNormalization(req, res)
);

// GET /api/v1/judging/normalization/:runId (Retrieve complete details of a specific run)
router.get(
  '/normalization/:runId',
  authenticate,
  requireRole(['organizer', 'admin']),
  (req, res) => judgingController.getNormalizationRun(req, res)
);

export { router as judgingRouter };
