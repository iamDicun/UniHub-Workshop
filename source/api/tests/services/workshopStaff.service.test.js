import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: { query: jest.fn() }
}));

const pool = (await import('../../src/config/db.js')).default;
const { getWorkshopStaff, addWorkshopStaff, removeWorkshopStaff } = await import('../../src/services/workshopStaff.service.js');

describe('workshopStaff.service.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addWorkshopStaff', () => {
    it('should add staff successfully', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, role: 'staff' }] });
      pool.query.mockResolvedValueOnce({}); 

      const result = await addWorkshopStaff(1, 'staff@test.com');
      expect(result.success).toBe(true);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('should throw if not staff role', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, role: 'student' }] });

      await expect(addWorkshopStaff(1, 'student@test.com')).rejects.toThrow('Nguoi dung nay khong phai la staff');
    });

    it('should throw if email missing', async () => {
      await expect(addWorkshopStaff(1, null)).rejects.toThrow('Email khong duoc de trong');
    });
  });

  describe('getWorkshopStaff', () => {
    it('should return staff list', async () => {
      const mockRows = [{ id: 1, name: 'Staff' }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await getWorkshopStaff(1);
      expect(result).toEqual(mockRows);
    });
  });

  describe('removeWorkshopStaff', () => {
    it('should remove staff', async () => {
      pool.query.mockResolvedValue({});
      const result = await removeWorkshopStaff(1, 1);
      expect(result.success).toBe(true);
      expect(pool.query).toHaveBeenCalled();
    });
  });
});
