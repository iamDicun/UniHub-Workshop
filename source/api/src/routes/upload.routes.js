import { Router } from 'express';
import {
  getPresignedUrl,
  confirmUpload,
} from '../controllers/upload.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/presigned', protect, getPresignedUrl);
router.put('/:fileId/confirm', protect, confirmUpload);

export default router;
