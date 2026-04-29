import { createWorkshop } from './workshop.service.js';
import * as repo from '../repositories/workshop.repository.js';
import * as cache from './workshop.cache.js';
import pool from '../config/db.js';

jest.mock('../repositories/workshop.repository.js');
jest.mock('./workshop.cache.js');
jest.mock('../config/db.js', () => ({
  query: jest.fn()
}));

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
