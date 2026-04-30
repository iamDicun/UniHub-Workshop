import { Router } from 'express';
import {
  getWorkshops,
  getWorkshopById,
  createWorkshopHandler,
  updateWorkshopHandler,
  deleteWorkshopHandler,
  getWorkshopRegistrationsHandler,
} from '../controllers/workshop.controller.js';
import {
  getWorkshopStaffHandler,
  addWorkshopStaffHandler,
  removeWorkshopStaffHandler,
} from '../controllers/workshopStaff.controller.js';
import { registerWorkshop } from '../controllers/registration.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { slidingWindowRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.get('/', protect, getWorkshops);
router.get('/:id', protect, getWorkshopById);
router.get('/:id/registrations', protect, authorize('admin'), getWorkshopRegistrationsHandler);
router.post('/', protect, authorize('admin'), createWorkshopHandler);
router.put('/:id', protect, authorize('admin'), updateWorkshopHandler);
router.delete('/:id', protect, authorize('admin'), deleteWorkshopHandler);

// Áp dụng Rate Limiting: Tối đa 2 request mỗi 10 giây cho hành động đăng ký
router.post('/:id/register', protect, authorize('student'), slidingWindowRateLimiter(2, 10000), registerWorkshop);

router.get('/:id/staff', protect, authorize('admin'), getWorkshopStaffHandler);
router.post('/:id/staff', protect, authorize('admin'), addWorkshopStaffHandler);
router.delete('/:id/staff/:staffId', protect, authorize('admin'), removeWorkshopStaffHandler);

export default router;
