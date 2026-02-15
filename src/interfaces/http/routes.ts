import { Router } from 'express';
import type { AuthController } from './controllers/AuthController.js';
import type { ProtectedController } from './controllers/ProtectedController.js';

export function createRoutes(
  authController: AuthController,
  protectedController: ProtectedController,
): Router {
  const router = Router();
  router.use('/auth', authController.getRouter());
  router.use('/api', protectedController.getRouter());
  return router;
}
