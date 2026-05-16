import express from 'express';
import { handlePayOSWebhook, handlePayOSWebhookTest, getMyPayments, getAdminPayments, handlePaymentCancellation } from '../controllers/payment.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/webhook', handlePayOSWebhook);
router.post('/webhook/test', handlePayOSWebhookTest);
router.post('/cancel', protect, handlePaymentCancellation);
router.get('/my-payments', protect, authorize('student'), getMyPayments);
router.get('/', protect, authorize('admin'), getAdminPayments);

export default router;
