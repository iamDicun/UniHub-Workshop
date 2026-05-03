import CircuitBreaker from 'opossum';
import payos from '../config/payos.js';

// Cấu hình Circuit Breaker cho cổng thanh toán PayOS
const options = {
  timeout: 10000, // Nếu gọi PayOS quá 10 giây -> Timeout (Failed)
  errorThresholdPercentage: 50, // Nếu 50% số request bị lỗi
  resetTimeout: 30000 // Chờ 30 giây (Open) trước khi thử lại (Half-Open)
};

// Hàm async thực hiện gọi PayOS
const createPaymentLinkAction = async (body) => {
  return await payos.paymentRequests.create(body);
};

// Khởi tạo Circuit Breaker
export const payosCircuitBreaker = new CircuitBreaker(createPaymentLinkAction, options);

// Lắng nghe các event để giám sát trạng thái
payosCircuitBreaker.on('open', () => console.warn('[Circuit Breaker] PayOS API is DOWN (Trạng thái: OPEN). Chặn các request tiếp theo.'));
payosCircuitBreaker.on('halfOpen', () => console.info('[Circuit Breaker] PayOS API is recovering (Trạng thái: HALF-OPEN). Đang thử gọi lại...'));
payosCircuitBreaker.on('close', () => console.info('[Circuit Breaker] PayOS API is UP (Trạng thái: CLOSED). Hoạt động bình thường.'));
payosCircuitBreaker.on('fallback', () => console.warn('[Circuit Breaker] Đã dùng Fallback (Graceful Degradation).'));

// Fallback: Khi Circuit Open hoặc Timeout, ném ra lỗi để Service xử lý Graceful Degradation
payosCircuitBreaker.fallback((body, error) => {
  if (error) {
    console.error('[Circuit Breaker] LỖI GỐC TỪ PAYOS:', error);
    const err = new Error(`Lỗi từ PayOS: ${error.message || 'Không rõ nguyên nhân'}`);
    err.isCircuitBreakerFallback = true;
    err.originalError = error.message;
    throw err;
  }
});
