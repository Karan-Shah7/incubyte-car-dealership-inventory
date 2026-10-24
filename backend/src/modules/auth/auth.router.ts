import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { registerSchema, loginSchema } from './auth.schema';

const router = Router();

router.post('/register', validateBody(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', validateBody(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.get('/me', authenticate, (req, res) => authController.me(req, res));

export default router;
