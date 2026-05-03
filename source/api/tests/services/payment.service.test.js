import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    connect: jest.fn(),
    query: jest.fn(),
  }
}));

jest.unstable_mockModule('../../src/config/payos.js', () => ({
  default: {
    webhooks: {
      verify: jest.fn()
    }
  }
}));

jest.unstable_mockModule('../../src/queue/notification.producer.js', () => ({
  publishRegistrationEvent: jest.fn()
}));

const pool = (await import('../../src/config/db.js')).default;
const payos = (await import('../../src/config/payos.js')).default;
const { publishRegistrationEvent } = await import('../../src/queue/notification.producer.js');
const { processWebhook } = await import('../../src/services/payment.service.js');

describe('Payment Service - processWebhook', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  it('Nên bỏ qua nếu webhookCode không phải là 00', async () => {
    payos.webhooks.verify.mockResolvedValue({ code: '01' });

    const result = await processWebhook({});
    
    expect(result).toBeUndefined();
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it('Nên ném lỗi nếu không tìm thấy payment', async () => {
    payos.webhooks.verify.mockResolvedValue({ code: '00', orderCode: 123 });
    mockClient.query.mockImplementation((queryStr) => {
      if (queryStr === 'BEGIN') return Promise.resolve();
      if (queryStr.includes('SELECT * FROM payments WHERE order_code = $1 FOR UPDATE')) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });

    await expect(processWebhook({})).rejects.toThrow('Payment not found');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('Nên bỏ qua và return already_processed nếu payment đã paid', async () => {
    payos.webhooks.verify.mockResolvedValue({ code: '00', orderCode: 123 });
    mockClient.query.mockImplementation((queryStr) => {
      if (queryStr === 'BEGIN') return Promise.resolve();
      if (queryStr.includes('SELECT * FROM payments WHERE order_code = $1 FOR UPDATE')) return Promise.resolve({ rows: [{ id: 1, status: 'paid' }] });
      return Promise.resolve({ rows: [] });
    });

    const result = await processWebhook({});

    expect(result).toEqual({ status: 'already_processed' });
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT'); // Commit the FOR UPDATE lock
    expect(publishRegistrationEvent).not.toHaveBeenCalled();
  });

  it('Nên bỏ qua và return cancelled nếu registration đã bị huỷ', async () => {
    payos.webhooks.verify.mockResolvedValue({ code: '00', orderCode: 123 });
    mockClient.query.mockImplementation((queryStr) => {
      if (queryStr === 'BEGIN') return Promise.resolve();
      if (queryStr.includes('SELECT * FROM payments WHERE order_code = $1 FOR UPDATE')) return Promise.resolve({ rows: [{ id: 1, status: 'pending', registration_id: 10 }] });
      if (queryStr.includes('SELECT * FROM registrations WHERE id = $1 FOR UPDATE')) return Promise.resolve({ rows: [{ id: 10, status: 'cancelled' }] });
      return Promise.resolve({ rows: [] });
    });

    const result = await processWebhook({});

    expect(result).toEqual({ status: 'cancelled' });
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('Nên xử lý thành công, cập nhật trạng thái và đẩy Queue email', async () => {
    payos.webhooks.verify.mockResolvedValue({ code: '00', orderCode: 123 });
    mockClient.query.mockImplementation((queryStr) => {
      if (queryStr === 'BEGIN') return Promise.resolve();
      if (queryStr === 'COMMIT') return Promise.resolve();
      if (queryStr.includes('SELECT * FROM payments WHERE order_code = $1 FOR UPDATE')) return Promise.resolve({ rows: [{ id: 1, status: 'pending', registration_id: 10 }] });
      if (queryStr.includes('SELECT * FROM registrations WHERE id = $1 FOR UPDATE')) return Promise.resolve({ rows: [{ id: 10, status: 'pending', student_id: 99, workshop_id: 88 }] });
      return Promise.resolve({ rows: [] });
    });
    
    const result = await processWebhook({});

    expect(result).toEqual({ status: 'success' });
    // Kiểm tra UPDATE payments
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE payments SET status = $1 WHERE id = $2'), ['paid', 1]);
    // Kiểm tra UPDATE registrations
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE registrations'), [10, 'confirmed']);
    // Kiểm tra COMMIT
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    // Kiểm tra push Event
    expect(publishRegistrationEvent).toHaveBeenCalledWith({
      studentId: 99,
      workshopId: 88,
      registrationId: 10
    });
  });
});
