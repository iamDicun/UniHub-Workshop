import express from 'express';
import { syncUsers, getSyncJobs } from '../controllers/user.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Chỉ admin mới có quyền đồng bộ CSV
router.post('/sync', protect, authorize('admin'), syncUsers);
router.get('/sync', protect, authorize('admin'), getSyncJobs);

export default router;
