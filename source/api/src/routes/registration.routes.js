import { Router } from 'express';
import { cancelRegistrationHandler } from '../controllers/registration.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.delete('/:id', protect, authorize('student'), cancelRegistrationHandler);

export default router;
