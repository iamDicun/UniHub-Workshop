import { processWebhook, processWebhookTest, listMyPayments, listAdminPayments, markPaymentAsFailed } from '../services/payment.service.js';

export const handlePayOSWebhook = async (req, res) => {
  try {
    // PayOS có thể gửi request test khi bạn cấu hình Webhook URL
    // Nếu body rỗng hoặc không có data, trả về 200 OK để xác nhận URL hoạt động
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: true, message: 'Webhook URL is active' });
    }

    const isWebhookTest = req.body?.testMode === true || req.get('x-webhook-test') === '1';

    const result = isWebhookTest
      ? await processWebhookTest(req.body)
      : await processWebhook(req.body);

    if (!result) {
      return res.json({ success: true });
    }
    res.json({ success: true, message: result.status });
  } catch (error) {
    console.error('[PayOS Webhook] Error:', error);
    if (
      error.message?.includes('Invalid webhook data') &&
      (req.body?.testMode === true || req.get('x-webhook-test') === '1')
    ) {
      try {
        const result = await processWebhookTest(req.body);
        if (!result) {
          return res.json({ success: true });
        }
        return res.json({ success: true, message: result.status });
      } catch (testError) {
        console.error('[PayOS Webhook Test Fallback] Error:', testError);
        return res.status(400).json({ success: false, message: testError.message });
      }
    }
    // TRƯỜNG HỢP QUAN TRỌNG: Khi bạn nhấn "Xác nhận" trên Dashboard PayOS, 
    // họ sẽ gửi request test. Nếu SDK verify lỗi ở bước này, ta vẫn trả về 200 
    // để Dashboard chấp nhận URL. Các lỗi thực tế sẽ được log ở console.
    res.status(200).json({ success: false, message: error.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await listMyPayments(req.user.id);
    res.json({ status: 'success', data: payments });
  } catch (error) {
    console.error('[Payments] Get my payments error:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi server' });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const payments = await listAdminPayments();
    res.json({ status: 'success', data: payments });
  } catch (error) {
    console.error('[Payments] Admin get payments error:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi server' });
  }
};

export const handlePaymentCancellation = async (req, res) => {
  try {
    const { orderCode } = req.body;
    if (!orderCode) {
      return res.status(400).json({ status: 'error', message: 'Order code is required' });
    }
    
    const result = await markPaymentAsFailed(orderCode);
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error('[Payments] Cancel payment error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
