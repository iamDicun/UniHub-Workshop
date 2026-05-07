import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    connect: jest.fn(),
    query: jest.fn(),
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

const pool = (await import('../../src/config/db.js')).default;
const { payosCircuitBreaker } = await import('../../src/config/payos.breaker.js');
const { publishRegistrationEvent } = await import('../../src/queue/notification.producer.js');
jest.unstable_mockModule('../../src/repositories/registration.repository.js', () => ({
  findRegistrationByStudentAndWorkshop: jest.fn(),
  createRegistration: jest.fn(),
  findRegistrationForCancel: jest.fn(),
  updateRegistrationStatus: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/workshop.repository.js', () => ({
  getWorkshopForUpdate: jest.fn(),
  decrementSeats: jest.fn(),
  incrementSeats: jest.fn(),
  getWorkshopById: jest.fn()
}));

jest.unstable_mockModule('../../src/services/workshop.cache.js', () => ({
  setCachedWorkshop: jest.fn(),
  deleteCachedWorkshop: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/checkin.repository.js', () => ({
  findCheckinByRegistrationId: jest.fn()
}));

const repo = await import('../../src/repositories/registration.repository.js');
const workshopRepo = await import('../../src/repositories/workshop.repository.js');
const cache = await import('../../src/services/workshop.cache.js');
const { registerForWorkshop } = await import('../../src/services/registration.service.js');

describe('Registration Service - PayOS Fallback', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  it('Nên xử lý Graceful Degradation khi Circuit Breaker bị Open (Lỗi thanh toán)', async () => {
    workshopRepo.getWorkshopForUpdate.mockResolvedValue({ id: 88, price: 50000 });
    repo.findRegistrationByStudentAndWorkshop.mockResolvedValue(null);
    workshopRepo.decrementSeats.mockResolvedValue(true);
    repo.createRegistration.mockResolvedValue({ id: 10, status: 'pending', workshop_id: 88 });
    workshopRepo.getWorkshopById.mockResolvedValue({ id: 88, price: 50000 });
    
    mockClient.query.mockResolvedValue({ rows: [{ id: 1, order_code: 123 }] }); // createPayment

    // Giả lập Circuit Breaker ném lỗi
    payosCircuitBreaker.fire.mockRejectedValue(new Error('Cổng thanh toán sập'));

    const result = await registerForWorkshop(88, 99);

    // Không throw error, vẫn return thành công với thông báo
    expect(result.status).toBe('pending');
    expect(result.checkout_url).toBeNull();
    expect(result.message).toContain('Hệ thống thanh toán tạm thời gián đoạn. Đơn đăng ký của bạn đã được ghi nhận. Vui lòng quay lại thanh toán sau.');
    expect(result.message).toContain('Cổng thanh toán sập'); // Error message from circuit breaker
    
    // Đảm bảo Transaction vẫn được COMMIT chứ không ROLLBACK
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    
    // Đảm bảo không đẩy Queue email vì chưa thanh toán xong
    expect(publishRegistrationEvent).not.toHaveBeenCalled();
  });
});
