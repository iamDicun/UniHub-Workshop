import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  addWorkshopImageHandler,
  getWorkshopImagesHandler,
  deleteWorkshopImageHandler,
} from '../controllers/workshop.controller.js';

const router = Router({ mergeParams: true });

// GET /api/workshops/:id/images — list images (any authenticated user)
router.get('/', protect, getWorkshopImagesHandler);

// POST /api/workshops/:id/images — add image (admin only)
router.post('/', protect, authorize('admin'), addWorkshopImageHandler);

// DELETE /api/workshops/:id/images/:imageId — remove image (admin only)
router.delete('/:imageId', protect, authorize('admin'), deleteWorkshopImageHandler);

export default router;
