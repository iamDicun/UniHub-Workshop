import { getRedisClient } from '../config/redis.js';

// Lua script cho thuật toán Sliding Window Log bằng ZSET
// Đảm bảo tính Atomicity (không bị race condition khi đếm request)
const slidingWindowLuaScript = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local random_id = ARGV[4]
  local clearBefore = now - window

  -- Xóa các request đã quá hạn (nằm ngoài cửa sổ thời gian)
  redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
  
  -- Đếm số lượng request hiện tại trong cửa sổ
  local currentCount = redis.call('ZCARD', key)

  if currentCount < limit then
      -- Thêm request mới vào ZSET
      redis.call('ZADD', key, now, random_id)
      -- Set TTL cho key bằng với độ lớn của cửa sổ để tự động dọn rác
      redis.call('EXPIRE', key, math.ceil(window / 1000))
      return { 1, limit - currentCount - 1 } -- Trả về mảng: 1 (Cho phép), Số request còn lại
  else
      return { 0, 0 } -- Trả về mảng: 0 (Từ chối), 0 request còn lại
  end
`;

/**
 * Middleware Rate Limiting sử dụng thuật toán Sliding Window
 * @param {number} limit - Số lượng request tối đa cho phép
 * @param {number} windowMs - Kích thước cửa sổ thời gian (milliseconds)
 */
export const slidingWindowRateLimiter = (limit, windowMs) => {
  return async (req, res, next) => {
    const client = getRedisClient();

    // Fallback: Nếu Redis sập, cho phép đi qua luôn (Graceful Degradation)
    if (!client?.isOpen) {
      return next();
    }

    // Key có thể dựa trên IP (req.ip) hoặc User ID (req.user.id)
    // Ưu tiên User ID cho các endpoint đã đăng nhập
    const identifier = req.user ? req.user.id : req.ip;
    const key = `ratelimit:sliding:${req.originalUrl}:${identifier}`;
    const now = Date.now();
    const randomId = `${now}-${Math.random().toString(36).substring(2)}`;

    try {
      // Gọi Lua script atomically
      const result = await client.eval(
        slidingWindowLuaScript,
        {
          keys: [key],
          arguments: [now.toString(), windowMs.toString(), limit.toString(), randomId]
        }
      );

      const [allowed, remaining] = result;

      // Header chuẩn của Rate Limiting
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      if (allowed === 1) {
        return next();
      } else {
        return res.status(429).json({
          status: 'error',
          message: 'Bạn thao tác quá nhanh! Vui lòng thử lại sau giây lát.'
        });
      }
    } catch (error) {
      console.error('Rate Limiter Error:', error);
      // Fallback cho qua nếu có lỗi eval script
      return next();
    }
  };
};

/**
 * Middleware Global Rate Limiting
 */
export const globalRateLimiter = (limit, windowMs) => {
  return async (req, res, next) => {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return next();
    }

    const key = `ratelimit:global:${req.originalUrl}`;
    const now = Date.now();
    const randomId = `${now}-${Math.random().toString(36).substring(2)}`;

    try {
      const result = await client.eval(
        slidingWindowLuaScript,
        {
          keys: [key],
          arguments: [now.toString(), windowMs.toString(), limit.toString(), randomId]
        }
      );

      const [allowed, remaining] = result;

      if (allowed === 1) {
        return next();
      } else {
        return res.status(429).json({
          status: 'error',
          message: 'Hệ thống đang quá tải, vui lòng thử lại sau.'
        });
      }
    } catch (error) {
      console.error('Global Rate Limiter Error:', error);
      return next();
    }
  };
};
