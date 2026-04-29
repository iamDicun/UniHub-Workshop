import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/registration.repository.js', () => ({
  findRegistrationByStudentAndWorkshop: jest.fn(),
  findRegistrationForCancel: jest.fn(),
  createRegistration: jest.fn(),
  updateRegistrationStatus: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/workshop.repository.js', () => ({
  getWorkshopForUpdate: jest.fn(),
  decrementSeats: jest.fn(),
  incrementSeats: jest.fn(),
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
    connect: jest.fn(),
    query: jest.fn()
  }
}));

const repo = await import('../../src/repositories/registration.repository.js');
const workshopRepo = await import('../../src/repositories/workshop.repository.js');
const checkinRepo = await import('../../src/repositories/checkin.repository.js');
const cache = await import('../../src/services/workshop.cache.js');
const pool = (await import('../../src/config/db.js')).default;
const { registerForWorkshop, cancelRegistration } = await import('../../src/services/registration.service.js');

describe('registration.service.js', () => {
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

  describe('registerForWorkshop', () => {
    it('should register successfully', async () => {
      workshopRepo.getWorkshopForUpdate.mockResolvedValue({ id: 1 });
      repo.findRegistrationByStudentAndWorkshop.mockResolvedValue(null);
      workshopRepo.decrementSeats.mockResolvedValue(true);
      repo.createRegistration.mockResolvedValue({ id: 1, status: 'confirmed', workshop_id: 1 });
      workshopRepo.getWorkshopById.mockResolvedValue({ id: 1 });

      const result = await registerForWorkshop(1, 1);
      
      expect(result.registration_id).toBe(1);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(cache.setCachedWorkshop).toHaveBeenCalled();
    });

    it('should throw if workshop is full', async () => {
      workshopRepo.getWorkshopForUpdate.mockResolvedValue({ id: 1 });
      repo.findRegistrationByStudentAndWorkshop.mockResolvedValue(null);
      workshopRepo.decrementSeats.mockResolvedValue(false);

      await expect(registerForWorkshop(1, 1)).rejects.toThrow('Workshop da het cho');
    });

    it('should throw if already registered', async () => {
      workshopRepo.getWorkshopForUpdate.mockResolvedValue({ id: 1 });
      repo.findRegistrationByStudentAndWorkshop.mockResolvedValue({ id: 1, status: 'confirmed' });

      await expect(registerForWorkshop(1, 1)).rejects.toThrow('Ban da dang ky workshop nay');
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel successfully', async () => {
      repo.findRegistrationForCancel.mockResolvedValue({ id: 1, status: 'confirmed', workshop_id: 1 });
      checkinRepo.findCheckinByRegistrationId.mockResolvedValue(null);
      repo.updateRegistrationStatus.mockResolvedValue();
      workshopRepo.incrementSeats.mockResolvedValue();

      const result = await cancelRegistration(1, 1);
      expect(result.status).toBe('cancelled');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw if already checked in', async () => {
      repo.findRegistrationForCancel.mockResolvedValue({ id: 1, status: 'confirmed' });
      checkinRepo.findCheckinByRegistrationId.mockResolvedValue({ id: 1 });

      await expect(cancelRegistration(1, 1)).rejects.toThrow('Khong the huy dang ky da check-in');
    });
  });
});
