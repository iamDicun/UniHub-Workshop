import express from 'express';
import { login, getProfile } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getProfile);

export default router;
