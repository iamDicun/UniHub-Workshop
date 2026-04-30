import { jest } from '@jest/globals';

const mockEval = jest.fn();
jest.unstable_mockModule('../src/config/redis.js', () => ({
  getRedisClient: jest.fn().mockReturnValue({
    isOpen: true,
    eval: mockEval
  })
}));

const { slidingWindowRateLimiter } = await import('../src/middlewares/rateLimiter.middleware.js');
const { getRedisClient } = await import('../src/config/redis.js');

describe('Sliding Window Rate Limiter Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockEval.mockClear();
    getRedisClient.mockClear();
    getRedisClient.mockReturnValue({
      isOpen: true,
      eval: mockEval
    });

    mockReq = {
      ip: '127.0.0.1',
      originalUrl: '/api/workshops/1/register',
      user: { id: 'user-123' } // Dùng User ID để định danh
    };

    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Cho phép request đi qua nếu kết quả Lua script trả về 1', async () => {
    mockEval.mockResolvedValue([1, 5]); // allowed = 1, remaining = 5

    const middleware = slidingWindowRateLimiter(10, 10000);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockEval).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 5);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('Chặn request trả về lỗi 429 nếu kết quả Lua script trả về 0', async () => {
    mockEval.mockResolvedValue([0, 0]); // allowed = 0, remaining = 0

    const middleware = slidingWindowRateLimiter(2, 10000);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockEval).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Bạn thao tác quá nhanh! Vui lòng thử lại sau giây lát.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Fallback cho qua request (Graceful Degradation) nếu Redis bị sập', async () => {
    getRedisClient.mockReturnValue({
      isOpen: false
    });

    const middleware = slidingWindowRateLimiter(5, 10000);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockEval).not.toHaveBeenCalled();
  });
});
