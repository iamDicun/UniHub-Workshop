import express from 'express';
import { getFailedJobs, retryFailedJob } from '../controllers/job.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/failed-jobs', protect, authorize('admin'), getFailedJobs);
router.post('/failed-jobs/:id/retry', protect, authorize('admin'), retryFailedJob);

export default router;
