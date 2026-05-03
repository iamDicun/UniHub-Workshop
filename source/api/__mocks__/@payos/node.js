class PayOS {
  constructor(clientId, apiKey, checksumKey) {
    this.clientId = clientId;
    this.apiKey = apiKey;
    this.checksumKey = checksumKey;
    this.webhooks = {
      verify: jest.fn(),
      confirm: jest.fn()
    };
    this.paymentRequests = {
      create: jest.fn(),
      get: jest.fn(),
      cancel: jest.fn(),
      invoices: {}
    };
  }
  
  createPaymentLink = jest.fn();
  verifyPaymentWebhookData = jest.fn();
  getPaymentLinkInformation = jest.fn();
  cancelPaymentLink = jest.fn();
  confirmWebhook = jest.fn();
}

module.exports = PayOS;
