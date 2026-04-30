import { getChannel } from '../config/rabbitmq.js';

export const QUEUE_NAME = 'notification_queue';

/**
 * Đẩy một tin nhắn đăng ký vào hàng đợi (Queue)
 * @param {Object} payload Dữ liệu cần gửi cho Worker
 */
export const publishRegistrationEvent = async (payload) => {
  const channel = getChannel();
  if (!channel) {
    console.warn('[RabbitMQ] Channel chưa sẵn sàng. Bỏ qua việc gửi thông báo.');
    return;
  }

  try {
    // Đảm bảo queue tồn tại (durable: true để không mất dữ liệu khi RabbitMQ bị restart)
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    const messageBuffer = Buffer.from(JSON.stringify({
      type: 'REGISTRATION_SUCCESS',
      data: payload,
      timestamp: new Date()
    }));

    // Gửi vào Queue
    channel.sendToQueue(QUEUE_NAME, messageBuffer, { persistent: true });
    console.log(`[Producer] Đã gửi event REGISTRATION_SUCCESS vào hàng đợi cho User ID: ${payload.studentId}`);
  } catch (error) {
    console.error('[Producer] Lỗi khi gửi tin nhắn vào Queue:', error);
  }
};
