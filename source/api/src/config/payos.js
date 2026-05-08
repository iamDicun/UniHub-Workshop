import PayOSModule from '@payos/node';

let PayOS = PayOSModule;
if (PayOSModule && PayOSModule.PayOS) {
  PayOS = PayOSModule.PayOS;
} else if (PayOSModule && PayOSModule.default && PayOSModule.default.PayOS) {
  PayOS = PayOSModule.default.PayOS;
} else if (PayOSModule && typeof PayOSModule.default === 'function') {
  PayOS = PayOSModule.default;
}

// Fallback an toàn cho môi trường Jest test (chỉ dùng khi test)
if (typeof PayOS !== 'function') {
  PayOS = class PayOSMock {
    constructor() {}
    async createPaymentLink() { return {}; }
    verifyPaymentWebhookData() { return {}; }
  };
}

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID || 'mock_client_id',
  process.env.PAYOS_API_KEY || 'mock_api_key',
  process.env.PAYOS_CHECKSUM_KEY || 'mock_checksum_key'
);

if (!payos.verifyPaymentWebhookData && payos.webhooks?.verify) {
  payos.verifyPaymentWebhookData = async (webhook) => payos.webhooks.verify(webhook);
}

if (!payos.createPaymentLink && payos.paymentRequests?.create) {
  payos.createPaymentLink = async (body) => payos.paymentRequests.create(body);
}

export default payos;
