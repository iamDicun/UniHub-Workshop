import { Router } from 'express';
import {
  getWorkshops,
  getWorkshopById,
  createWorkshopHandler,
  updateWorkshopHandler,
  deleteWorkshopHandler,
  getWorkshopRegistrationsHandler,
  aiGenerateWorkshopHandler,
} from '../controllers/workshop.controller.js';
import {
  getWorkshopStaffHandler,
  addWorkshopStaffHandler,
  removeWorkshopStaffHandler,
} from '../controllers/workshopStaff.controller.js';
import { registerWorkshop } from '../controllers/registration.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { slidingWindowRateLimiter, globalRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.get('/', protect, getWorkshops);
router.get('/:id', protect, getWorkshopById);
router.get('/:id/registrations', protect, authorize('admin'), getWorkshopRegistrationsHandler);
router.post('/', protect, authorize('admin'), createWorkshopHandler);
router.post('/ai-generate', protect, authorize('admin'), aiGenerateWorkshopHandler);
router.put('/:id', protect, authorize('admin'), updateWorkshopHandler);
router.delete('/:id', protect, authorize('admin'), deleteWorkshopHandler);

// Áp dụng Rate Limiting: 1 user / 5s / 1 payment và 100 req / s toàn hệ thống
router.post('/:id/register', protect, authorize('student'), globalRateLimiter(100, 1000), slidingWindowRateLimiter(1, 5000), registerWorkshop);

router.get('/:id/staff', protect, authorize('admin'), getWorkshopStaffHandler);
router.post('/:id/staff', protect, authorize('admin'), addWorkshopStaffHandler);
router.delete('/:id/staff/:staffId', protect, authorize('admin'), removeWorkshopStaffHandler);

export default router;
