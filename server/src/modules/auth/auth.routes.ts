import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/requireAuth';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from './auth.schemas';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  getMeHandler,
  changePasswordHandler,
} from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.post('/logout', requireAuth, logoutHandler);
router.get('/me', requireAuth, getMeHandler);
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePasswordHandler);

export { router as authRouter };
