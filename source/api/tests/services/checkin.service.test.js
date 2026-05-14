import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/registration.repository.js', () => ({
  getRegistrationById: jest.fn(),
  getRegistrationDetails: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/checkin.repository.js', () => ({
  findCheckinByRegistrationId: jest.fn(),
  createCheckin: jest.fn()
}));

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    connect: jest.fn(),
    query: jest.fn()
  }
}));

const regRepo = await import('../../src/repositories/registration.repository.js');
const checkinRepo = await import('../../src/repositories/checkin.repository.js');
const pool = (await import('../../src/config/db.js')).default;
const { checkInRegistration } = await import('../../src/services/checkin.service.js');

describe('checkin.service.js', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkInRegistration', () => {
    it('should checkin successfully', async () => {
      regRepo.getRegistrationById.mockResolvedValue({ status: 'confirmed', workshop_id: 100 });
      checkinRepo.findCheckinByRegistrationId.mockResolvedValue(null);
      checkinRepo.createCheckin.mockResolvedValue({ id: 1 });
      regRepo.getRegistrationDetails.mockResolvedValue({ id: 1 });
      
      mockClient.query.mockResolvedValue({ rows: [{}] });

      const result = await checkInRegistration(100, 1, new Date().toISOString(), { role: 'staff', id: 2 });
      
      expect(result.checkin.id).toBe(1);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw if already checked in', async () => {
      regRepo.getRegistrationById.mockResolvedValue({ status: 'confirmed', workshop_id: 100 });
      checkinRepo.findCheckinByRegistrationId.mockResolvedValue({ id: 1 });

      await expect(checkInRegistration(100, 1, null, null)).rejects.toThrow('Dang ky da duoc check-in');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw if registration not confirmed', async () => {
      regRepo.getRegistrationById.mockResolvedValue({ status: 'cancelled', workshop_id: 100 });

      await expect(checkInRegistration(100, 1, null, null)).rejects.toThrow('Dang ky chua duoc xac nhan hoac da huy');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
