import { Router } from 'express';
import { createCheckin } from '../controllers/checkin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', protect, authorize('staff'), createCheckin);

export default router;
