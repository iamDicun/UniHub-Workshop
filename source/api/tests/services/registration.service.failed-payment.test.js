import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/registration.repository.js', () => ({
  findRegistrationByStudentAndWorkshop: jest.fn(),
  findRegistrationForCancel: jest.fn(),
  createRegistration: jest.fn(),
  updateRegistrationStatus: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/workshop.repository.js', () => ({
  getWorkshopForUpdate: jest.fn(),
  getWorkshopById: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/checkin.repository.js', () => ({
  findCheckinByRegistrationId: jest.fn()
}));

jest.unstable_mockModule('../../src/services/workshop.cache.js', () => ({
  setCachedWorkshop: jest.fn(),
  deleteCachedWorkshop: jest.fn()
}));

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    connect: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/config/payos.breaker.js', () => ({
  payosCircuitBreaker: {
    fire: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/queue/notification.producer.js', () => ({
  publishRegistrationEvent: jest.fn()
}));

const { registerForWorkshop } = await import('../../src/services/registration.service.js');
const repo = await import('../../src/repositories/registration.repository.js');
const workshopRepo = await import('../../src/repositories/workshop.repository.js');
const cache = await import('../../src/services/workshop.cache.js');
const db = await import('../../src/config/db.js');
const { payosCircuitBreaker } = await import('../../src/config/payos.breaker.js');
const producer = await import('../../src/queue/notification.producer.js');

describe('registerForWorkshop - Failed Payment Scenario', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    db.default.connect.mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  it('should create new payment link when retrying after failed status', async () => {
    // Simulate: Student registered, got failed payment, now retrying
    const existingRegistration = { 
      id: 123, 
      status: 'pending', 
      workshop_id: 1, 
      student_id: 999 
    };
    const failedPayment = {
      id: 50,
      order_code: 'OLD-001',
      checkout_url: null,
      status: 'failed'
    };
    const newPaymentData = {
      id: 51,
      order_code: 'NEW-001'
    };
    const newCheckoutUrl = 'https://payos.vn/checkout?id=NEW-001';

    repo.findRegistrationByStudentAndWorkshop.mockResolvedValue(existingRegistration);
    workshopRepo.getWorkshopForUpdate.mockResolvedValue({ 
      id: 1, 
      title: 'Workshop A',
      price: 50000,
      available_seats: 10,
      capacity: 20
    });

    // Mock database responses for resume path
    let callCount = 0;
    mockClient.query.mockImplementation((sql, params) => {
      callCount++;
      if (sql.includes('SELECT id, order_code, checkout_url, status FROM payments')) {
        return Promise.resolve({ rowCount: 1, rows: [failedPayment] });
      }
      if (sql.includes('INSERT INTO payments')) {
        return Promise.resolve({ rowCount: 1, rows: [newPaymentData] });
      }
      if (sql.includes('UPDATE payments SET external_id')) {
        return Promise.resolve({});
      }
      if (sql === 'COMMIT' || sql === 'BEGIN') {
        return Promise.resolve({});
      }
      return Promise.resolve({});
    });

    // Mock PayOS payment link creation
    payosCircuitBreaker.fire.mockResolvedValue({
      checkoutUrl: newCheckoutUrl,
      paymentLinkId: 'ext-NEW-001'
    });

    const result = await registerForWorkshop(999, 1);

    // Assertions
    expect(result.checkout_url).toBe(newCheckoutUrl);
    expect(result.order_code).toBe('NEW-001');
    expect(result.status).toBe('pending');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('should handle PayOS errors gracefully when retrying', async () => {
    const existingRegistration = { 
      id: 123, 
      status: 'pending', 
      workshop_id: 1, 
      student_id: 999 
    };
    const failedPayment = {
      id: 50,
      order_code: 'OLD-001',
      checkout_url: null,
      status: 'failed'
    };
    const newPaymentData = {
      id: 51,
      order_code: 'NEW-001'
    };

    repo.findRegistrationByStudentAndWorkshop.mockResolvedValue(existingRegistration);
    workshopRepo.getWorkshopForUpdate.mockResolvedValue({ 
      id: 1, 
      title: 'Workshop A',
      price: 50000,
      available_seats: 10,
      capacity: 20
    });

    mockClient.query.mockImplementation((sql) => {
      if (sql.includes('SELECT id, order_code, checkout_url, status FROM payments')) {
        return Promise.resolve({ rowCount: 1, rows: [failedPayment] });
      }
      if (sql.includes('INSERT INTO payments')) {
        return Promise.resolve({ rowCount: 1, rows: [newPaymentData] });
      }
      if (sql === 'COMMIT' || sql === 'BEGIN') {
        return Promise.resolve({});
      }
      return Promise.resolve({});
    });

    // Mock PayOS failure
    const payosError = new Error('PayOS service unavailable');
    payosCircuitBreaker.fire.mockRejectedValue(payosError);

    const result = await registerForWorkshop(999, 1);

    // Should return graceful degradation response with error message
    expect(result.checkout_url).toBeNull();
    expect(result.message).toBeDefined();
    expect(result.order_code).toBe('NEW-001'); // New payment still created
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('should always create new checkout link when payment status is failed', async () => {
    const existingRegistration = { 
      id: 123, 
      status: 'pending', 
      workshop_id: 1, 
      student_id: 999 
    };
    const failedPaymentWithUrl = {
      id: 50,
      order_code: 'OLD-001',
      checkout_url: 'https://old-expired-link.com',  // Has old URL but marked as failed
      status: 'failed'
    };
    const newPaymentData = {
      id: 51,
      order_code: 'NEW-002'
    };
    const newCheckoutUrl = 'https://payos.vn/checkout?id=NEW-002';

    repo.findRegistrationByStudentAndWorkshop.mockResolvedValue(existingRegistration);
    workshopRepo.getWorkshopForUpdate.mockResolvedValue({ 
      id: 1, 
      title: 'Workshop C',
      price: 100000,
      available_seats: 5,
      capacity: 20
    });

    mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes('SELECT id, order_code, checkout_url, status FROM payments')) {
        return Promise.resolve({ rowCount: 1, rows: [failedPaymentWithUrl] });
      }
      if (sql.includes('INSERT INTO payments')) {
        return Promise.resolve({ rowCount: 1, rows: [newPaymentData] });
      }
      if (sql.includes('UPDATE payments SET external_id')) {
        return Promise.resolve({});
      }
      if (sql === 'COMMIT' || sql === 'BEGIN') {
        return Promise.resolve({});
      }
      return Promise.resolve({});
    });

    payosCircuitBreaker.fire.mockResolvedValue({
      checkoutUrl: newCheckoutUrl,
      paymentLinkId: 'ext-NEW-002'
    });

    const result = await registerForWorkshop(999, 1);

    // When previous payment is marked failed, always create new one
    expect(result.checkout_url).toBe(newCheckoutUrl);
    expect(result.order_code).toBe('NEW-002');  // New payment, not old one
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO payments'),
      expect.arrayContaining([123, 100000])
    );
  });
});
