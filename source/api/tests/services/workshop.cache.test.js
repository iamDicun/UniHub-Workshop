import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/redis.js', () => ({
  getRedisClient: jest.fn(),
}));

const { getRedisClient } = await import('../../src/config/redis.js');
const { calculateCacheTTL, getCachedWorkshop, setCachedWorkshop, deleteCachedWorkshop } = await import('../../src/services/workshop.cache.js');

describe('workshop.cache.js', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      isOpen: true,
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
    };
    getRedisClient.mockReturnValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCacheTTL', () => {
    it('should calculate TTL correctly for newly created workshop', () => {
      const now = new Date();
      const workshop = {
        created_at: now.toISOString(),
        start_time: new Date(now.getTime() + 86400000).toISOString(),
        end_time: new Date(now.getTime() + 90000000).toISOString()
      };
      
      const ttl = calculateCacheTTL(workshop);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });
  });

  describe('getCachedWorkshop', () => {
    it('should return parsed workshop data if exists', async () => {
      const mockWorkshop = { id: 1, title: 'Test' };
      mockClient.get.mockResolvedValue(JSON.stringify(mockWorkshop));

      const result = await getCachedWorkshop(1);
      expect(mockClient.get).toHaveBeenCalledWith('workshop:1');
      expect(result).toEqual(mockWorkshop);
    });

    it('should return null if redis client is closed', async () => {
      mockClient.isOpen = false;
      const result = await getCachedWorkshop(1);
      expect(result).toBeNull();
    });
  });
  
  describe('setCachedWorkshop', () => {
    it('should set cache with TTL', async () => {
      const now = new Date();
      const workshop = {
        id: 1,
        created_at: now.toISOString(),
        start_time: new Date(now.getTime() + 86400000).toISOString(),
        end_time: new Date(now.getTime() + 90000000).toISOString()
      };

      await setCachedWorkshop(workshop);
      expect(mockClient.setEx).toHaveBeenCalled();
      expect(mockClient.setEx.mock.calls[0][0]).toBe('workshop:1');
    });
  });

  describe('deleteCachedWorkshop', () => {
    it('should call del on redis client', async () => {
      await deleteCachedWorkshop(1);
      expect(mockClient.del).toHaveBeenCalledWith('workshop:1');
    });
  });
});
