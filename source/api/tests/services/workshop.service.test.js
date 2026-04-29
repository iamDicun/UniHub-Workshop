import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/workshop.repository.js', () => ({
  createWorkshop: jest.fn(),
  updateWorkshop: jest.fn(),
  deleteWorkshop: jest.fn(),
  getWorkshopById: jest.fn(),
  getWorkshopByIdForUser: jest.fn(),
  listWorkshopsForUser: jest.fn(),
  listWorkshopRegistrations: jest.fn(),
  getUserRegistrationForWorkshop: jest.fn()
}));

jest.unstable_mockModule('../../src/services/workshop.cache.js', () => ({
  getCachedWorkshop: jest.fn(),
  setCachedWorkshop: jest.fn(),
  deleteCachedWorkshop: jest.fn()
}));

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: { query: jest.fn() }
}));

const repo = await import('../../src/repositories/workshop.repository.js');
const cache = await import('../../src/services/workshop.cache.js');
const { createWorkshop } = await import('../../src/services/workshop.service.js');

describe('workshop.service.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkshop', () => {
    it('should create workshop successfully', async () => {
      const payload = {
        title: 'New Workshop',
        capacity: 100,
        start_time: '2026-05-01T10:00:00Z',
        end_time: '2026-05-01T12:00:00Z',
        price: 0
      };
      const adminId = 1;

      repo.createWorkshop.mockResolvedValue({ id: 1, ...payload });
      cache.setCachedWorkshop.mockResolvedValue();

      const result = await createWorkshop(payload, adminId);
      
      expect(repo.createWorkshop).toHaveBeenCalled();
      expect(cache.setCachedWorkshop).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should throw error if title is missing', async () => {
      const payload = {
        capacity: 100,
        start_time: '2026-05-01T10:00:00Z',
        end_time: '2026-05-01T12:00:00Z'
      };

      await expect(createWorkshop(payload, 1)).rejects.toThrow('Vui long nhap tieu de workshop');
    });

    it('should throw error if end time is before start time', async () => {
      const payload = {
        title: 'Test',
        capacity: 100,
        start_time: '2026-05-01T12:00:00Z',
        end_time: '2026-05-01T10:00:00Z'
      };

      await expect(createWorkshop(payload, 1)).rejects.toThrow('Thoi gian ket thuc phai sau thoi gian bat dau');
    });
  });
});
